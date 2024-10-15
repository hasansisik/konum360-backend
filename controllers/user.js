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
    const { deviceId, code } = req.body;

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

    // Kendi following listesine takip edilecek kullanıcıyı ekle
    user.following.push(tracker._id);
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
    const user = await User.findOne({ deviceId }).populate('following', 'currentLocation');
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    // Takip edilen kullanıcıların currentLocation verilerini al
    const followingLocations = user.following.map(followingUser => ({
      userId: followingUser._id,
      currentLocation: followingUser.currentLocation
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

    const user = await User.findOne({ deviceId }).populate('following');
    if (!user) {
      throw new CustomError.NotFoundError("Kullanıcı bulunamadı");
    }

    user.following.forEach(followingUser => {
      const { latitude, longitude } = followingUser.currentLocation;

      followingUser.zones.forEach(zone => {
        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          zone.coordinates.latitude,
          zone.coordinates.longitude
        );

        if (distance <= zone.zoneRadius) {
          // Bildirim gönder
          sendNotification(user.deviceId, `User ${followingUser.deviceId} entered zone ${zone.title}`);
        } else {
          // Bildirim gönder
          sendNotification(user.deviceId, `User ${followingUser.deviceId} exited zone ${zone.title}`);
        }
      });
    });

    res.status(StatusCodes.OK).json({ message: "Zone checked" });
  } catch (error) {
    next(error);
  }
};

// Log Action
const logAction = async (req, res, next) => {

};

// Helper function to send notification
const sendNotification = (trackers, message) => {
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
};