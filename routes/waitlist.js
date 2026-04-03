const express = require("express");
const router = express.Router();
const { createWaitlistEntry } = require("../controllers/waitlistController");

router.post("/", createWaitlistEntry);

module.exports = router;
