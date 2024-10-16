const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { generateRandomCode, getDistanceFromLatLonInMeters } = require("../helpers");

// Register
const register = async (req, res, next) => {
  try {
    const { deviceId } = req.body;
    const code = generateRandomCode();

    const user = await User.create({ deviceId, code });

    res.status(StatusCodes.CREATED).json({ user });
  } catch (error) {
    next(error);
  }
};

// Add Tracker
const addTracker = async (req, res, next) => {
  try {
    const { deviceId, code, nickname } = req.body;

    // Kendi kullanıcı bilgilerini deviceId ile bul
    const user = await User.findOne({ deviceId });
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    // Takip edilecek kullanıcıyı code ile bul
    const tracker = await User.findOne({ code });
    if (!tracker) {
      throw new CustomError.NotFoundError("Takip Edeceğiniz Kullanıcı bulunamadı");
    }

    // Kendi following listesine takip edilecek kullanıcıyı ve takma adını ekle
    user.following.push({ userId: tracker._id, nickname });
    await user.save();

    // Takip edilecek kullanıcının followers listesine kendi userId'ni ekle
    tracker.followers.push(user._id);
    await tracker.save();

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    next(error);
  }
};

// Update Location
const updateLocation = async (req, res, next) => {
  try {
    const { deviceId, latitude, longitude } = req.body;

    const user = await User.findOne({ deviceId });
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    user.currentLocation = { latitude, longitude, timestamp: new Date() };
    await user.save();

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    next(error);
  }
};

// Get Following Locations
const getFollowingLocations = async (req, res, next) => {
  try {
    const { deviceId } = req.body;

    // Kendi kullanıcı bilgilerini deviceId ile bul
    const user = await User.findOne({ deviceId }).populate('following.userId', 'currentLocation');
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    // Takip edilen kullanıcıların currentLocation verilerini al
    const followingLocations = user.following.map(following => ({
      userId: following.userId._id,
      nickname: following.nickname,
      currentLocation: following.userId.currentLocation
    }));

    res.status(StatusCodes.OK).json({ followingLocations });
  } catch (error) {
    next(error);
  }
};

// Toggle Visibility
const toggleVisibility = async (req, res, next) => {
  try {
    const { deviceId, visibility } = req.body;

    const user = await User.findOne({ deviceId });
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    user.visibility = visibility;
    await user.save();

    // Log kaydet
    const action = visibility ? "Görünürlüğünü açtı" : "Görünürlüğünü kapattı";
    await logAction(user._id, action);

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    next(error);
  }
};

// Add Zone
const addZone = async (req, res, next) => {
  try {
    const { deviceId, title, latitude, longitude, zoneRadius } = req.body;

    const user = await User.findOne({ deviceId });
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    const newZone = {
      title,
      coordinates: { latitude, longitude },
      zoneRadius
    };

    user.zones.push(newZone);
    await user.save();

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    next(error);
  }
};

// Check Zone
const checkZone = async (req, res, next) => {
  try {
    const { deviceId } = req.body;

    const user = await User.findOne({ deviceId }).populate('following.userId');
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    user.following.forEach(async following => {
      const { latitude, longitude } = following.userId.currentLocation;

      following.userId.zones.forEach(async zone => {
        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          zone.coordinates.latitude,
          zone.coordinates.longitude
        );

        if (distance <= zone.zoneRadius) {
          // Bildirim gönder
          sendNotification(user.deviceId, `User ${following.userId.deviceId} entered zone ${zone.title}`);
          // Log kaydet
          await logAction(user._id, `User ${following.userId.deviceId} entered zone ${zone.title}`);
        } else {
          // Bildirim gönder
          sendNotification(user.deviceId, `User ${following.userId.deviceId} exited zone ${zone.title}`);
          // Log kaydet
          await logAction(user._id, `User ${following.userId.deviceId} exited zone ${zone.title}`);
        }
      });
    });

    res.status(StatusCodes.OK).json({ message: "Zone checked" });
  } catch (error) {
    next(error);
  }
};

// Log Action
const logAction = async (userId, action) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    user.logs.push({ action });
    await user.save();
  } catch (error) {
    console.error("Log kaydedilemedi:", error);
  }
};

// Get Log
const getLog = async (req, res, next) => {
  try {
    const { deviceId } = req.body;

    // Kendi kullanıcı bilgilerini deviceId ile bul
    const user = await User.findOne({ deviceId }).populate('following.userId', 'logs');
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    // Takip edilen kullanıcıların log verilerini al
    const followingLogs = user.following.map(following => ({
      userId: following.userId._id,
      nickname: following.nickname,
      logs: following.userId.logs
    }));

    res.status(StatusCodes.OK).json({ followingLogs });
  } catch (error) {
    next(error);
  }
};

// Helper function to send notification
const sendNotification = (deviceId, message) => {
  // OneSignal API ile bildirim gönderme işlemi
};

module.exports = {
  register,
  addTracker,
  updateLocation,
  getFollowingLocations,
  toggleVisibility,
  addZone,
  checkZone,
  logAction,
  getLog
};