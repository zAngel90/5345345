import express from 'express';
import { getDB, dbHelpers } from '../database.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route GET /api/reviews
 * @desc Get all reviews
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB('reviews');
    // Devolvemos las reseñas ordenadas por fecha (más recientes primero)
    const reviews = [...db.data].reverse();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/reviews
 * @desc Create a new review
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { rating, text, username, userId, userAvatar } = req.body;
    const db = getDB('reviews');

    const newReview = {
      id: dbHelpers.generateId(db.data),
      userId: userId || 'anonymous',
      username: username || 'Anónimo',
      userAvatar: userAvatar || null,
      rating: parseInt(rating) || 5,
      text: text || '',
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString()
    };

    db.data.push(newReview);
    await db.write();

    res.json({ success: true, data: newReview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
