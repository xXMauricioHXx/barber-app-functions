const { onRequest } = require("firebase-functions/v2/https");

exports.createAppointment = onRequest({ region: "us-central1" }, (req, res) => {
  res.status(201).send({ message: "Agendamento criado com sucesso!" });
});

exports.listAppointments = onRequest({ region: "us-central1" }, (req, res) => {
  res.status(200).send([{ id: "1", date: "2025-10-15" }]);
});
