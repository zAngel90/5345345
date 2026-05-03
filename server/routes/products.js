import express from 'express';
import { getDB, dbHelpers } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Obtener todos los productos agregados (Público)
router.get('/', async (req, res) => {
  try {
    const dbProds = getDB('products');
    const dbLimiteds = getDB('limiteds');
    const dbMm2 = getDB('mm2');
    
    await Promise.all([dbProds.read(), dbLimiteds.read(), dbMm2.read()]);

    // Combinar todo en una sola lista para la tienda
    const allItems = [
      ...(dbProds.data || []),
      ...(dbLimiteds.data || []).map(item => ({ ...item, game: 'limiteds' })),
      ...(dbMm2.data || []).map(item => ({ ...item, game: 'murder-mystery-2' }))
    ];

    res.json(allItems);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// Crear producto (Admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const db = getDB('products');
    const { name, price, description, category, game } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen del producto es obligatoria' });
    }

    const newProduct = {
      id: dbHelpers.generateId(db.data),
      name,
      price: parseFloat(price),
      description,
      category,
      game,
      image: `/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };

    db.data.push(newProduct);
    await db.write();

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

export default router;
