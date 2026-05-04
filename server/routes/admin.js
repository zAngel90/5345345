import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDB('admins');
  
  const admin = db.data.find(a => a.username === username);
  
  if (!admin) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const validPassword = await bcrypt.compare(password, admin.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET || 'pixel_secret_key',
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: admin.id,
      username: admin.username,
      role: admin.role
    }
  });
});

/**
 * Configuración de Paquetes de Robux
 */
router.get('/robux-config', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    
    // Sanitizar datos por si se guardaron mal anteriormente (doble anidación)
    let packages = db.data.robuxPackages || [];
    if (!Array.isArray(packages) && packages.packages) {
      packages = packages.packages;
    }
    
    res.json({ 
      success: true, 
      data: {
        packages: Array.isArray(packages) ? packages : [],
        pricePer1000: db.data.pricePer1000 || 8.00
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/robux-config', async (req, res) => {
  try {
    const { packages, pricePer1000 } = req.body;
    const db = getDB('settings');
    await db.read();
    if (packages) db.data.robuxPackages = packages;
    if (pricePer1000 !== undefined) db.data.pricePer1000 = pricePer1000;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Configuración de Juegos
 */
router.get('/games-config', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    
    const { search, all } = req.query;
    let games = db.data.games || [];
    
    if (search) {
      const q = search.toLowerCase();
      games = games.filter(g => 
        g.name.toLowerCase().includes(q) || 
        g.id.toLowerCase().includes(q)
      );
    } else if (all !== 'true') {
      // Por defecto, solo devolver juegos listados (no ocultos)
      // games = games.filter(g => !g.hidden);
      // Nota: Si el usuario quiere que la sidebar los oculte, lo haremos en el frontend
      // o aquí. El usuario dijo "juegos ocultos" que se buscan.
    }
    
    res.json({ success: true, data: games });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/games-config', async (req, res) => {
  try {
    const { games } = req.body;
    const db = getDB('settings');
    await db.read();
    
    // Asegurar que cada juego tenga las propiedades básicas y normalizar IDs
    const sanitizedGames = games.map(g => ({
      ...g,
      id: g.id || g.slug || g.name.toLowerCase().replace(/\s+/g, '-'),
      hidden: !!g.hidden // Asegurar que sea booleano
    }));

    db.data.games = sanitizedGames;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Configuración de Categorías
 */
router.get('/categories-config', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    res.json({ success: true, data: db.data.categories || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/categories-config', async (req, res) => {
  try {
    const { categories } = req.body;
    const db = getDB('settings');
    await db.read();
    db.data.categories = categories;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Gestión de Iconos de Categorías
 */
router.get('/category-icons-config', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    res.json({ success: true, data: db.data.categoryIcons || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/category-icons-config', async (req, res) => {
  try {
    const { icons } = req.body;
    const db = getDB('settings');
    await db.read();
    db.data.categoryIcons = icons;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/products-config', async (req, res) => {
  try {
    const { products } = req.body;
    const db = getDB('products');
    await db.read();
    db.data = products;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
    }
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/featured-sections', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    res.json({ success: true, data: db.data.featuredSections || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/home-popular-categories', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    res.json({ success: true, data: db.data.homePopularCategories || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/home-popular-categories', async (req, res) => {
  try {
    const { categories } = req.body;
    const db = getDB('settings');
    await db.read();
    db.data.homePopularCategories = categories;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Configuración de Monedas y Tasas
 */
router.get('/currencies-config', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    
    // Si no existen monedas, inicializar con las de defecto
    if (!db.data.currencies) {
      db.data.currencies = [
        { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', rate: 1, flag: 'us', active: true },
        { code: 'COP', name: 'Peso Colombiano', symbol: '$', rate: 4000, flag: 'co', active: true },
        { code: 'ARS', name: 'Peso Argentino', symbol: '$', rate: 1000, flag: 'ar', active: true },
        { code: 'MXN', name: 'Peso Mexicano', symbol: '$', rate: 17, flag: 'mx', active: true },
        { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', rate: 3.7, flag: 'pe', active: true },
        { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, flag: 'eu', active: true },
      ];
      await db.write();
    }
    
    res.json({ success: true, data: db.data.currencies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/currencies-config', async (req, res) => {
  try {
    const { currencies } = req.body;
    const db = getDB('settings');
    await db.read();
    db.data.currencies = currencies;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const db = getDB('orders');
    await db.read();
    res.json({ success: true, data: db.data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Configuración de Métodos de Pago
 */
router.get('/payment-methods-config', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    res.json({ success: true, data: db.data.paymentMethods || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/payment-methods-config', async (req, res) => {
  try {
    const { paymentMethods } = req.body;
    const db = getDB('settings');
    await db.read();
    db.data.paymentMethods = paymentMethods;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDB('orders');
    await db.read();
    const order = db.data.find(o => o.id === id);
    if (order) {
      order.status = status;
      await db.write();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Gestión de Limiteds Personalizados
 */
router.get('/limiteds-config', async (req, res) => {
  try {
    const db = getDB('limiteds');
    await db.read();
    res.json({ success: true, data: db.data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/limiteds-config', async (req, res) => {
  try {
    const { limiteds } = req.body;
    const db = getDB('limiteds');
    await db.read();
    db.data = limiteds;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Gestión de Items MM2
 */
router.get('/mm2-config', async (req, res) => {
  try {
    const db = getDB('mm2');
    await db.read();
    res.json({ success: true, data: db.data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/mm2-config', async (req, res) => {
  try {
    const { items } = req.body;
    const db = getDB('mm2');
    await db.read();
    db.data = items;
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
