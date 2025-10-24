const admin = require("firebase-admin");

const buildAppointmentFromDoc = (doc) => {
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
    scheduledTime: doc.data().scheduledTime.toDate(),
    selectedBarber: {
      ...doc.data().selectedBarber,
      createdAt: doc.data().selectedBarber.createdAt.toDate(),
      updatedAt: doc.data().selectedBarber.updatedAt.toDate(),
    },
  };
};

const appointmentService = {
  async getAllAppointmentsByBarber(barberId) {
    try {
      const db = admin.firestore();
      const appointmentsSnapshot = await db
        .collection("barbers")
        .doc(barberId)
        .collection("appointments")
        .orderBy("scheduledTime", "desc")
        .limit(50)
        .get();

      if (appointmentsSnapshot.empty) {
        return [];
      }

      return appointmentsSnapshot.docs.map((doc) =>
        buildAppointmentFromDoc(doc)
      );
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      throw new Error("Erro ao carregar agendamentos. Tente novamente.");
    }
  },

  getAppointmentsBetweenDates: async (barberId, startDate, endDate) => {
    try {
      const db = admin.firestore();
      const appointmentsSnapshot = await db
        .collection("barbers")
        .doc(barberId)
        .collection("appointments")
        .where("scheduledTime", ">=", startDate)
        .where("scheduledTime", "<=", endDate)
        .orderBy("scheduledTime", "desc")
        .get();

      if (appointmentsSnapshot.empty) {
        return [];
      }

      return appointmentsSnapshot.docs.map((doc) =>
        buildAppointmentFromDoc(doc)
      );
    } catch (err) {
      console.error("Erro ao buscar agendamentos entre datas:", err);
      throw new Error("Erro ao carregar agendamentos. Tente novamente.");
    }
  },

  createAppointment: async (barberId, appointmentData) => {
    try {
      const db = admin.firestore();
      const appointmentRef = await db
        .collection("barbers")
        .doc(barberId)
        .collection("appointments")
        .add({
          ...appointmentData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return { id: appointmentRef.id, ...appointmentData };
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      throw new Error("Erro ao criar agendamento. Tente novamente.");
    }
  },
};

module.exports = appointmentService;
