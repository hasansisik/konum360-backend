const express = require("express");
const {
  register,
  addTracker,
  updateLocation,
  getFollowingLocations,
  toggleVisibility,
  addZone,
  checkZone,
  getLog
} = require("../../controllers/user");

const router = express.Router();

router.post("/register", register);
router.post("/add-tracker", addTracker);
router.post("/update-location", updateLocation);
router.post("/get-following-locations", getFollowingLocations);
router.post("/toggle-visibility", toggleVisibility);
router.post("/add-zone", addZone);
router.post("/check-zone", checkZone);
router.post("/get-log", getLog);

module.exports = router;