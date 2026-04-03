const Stripe = require("stripe");
const Event = require("../models/Event");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

exports.createPaymentIntent = async (userId, amount) => {
  if (!stripe) throw new Error("Stripe not configured");
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "mad",
    metadata: { userId },
  });
  return paymentIntent.client_secret;
};

exports.createTicketPaymentIntent = async (userId, eventId, options = {}) => {
  const { withPlusOne = false } = options;
  const event = await Event.findById(eventId).select("price premiumPrice title");
  if (!event) throw new Error("Event not found");
  const basePrice = Number(event.price) || 0;
  const premiumPrice = Number(event.premiumPrice) || basePrice;
  const amountMAD = withPlusOne ? Math.max(0, premiumPrice) : Math.max(0, basePrice);
  if (amountMAD < 1) return { clientSecret: null, paymentIntentId: null, amount: 0, free: true };
  if (!stripe) throw new Error("Stripe not configured");
  const amount = Math.round(amountMAD * 100);
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "mad",
    metadata: { userId, eventId, type: "ticket", withPlusOne: String(withPlusOne) },
  });
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: amountMAD,
    free: false,
  };
};

exports.verifyPaymentIntent = async (paymentIntentId) => {
  if (!stripe) return null;
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  return pi.status === "succeeded";
};
