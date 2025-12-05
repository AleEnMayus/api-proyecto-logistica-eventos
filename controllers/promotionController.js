// controllers/promotionsController.js
const Promotions = require("../models/Promotion");

module.exports = {
  getAll: async (req, res) => {
    try {
      const promos = await Promotions.getAll();
      res.json(promos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error obteniendo promociones" });
    }
  },

  getById: async (req, res) => {
    try {
      const promo = await Promotions.getById(req.params.id);
      res.json(promo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error obteniendo promoción" });
    }
  },

  create: async (req, res) => {
    try {
      const newPromo = await Promotions.create(req.body);
      res.json({ message: "Promoción creada", data: newPromo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creando promoción" });
    }
  },

  update: async (req, res) => {
    try {
      await Promotions.update(req.body);
      res.json({ message: "Promoción actualizada" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error actualizando promoción" });
    }
  },

  delete: async (req, res) => {
    try {
      await Promotions.delete(req.params.id);
      res.json({ message: "Promoción eliminada" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error eliminando promoción" });
    }
  }
};
