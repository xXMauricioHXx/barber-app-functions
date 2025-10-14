const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.hello = onRequest({ region: "us-central1" }, (req, res) => {
  const name = req.query.name || "Mundo";
  res.status(200).send(`Hello ${name}`);
});

const appointmentFunctions = require("./appointments");

exports.appointments = appointmentFunctions;
