// models/Promotions.js
const db = require("../db");

class Promotions {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM Promotions");
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM Promotions WHERE PromotionId = ?", [id]);
    return rows[0];
  }

  static async create({ TitleProm, DescriptionProm, Price }) {
    const [result] = await db.query(
      "INSERT INTO Promotions (TitleProm, DescriptionProm, Price) VALUES (?, ?, ?)",
      [TitleProm, DescriptionProm, Price]
    );
    return { PromotionId: result.insertId, TitleProm, DescriptionProm, Price };
  }

  static async update({ PromotionId, TitleProm, DescriptionProm, Price }) {
    await db.query(
      `UPDATE Promotions 
       SET TitleProm = ?, DescriptionProm = ?, Price = ? 
       WHERE PromotionId = ?`,
      [TitleProm, DescriptionProm, Price, PromotionId]
    );
    return true;
  }

  static async delete(id) {
    await db.query("DELETE FROM Promotions WHERE PromotionId = ?", [id]);
    return true;
  }
}

module.exports = Promotions;
