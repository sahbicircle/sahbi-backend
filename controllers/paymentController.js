const paymentService = require("../services/paymentService");

exports.createTicketIntent = async (req, res) => {
  try {
    const { eventId, withPlusOne } = req.body;
    if (!eventId) return res.status(400).json({ message: "eventId required" });
    const result = await paymentService.createTicketPaymentIntent(
      req.user.id,
      eventId,
      { withPlusOne: Boolean(withPlusOne) }
    );
    res.json(result);
  } catch (err) {
    console.error("createTicketIntent error:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to create payment intent" });
  }
};
