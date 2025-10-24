const { initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");

initializeApp();

exports.hello = onRequest({ region: "us-central1" }, (req, res) => {
  const name = req.query.name || "Mundo";
  res.status(200).send(`Hello ${name}`);
});

const appointmentFunctions = require("./appointments");
const clientFunctions = require("./client");
const webhookFunctions = require("./webhooks");

exports.appointments = appointmentFunctions;
exports.clients = clientFunctions;
exports.webhooks = webhookFunctions;
