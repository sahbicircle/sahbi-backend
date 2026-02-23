const express = require("express");
const multer = require("multer");
const router = express.Router();
const { verifyFace } = require("../controllers/facialController");
const authMiddleware = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/verify", authMiddleware, upload.single("photo"), verifyFace);

module.exports = router;
