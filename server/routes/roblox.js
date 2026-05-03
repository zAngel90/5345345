import express from 'express';
import fetch from 'node-fetch';
import { scrapeUserSearch, scrapeUserAvatar, scrapeUserPlaces, scrapePlaceGamePasses, scrapeGamePassDetails } from '../scraper.js';

const router = express.Router();

// Helper caching system (basic)
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// --- Endpoints ---

// Buscar usuario via scraping
router.get('/search', async (req, res) => {
  try {
    const keyword = req.query.keyword || req.query.username;
    if (!keyword) return res.status(400).json({ success: false, error: 'Keyword or username is required' });

    const cacheKey = `user-search-${keyword}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ success: true, ...cached });

    const user = await scrapeUserSearch(keyword);
    const result = { data: user ? [user] : [] };
    
    setCache(cacheKey, result);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, error: 'Failed to search users' });
  }
});

// Obtener detalles del usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Obtener lugares del usuario
router.get('/:userId/places', async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `user-places-${userId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const places = await scrapeUserPlaces(userId);
    const result = { data: places };
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error getting places:', error);
    res.status(500).json({ error: 'Failed to get places' });
  }
});

// Obtener limiteds (collectibles) del usuario con sus thumbnails
router.get('/:userId/collectibles', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📦 Consultando limiteds para el usuario: ${userId}`);
    
    const response = await fetch(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?assetType=null&cursor=&limit=100&sortOrder=Asc`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Obtener thumbnails en bloque
      const assetIds = data.data.map(i => i.assetId).join(',');
      const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds}&size=150x150&format=Png&isCircular=false`);
      const thumbData = await thumbRes.json();
      
      // Combinar datos
      data.data = data.data.map(item => ({
        ...item,
        thumbnail: thumbData.data?.find(t => t.targetId === item.assetId)?.imageUrl || null
      }));
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Error obteniendo collectibles:', error);
    res.status(500).json({ success: false, error: 'Failed to get collectibles' });
  }
});

// Obtener avatar via proxy (para evitar bloqueos de CORS/Referrer)
router.get('/avatar/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cacheKey = `avatar-${userId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.redirect(cached);

    console.log(`🖼️ Obteniendo avatar para ID: ${userId}`);
    const avatarUrl = await scrapeUserAvatar(userId);
    
    if (!avatarUrl) throw new Error('Roblox image not found');

    setCache(cacheKey, avatarUrl);
    res.redirect(avatarUrl);
  } catch (error) {
    console.error('❌ Error obteniendo avatar:', error.message);
    res.redirect(`https://ui-avatars.com/api/?name=Error&background=f00&color=fff&size=150`);
  }
});

export default router;
