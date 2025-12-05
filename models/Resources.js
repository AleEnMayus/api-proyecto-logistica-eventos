const db = require('../db');

async function addResource(ResourceName, Quantity, StatusDescription, Status, Price) {
  const [result] = await db.execute(
    'INSERT INTO Resources (ResourceName, Quantity, StatusDescription, Status, Price) VALUES (?, ?, ?, ?, ?)',
    [ResourceName, Quantity, StatusDescription, Status, Price]
  );
  return { ResourceId: result.insertId, ResourceName, Quantity, StatusDescription, Status, Price };
}

async function getAllResources() {
  const result = await db.execute('SELECT * FROM ViewAssignedResources');
  return result[0]; // si es un array, esto debería funcionar
}

async function updateResource(ResourceId, ResourceName, Quantity, StatusDescription, Status, Price) {
  const [result] = await db.execute(
    'UPDATE Resources SET ResourceName = ?, Quantity = ?, StatusDescription = ?, Status = ?, Price = ? WHERE ResourceId = ?',
    [ResourceName, Quantity, StatusDescription, Status, Price, ResourceId]
  );
  return result.affectedRows > 0
    ? { ResourceId, ResourceName, Quantity, StatusDescription, Status, Price }
    : null;
}

async function deleteResource(ResourceId) {
  const [result] = await db.execute('DELETE FROM Resources WHERE ResourceId = ?', [ResourceId]);
  return result.affectedRows > 0;
}

module.exports = {
  addResource,
  getAllResources,
  updateResource,
  deleteResource
};