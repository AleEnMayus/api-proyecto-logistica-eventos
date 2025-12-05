// controllers/profileController.js
const { getProfileById, updateProfile } = require("../models/Profile");

/**
 * Maneja la solicitud para obtener un perfil de usuario.
 */
exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await getProfileById(userId);
    if (!profile) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

/**
 * Maneja la solicitud para actualizar un perfil de usuario.
 */
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const dataToUpdate = req.body;

  try {
    const affectedRows = await updateProfile(userId, dataToUpdate);

    if (affectedRows === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado o no se proporcionaron datos para actualizar."
      });
    }

    // Volvemos a obtener el perfil actualizado
    const updatedProfile = await getProfileById(userId);

    // Respondemos con el objeto actualizado
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
