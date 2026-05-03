import express from 'express';
import { getDB, dbHelpers } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Obtener todos los productos (Público)
router.get('/', async (req, res) => {
  const db = getDB('products');
  res.json(db.data);
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
