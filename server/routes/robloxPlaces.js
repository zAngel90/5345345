import express from 'express';
import { scrapePlaceGamePasses } from '../scraper.js';

const router = express.Router();

router.get('/:placeId/gamepasses', async (req, res) => {
  try {
    const { placeId } = req.params;
    const { userId } = req.query;
    const gamepasses = await scrapePlaceGamePasses(placeId, userId);
    res.json({ data: gamepasses });
  } catch (error) {
    console.error('Error getting gamepasses:', error);
    res.status(500).json({ error: 'Failed to get gamepasses' });
  }
});

export default router;
