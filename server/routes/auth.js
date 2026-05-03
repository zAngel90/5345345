import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB, dbHelpers } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = getDB('users');
    await db.read();

    // Validar si existe
    if (db.data.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: 'El correo ya está registrado' });
    }
    if (db.data.find(u => u.username === username)) {
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: dbHelpers.generateId(db.data).toString(),
      username,
      email,
      password: hashedPassword,
      avatar: '/images/default-avatar.png',
      role: 'user',
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
        avatar: newUser.avatar
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
    
    // 1. Buscar en usuarios
    const usersDB = getDB('users');
    await usersDB.read();
    let user = usersDB.data.find(u => u.email === identifier || u.username === identifier);
    let isAdmin = false;

    // 2. Buscar en admins si no se encontró en usuarios
    if (!user) {
      const adminsDB = getDB('admins');
      await adminsDB.read();
      user = adminsDB.data.find(a => a.username === identifier);
      if (user) isAdmin = true;
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: isAdmin ? 'admin' : (user.role || 'user') },
      process.env.JWT_SECRET || 'pixel_secret_key',
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
        role: isAdmin ? 'admin' : (user.role || 'user')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
