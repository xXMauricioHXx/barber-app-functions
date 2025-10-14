const { onRequest } = require("firebase-functions/https");

const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.hello = onRequest(async (req, res) => {
  const name = req.query.name;

  res.status(200).send(`Hello ${name}`);
});
