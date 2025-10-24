const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

let app;
try {
  app = initializeApp({
    credential: applicationDefault(),
  });
} catch (error) {
  console.log("Firebase já inicializado, reutilizando instância.");
}

const auth = getAuth();
const db = getFirestore();

module.exports = {
  auth,
  db,
};
