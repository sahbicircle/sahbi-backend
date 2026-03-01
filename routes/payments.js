const express = require("express");
const router = express.Router();
const { createTicketIntent } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/ticket-intent", authMiddleware, createTicketIntent);

module.exports = router;
