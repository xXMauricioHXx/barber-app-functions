const { onRequest } = require("firebase-functions/v2/https");
const appointmentService = require("../services/appointments");

const getBarberAppointments = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    try {
      const { barberId } = req.query;
      const appointments = await appointmentService.getAllAppointmentsByBarber(
        barberId
      );

      res.status(200).send(appointments);
    } catch (error) {
      console.error("Erro ao buscar todos os agendamentos:", error);
      throw new Error("Erro ao carregar agendamentos. Tente novamente.");
    }
  }
);

module.exports = {
  getBarberAppointments,
};
