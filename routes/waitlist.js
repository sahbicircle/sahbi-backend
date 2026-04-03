const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { getAllWaitlistEntries } = require("../controllers/adminController");
const { createWaitlistEntry } = require("../controllers/waitlistController");

router.post("/", createWaitlistEntry);
// Same data as GET /api/admin/waitlist — requires admin JWT
router.get("/", adminMiddleware, getAllWaitlistEntries);

module.exports = router;
