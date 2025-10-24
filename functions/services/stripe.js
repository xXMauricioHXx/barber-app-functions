const { getStripe } = require("../lib/stripe");

const stripeService = {
  retrieveCustomer: async (customerId) => {
    try {
      const stripe = getStripe();
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      console.error("Error retrieving customer:", error);
      throw new Error("Error retrieving customer");
    }
  },

  retrieveSubscription: async (subscriptionId) => {
    try {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error("Error retrieving subscription:", error);
      throw new Error("Error retrieving subscription");
    }
  },
};

module.exports = stripeService;
