const express = require("express");
const router = express.Router();
const {
  getUserTrust,
  addTrustScore,
} = require("../controllers/trustController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getUserTrust);
router.post("/add", authMiddleware, addTrustScore);

module.exports = router;
