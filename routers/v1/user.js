const express = require("express");
const {
  register,
  loadUser,
  addTracker,
  updateLocation,
  getFollowingLocations,
  toggleVisibility,
  addZone,
  checkZone,
  getLog,
} = require("../../controllers/v1/user");

const router = express.Router();

router.post("/register", register);
router.get("/load-user/:deviceId", loadUser); 
router.post("/add-tracker", addTracker); 
router.put("/update-location", updateLocation); 
router.get("/following-locations/:deviceId", getFollowingLocations); 
router.patch("/toggle-visibility", toggleVisibility); 
router.post("/add-zone", addZone);
router.post("/check-zone", checkZone); 
router.get("/get-log", getLog); 

module.exports = router;