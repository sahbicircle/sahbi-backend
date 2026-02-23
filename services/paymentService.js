const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (userId, amount) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "mad",
    metadata: { userId },
  });
  return paymentIntent.client_secret;
};
