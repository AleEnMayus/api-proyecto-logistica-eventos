const Resource = require('../models/Resources');
const db = require('../db'); // Para consultar el recurso actualizado

async function getResources(req, res) {
  try {
    const resources = await Resource.getAllResources();
    res.json(resources);
  } catch (err) {
    console.error('Error en getResources:', err);
    res.status(500).json({ error: 'Error obteniendo recursos' });
  }
}

async function createResource(req, res) {
  try {
    const { ResourceName, Quantity, StatusDescription, Status, Price } = req.body;
    const newResource = await Resource.addResource(ResourceName, Quantity, StatusDescription, Status, Price);
    res.status(201).json(newResource);
  } catch (err) {
    res.status(500).json({ error: 'Error creando recurso' });
  }
}

async function updateResource(req, res) {
  try {
    const { ResourceName, Quantity, StatusDescription, Status, Price } = req.body;
    const updated = await Resource.updateResource(
      req.params.id,
      ResourceName,
      Quantity,
      StatusDescription,
      Status,
      Price
    );

    if (!updated) return res.status(404).json({ error: 'Recurso no encontrado' });

    // Trae el recurso actualizado de la DB
    const [result] = await db.execute('SELECT * FROM Resources WHERE ResourceId = ?', [req.params.id]);
    res.json(result[0]); // Devuelve el objeto actualizado
  } catch (err) {
    console.error('Error en updateResource:', err);
    res.status(500).json({ error: 'Error actualizando recurso' });
  }
}

async function deleteResource(req, res) {
  try {
    const success = await Resource.deleteResource(req.params.id);
    success
      ? res.json({ message: 'Recurso eliminado' })
      : res.status(404).json({ error: 'Recurso no encontrado' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando recurso' });
  }
}

module.exports = { getResources, createResource, updateResource, deleteResource };
