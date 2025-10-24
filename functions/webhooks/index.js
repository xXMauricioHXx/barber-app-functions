const { onRequest } = require("firebase-functions/v2/https");
const clientService = require("../services/client");
const barberService = require("../services/barber");
const { getStripe, stripeSecretKey, endpointSecret } = require("../lib/stripe");

const handleCheckoutSessionCompleted = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const data = req.body.data.object;

  const clientId = data.client_reference_id;
  const stripeSubscriptionId = data.subscription;
  const stripeCustomerId = data.customer;
  const checkoutStatus = data.status;
  const barberId = data.metadata.barberId;

  if (checkoutStatus !== "complete") {
    return res.status(200).send("Webhook processed");
  }

  if (!clientId || !stripeSubscriptionId || !stripeCustomerId || !barberId) {
    return res.status(400).send("Missing parameters");
  }

  console.log("Checking for customer with clientId:", clientId);
  const customer = await clientService.getClientById(clientId);

  console.log("Customer found:", customer);

  if (!customer) {
    return res.status(404).send("Customer not found");
  }

  await clientService.updateClient(clientId, {
    stripeSubscriptionId,
    stripeCustomerId,
    paymentStatus: "active",
    selectedBarbersId: [...(customer.selectedBarbersId || []), barberId],
  });

  const customerData = {
    id: customer.uid,
    name: customer.name,
    nickname: customer.nickname,
    phone: customer.phone,
    email: customer.email,
    plan: customer.plan,
    planExpiryDate: customer.planExpiryDate,
    paymentStatus: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await barberService.addClientToBarber(barberId, customerData);

  res.status(200).send("Webhook processed");
});

const handleSubscriptionSessionCompleted = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const products = {
    prod_TGFrcOJ0vmO5JP: "Premium+",
    prod_TGFqhMiirMnV0O: "Premium",
    prod_TGFp3CyIweAYIg: "Básico",
  };

  const data = req.body.data.object;
  const subscriptionId = data.id;
  const stripeCustomerId = data.customer;
  const subscriptionStatus = data.status;
  const productId = data.items.data[0].price.product;
  const endOfSubscription = data.items.data[0].current_period_end;
  const productName = products[productId] || "Não Selecionado";

  if (!stripeCustomerId || !productId) {
    return res.status(400).send("Missing parameters");
  }

  const client = await clientService.getClientByStripeCustomerId(
    stripeCustomerId
  );

  if (!client) {
    return res.status(404).send("Client not found");
  }

  await clientService.updateClient(client.uid, {
    plan: productName,
    stripeSubscriptionId: subscriptionId,
    planExpiryDate: new Date(endOfSubscription * 1000),
    paymentStatus: subscriptionStatus === "active" ? "active" : "inactive",
  });

  res.status(200).send("Webhook processed");
});

const handleCancelPlan = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  console.log("Handling cancel plan webhook");
  const data = req.body.data.object;

  const stripeCustomerId = data.customer;

  console.log("Checking for customer with stripeCustomerId:", stripeCustomerId);

  if (!stripeCustomerId) {
    return res.status(400).send("Missing parameters");
  }

  const client = await clientService.getClientByStripeCustomerId(
    stripeCustomerId
  );

  if (!client) {
    return res.status(404).send("Client not found");
  }

  console.log("Client found:", client);

  const barberId = client?.selectedBarbersId[0];

  console.log("Barber ID found:", barberId);

  if (barberId) {
    await barberService.removeClientFromBarber(barberId, client.uid);
  }

  console.log("Updating client to cancel plan:", client.uid);

  await clientService.updateClient(client.uid, {
    plan: "Não Selecionado",
    planExpiryDate: null,
    stripeSubscriptionId: null,
    paymentStatus: "inactive",
    selectedBarbersId: [],
  });

  res.status(200).send("Webhook processed");
});

const webhookHandlers = onRequest(
  { secrets: [stripeSecretKey, endpointSecret] },
  async (req, res) => {
    console.log("Received webhook:", req.body);
    let event = req.body;
    console.log("Header stripe-signature:", req.headers["stripe-signature"]);
    console.log("Headers", JSON.stringify(req.headers, null, 2));
    const stripe = getStripe(stripeSecretKey);

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        endpointSecret.value()
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(req, res);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionSessionCompleted(req, res);
        break;
      case "customer.subscription.deleted":
        await handleCancelPlan(req, res);
        break;
      default:
        res.status(200).send("Event type not handled");
    }
  }
);

module.exports = {
  webhookHandlers,
};
