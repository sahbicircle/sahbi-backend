const express = require("express");
const router = express.Router();
const {
  getMe,
  updateMe,
  savePushToken,
} = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.post("/push-token", authMiddleware, savePushToken);

module.exports = router;
