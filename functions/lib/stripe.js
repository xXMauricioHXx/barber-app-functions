const { defineSecret } = require("firebase-functions/params");
const Stripe = require("stripe");

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

// Função para obter a instância do Stripe
// O secret só pode ser acessado em runtime, não durante o deployment
const getStripe = () => {
  return new Stripe(stripeSecretKey.value());
};

module.exports = {
  getStripe,
  stripeSecretKey,
};
