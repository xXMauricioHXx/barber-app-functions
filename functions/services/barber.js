const admin = require("firebase-admin");

const barberService = {
  getBarberById: async (barberId) => {
    try {
      const db = admin.firestore();
      const barberDoc = await db.collection("barbers").doc(barberId).get();

      if (!barberDoc.exists) {
        return null;
      }

      return {
        uid: barberDoc.id,
        ...barberDoc.data(),
      };
    } catch (error) {
      console.error("Erro ao buscar barbeiro por ID:", error);
      throw new Error("Erro ao buscar barbeiro por ID");
    }
  },

  async addClientToBarber(barberId, clientData) {
    try {
      const db = admin.firestore();
      const barberRef = db.collection("barbers").doc(barberId);

      //Criar novo cliente dentro de barbers->barberId->clients
      const clientRef = barberRef.collection("clients").doc(clientData.id);

      await clientRef.set({
        ...clientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Erro ao adicionar cliente à barbearia:", error);
      throw new Error("Erro ao associar cliente à barbearia. Tente novamente.");
    }
  },

  async removeClientFromBarber(barberId, clientId) {
    try {
      const db = admin.firestore();
      const barberRef = db.collection("barbers").doc(barberId);
      const clientRef = barberRef.collection("clients").doc(clientId);

      await clientRef.delete();
    } catch (error) {
      console.error("Erro ao remover cliente da barbearia:", error);
      throw new Error("Erro ao remover cliente da barbearia. Tente novamente.");
    }
  },
};

module.exports = barberService;
