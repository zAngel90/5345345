import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/:gamepassId', async (req, res) => {
  try {
    const { gamepassId } = req.params;
    const response = await fetch(`https://apis.roblox.com/game-passes/v1/game-passes/${gamepassId}/product-info`);
    if (!response.ok) {
      const catalogResponse = await fetch(`https://catalog.roblox.com/v1/assets/${gamepassId}/details`);
      const catalogData = await catalogResponse.json();
      return res.json(catalogData);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error getting gamepass:', error);
    res.status(500).json({ error: 'Failed to get gamepass' });
  }
});

export default router;
