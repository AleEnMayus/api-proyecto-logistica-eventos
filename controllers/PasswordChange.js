const bcrypt = require("bcrypt");
const User = require("../models/auth"); // EL MISMO MODELO QUE LOGIN

const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    // Buscar usuario usando el MISMO modelo que login
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Comparar contraseñas usando el MISMO método que login
    const passwordMatch = await User.comparePassword(currentPassword, user.Password);
    if (!passwordMatch) return res.status(401).json({ message: "Current password is incorrect" });

    // Hashear y actualizar usando el MISMO modelo
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, newPasswordHash);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
};

module.exports = { changePassword };