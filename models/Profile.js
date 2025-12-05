const db = require("../db");

/**
 * Obtiene el perfil de un usuario por su ID.
 * @param {number} userId - El ID del usuario.
 * @returns {Promise<object|null>} El perfil del usuario o null si no se encuentra.
 */
async function getProfileById(userId) {
  const [rows] = await db.query(
    `SELECT UserId, Names, DocumentType, DocumentNumber, BirthDate, Email, Status, Role, Photo
     FROM User
     WHERE UserId = ?`,
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Actualiza el perfil de un usuario con datos específicos.
 * Los campos que no se incluyan en 'data' no se modificarán en la base de datos.
 * @param {number} userId - El ID del usuario a actualizar.
 * @param {object} data - Un objeto con los campos a actualizar. Ejemplo: { Names: "Nuevo Nombre", Email: "nuevo@correo.com" }
 * @returns {Promise<number>} El número de filas afectadas (0 si no se actualizó, 1 si tuvo éxito).
 */
async function updateProfile(userId, data) {
  // Obtenemos las claves del objeto que se envió (ej: ['Names', 'Email'])
  const fieldsToUpdate = Object.keys(data);

  // Si no se envió ningún dato para actualizar, terminamos la función.
  if (fieldsToUpdate.length === 0) {
    return 0; // No hay nada que hacer
  }

  // Construimos la parte SET de la consulta dinámicamente
  // Resultado: "Names = ?, Email = ?"
  const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(", ");
  
  // Obtenemos los valores en el mismo orden que los campos
  // Resultado: ["Nuevo Nombre", "nuevo@correo.com"]
  const values = fieldsToUpdate.map(key => data[key]);

  // Agregamos el userId al final para la cláusula WHERE
  values.push(userId);

  // Ejecutamos la consulta final
  const [result] = await db.query(
    `UPDATE User SET ${setClause} WHERE UserId = ?`,
    values
  );

  return result.affectedRows;
}

module.exports = { getProfileById, updateProfile };