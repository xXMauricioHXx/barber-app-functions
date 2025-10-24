const { onRequest } = require("firebase-functions/v2/https");
const clientService = require("../services/client");

const findById = onRequest({ region: "us-central1" }, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Parâmetro 'id' é obrigatório",
      });
    }

    const client = await clientService.getClientById(id);

    if (!client) {
      return res.status(404).json({
        error: "Cliente não encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Erro na função getClientById:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

const getAll = onRequest({ region: "us-central1" }, async (req, res) => {
  try {
    const { maxResults = 10, pageToken } = req.query;
    const maxResultsNum = parseInt(maxResults);

    if (maxResultsNum > 1000) {
      return res.status(400).json({
        error: "maxResults não pode ser maior que 1000",
      });
    }

    const result = await clientService.listClients(maxResultsNum, pageToken);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erro na função getAll:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

module.exports = {
  getClientById: findById,
  getAll,
};
