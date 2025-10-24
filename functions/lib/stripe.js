const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const endpointSecret = defineSecret("STRIPE_ENDPOINT_SECRET");
const getStripe = (param) => {
  return new Stripe(param.value());
};

module.exports = {
  getStripe,
  stripeSecretKey,
  endpointSecret,
};
