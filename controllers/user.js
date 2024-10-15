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
      throw new CustomError.NotFoundError("User not found");
    }

    // Takip edilecek kullanıcıyı code ile bul
    const tracker = await User.findOne({ code });
    if (!tracker) {
      throw new CustomError.NotFoundError("Tracker not found");
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
    const { code, latitude, longitude } = req.body;

    const user = await User.findOne({ code });
    if (!user) {
      throw new CustomError.NotFoundError("User not found");
    }

    user.currentLocation = { latitude, longitude, timestamp: new Date() };
    await user.save();

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    next(error);
  }
};

// Toggle Visibility
const toggleVisibility = async (req, res, next) => {
  try {
    const { code, visibility } = req.body;

    const user = await User.findOne({ code });
    if (!user) {
      throw new CustomError.NotFoundError("User not found");
    }

    user.visibility = visibility;
    await user.save();

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    next(error);
  }
};

// Check Zone
const checkZone = async (req, res, next) => {
  try {
    const { code, latitude, longitude } = req.body;

    const user = await User.findOne({ code });
    if (!user) {
      throw new CustomError.NotFoundError("User not found");
    }

    user.zones.forEach(zone => {
      const distance = getDistanceFromLatLonInMeters(
        latitude,
        longitude,
        zone.coordinates.latitude,
        zone.coordinates.longitude
      );

      if (distance <= zone.zoneRadius) {
        // Bildirim gönder
        sendNotification(user.trackers, `User ${user.code} entered zone ${zone.title}`);
      }
    });

    res.status(StatusCodes.OK).json({ message: "Zone checked" });
  } catch (error) {
    next(error);
  }
};

// Log Action
const logAction = async (req, res, next) => {
  try {
    const { code, action } = req.body;

    const user = await User.findOne({ code });
    if (!user) {
      throw new CustomError.NotFoundError("User not found");
    }

    user.logs.push({ action, date: new Date() });
    await user.save();

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    next(error);
  }
};

// Helper function to send notification
const sendNotification = (trackers, message) => {
  // OneSignal API ile bildirim gönderme işlemi
};

module.exports = {
  register,
  addTracker,
  updateLocation,
  toggleVisibility,
  checkZone,
  logAction,
};