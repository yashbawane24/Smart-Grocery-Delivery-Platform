const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Amount is expected in the smallest currency unit (e.g. paise for INR).
const createPaymentIntent = async ({ amount, currency = "inr", metadata = {} }) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
};

const verifyWebhookSignature = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

module.exports = { stripe, createPaymentIntent, verifyWebhookSignature };
