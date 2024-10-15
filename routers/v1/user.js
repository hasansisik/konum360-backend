const express = require("express");
const {
  register,
  addTracker,
  updateLocation,
  toggleVisibility,
  checkZone,
  logAction,
} = require("../../controllers/user");

const router = express.Router();

router.post("/register", register);
router.post("/add-tracker", addTracker);
router.post("/update-location", updateLocation);
router.post("/toggle-visibility", toggleVisibility);
router.post("/check-zone", checkZone);
router.post("/log-action", logAction);

module.exports = router;