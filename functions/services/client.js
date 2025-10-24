const admin = require("firebase-admin");

const clientService = {
  getClientById: async (uid) => {
    try {
      const db = admin.firestore();
      const clientDoc = await db.collection("clients").doc(uid).get();

      if (!clientDoc.exists) {
        return null;
      }

      const clientData = clientDoc.data();
      return {
        uid: clientDoc.id,
        ...clientData,
      };
    } catch (error) {
      console.error("Erro ao buscar cliente por ID:", error);
      throw new Error("Erro ao buscar dados do cliente");
    }
  },

  listClients: async (limit = 10) => {
    try {
      const db = admin.firestore();
      let query = db.collection("clients").limit(limit);

      const snapshot = await query.get();

      const clients = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasNextPage = snapshot.docs.length === limit;

      return {
        clients,
        lastDocId: lastDoc ? lastDoc.id : null,
        hasNextPage,
      };
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      throw new Error("Erro ao listar clientes");
    }
  },

  createClient: async (clientData) => {
    try {
      const db = admin.firestore();
      const clientRef = db.collection("clients").doc();

      const newClient = {
        ...clientData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await clientRef.set(newClient);

      return {
        uid: clientRef.id,
        ...clientData,
      };
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw new Error("Erro ao criar cliente");
    }
  },

  updateClient: async (uid, updateData) => {
    try {
      const db = admin.firestore();
      const clientRef = db.collection("clients").doc(uid);

      const updatePayload = {
        ...updateData,
        updatedAt: new Date(),
      };

      await clientRef.update(updatePayload);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw new Error("Erro ao atualizar cliente");
    }
  },

  deleteClient: async (uid) => {
    try {
      const db = admin.firestore();
      await db.collection("clients").doc(uid).delete();
      return { success: true, uid };
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      throw new Error("Erro ao deletar cliente");
    }
  },

  searchClientsByEmail: async (email) => {
    try {
      const db = admin.firestore();
      const snapshot = await db
        .collection("clients")
        .where("email", "==", email)
        .get();

      const clients = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      return clients[0] || null;
    } catch (error) {
      console.error("Erro ao buscar cliente por email:", error);
      throw new Error("Erro ao buscar cliente por email");
    }
  },

  getClientByStripeCustomerId: async (stripeCustomerId) => {
    try {
      const db = admin.firestore();
      const snapshot = await db
        .collection("clients")
        .where("stripeCustomerId", "==", stripeCustomerId)
        .get();

      const clients = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      return clients[0] || null;
    } catch (error) {
      console.error("Erro ao buscar cliente por Stripe Customer ID:", error);
      throw new Error("Erro ao buscar cliente por Stripe Customer ID");
    }
  },
};

module.exports = clientService;
