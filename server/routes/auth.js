import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import { getDB, dbHelpers } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { getDiscordUser, syncDiscordRole } from '../services/discordService.js';

const router = express.Router();

// Discord Config
const CLIENT_ID = '1481804979626053815';
const CLIENT_SECRET = 'QGtB4eFg7RKPii-xZ2M6jg3QgvCkLj6G';
const REDIRECT_URI = 'https://lotus-sells-type-pursuit.trycloudflare.com/api/auth/discord/callback';
const FRONTEND_URL = 'https://www.pixelstorep.com';

// Ruta al archivo de niveles del bot (Cambiar en producción si es necesario)
const BOT_LEVELS_PATH = './bot-discord/bot/data/levels.json';

async function importLegacyLevel(discordId) {
  try {
    if (fs.existsSync(BOT_LEVELS_PATH)) {
      const data = JSON.parse(fs.readFileSync(BOT_LEVELS_PATH, 'utf8'));
      if (data[discordId]) {
        console.log(`📊 Importando nivel antiguo para ${discordId}:`, data[discordId]);
        return {
          totalRobux: data[discordId].totalRobux || 0,
          level: data[discordId].level || 'BRONCE'
        };
      }
    }
  } catch (err) {
    console.error('⚠️ Error al importar nivel del bot:', err.message);
  }
  return { totalRobux: 0, level: 'BRONCE' };
}

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = getDB('users');
    await db.read();

    if (db.data.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: 'El correo ya está registrado' });
    }
    if (db.data.find(u => u.username === username)) {
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const randomSeed = Math.floor(Math.random() * 10000);
    const newUser = {
      id: dbHelpers.generateId(db.data).toString(),
      username,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=pixel${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      role: 'user',
      totalRobux: 0,
      level: 'BRONCE',
      createdAt: new Date().toISOString()
    };

    db.data.push(newUser);
    await db.write();

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'pixel_secret_key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        level: newUser.level
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    const db = getDB('users');
    await db.read();
    
    let user = db.data.find(u => u.email === identifier || u.username === identifier);
    let isAdmin = false;

    if (!user) {
      const adminsDB = getDB('admins');
      await adminsDB.read();
      user = adminsDB.data.find(a => a.username === identifier || a.email === identifier);
      if (user) isAdmin = true;
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    // Asegurar que el usuario tiene los campos de progreso (para cuentas viejas)
    if (!user.level) user.level = 'BRONCE';
    if (user.totalRobux === undefined) user.totalRobux = 0;

    isAdmin = isAdmin || user.role === 'admin' || user.email === 'admin@pixel.store';
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'pixel_secret_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || (isAdmin ? 'admin@pixel.store' : ''),
        avatar: user.avatar || '/images/avatar.png',
        role: isAdmin ? 'admin' : (user.role || 'user'),
        level: user.level,
        totalRobux: user.totalRobux,
        discordId: user.discordId || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- DISCORD OAUTH2 ---

router.get('/discord', (req, res) => {
  const { token } = req.query; // Token opcional para vincular cuenta existente
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email%20guilds.join${token ? `&state=${token}` : ''}`;
  res.redirect(url);
});

router.get('/discord/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.redirect(`${FRONTEND_URL}/?error=no_code`);

  try {
    // Si hay 'state', es el token del usuario ya logueado que quiere vincular
    let existingUserId = null;
    if (state) {
      try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET || 'pixel_secret_key_2026');
        existingUserId = decoded.id;
      } catch (err) {
        console.error('⚠️ Token de vinculación inválido');
      }
    }
    // Intercambiar código por token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;
    const discordUser = await getDiscordUser(access_token);

    const db = getDB('users');
    await db.read();

    // 1. Si venimos de vincular una cuenta existente (tenemos existingUserId)
    // 2. Si no, buscamos si ya existe por Discord ID o por Email
    let user = null;
    if (existingUserId) {
      user = db.data.find(u => u.id === existingUserId);
    }

    if (!user) {
      user = db.data.find(u => u.discordId === discordUser.id || u.email === discordUser.email);
    }

    if (user) {
      // Actualizar datos de Discord
      user.discordId = discordUser.id;
      user.discordAvatar = discordUser.avatar;
      if (!user.avatar || user.avatar.includes('default-avatar')) {
        user.avatar = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
      }
    } else {
      // Importar datos antiguos del bot si existen
      const legacyData = await importLegacyLevel(discordUser.id);

      // Crear nuevo usuario
      user = {
        id: dbHelpers.generateId(db.data).toString(),
        username: discordUser.username,
        email: discordUser.email || `${discordUser.id}@discord.com`,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : '/images/default-avatar.png',
        discordId: discordUser.id,
        discordAvatar: discordUser.avatar,
        role: 'user',
        totalRobux: legacyData.totalRobux,
        level: legacyData.level,
        createdAt: new Date().toISOString()
      };
      db.data.push(user);
    }

    // Sincronizar rol si tiene Discord vinculado
    if (user.discordId) {
      await syncDiscordRole(user.discordId, user.totalRobux || 0);
    }

    await db.write();

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'pixel_secret_key_2026',
      { expiresIn: '30d' }
    );

    // Redirigir al frontend con el token
    res.redirect(`${FRONTEND_URL}/?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      level: user.level,
      totalRobux: user.totalRobux,
      discordId: user.discordId
    }))}`);

  } catch (error) {
    console.error('Error en Discord Callback:', error.response?.data || error.message);
    res.redirect(`${FRONTEND_URL}/?error=discord_auth_failed`);
  }
});

// Perfil (GET)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const db = getDB('users');
    await db.read();
    const user = db.data.find(u => u.id === req.user.id);

    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    const { password, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Perfil (UPDATE)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const db = getDB('users');
    await db.read();

    const userIndex = db.data.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    if (username) db.data[userIndex].username = username;
    if (avatar) db.data[userIndex].avatar = avatar;

    await db.write();
    res.json({ success: true, data: db.data[userIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
