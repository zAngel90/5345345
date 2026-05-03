import express from 'express';
import { getDB, dbHelpers } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Obtener todos los chats del usuario logueado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB('chats');
    await db.read();
    
    // Si es admin, ve todos. Si es usuario, solo los suyos.
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const userChats = userRole === 'admin' 
      ? db.data 
      : db.data.filter(chat => chat.userId === userId);
      
    res.json({ success: true, data: userChats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener el conteo de mensajes no leídos
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const db = getDB('chats');
    await db.read();
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const userChats = userRole === 'admin' 
      ? db.data 
      : db.data.filter(chat => chat.userId === userId);
      
    const unreadTotal = userChats.reduce((sum, chat) => {
      return sum + (userRole === 'admin' ? (chat.unreadAdmin || 0) : (chat.unreadUser || 0));
    }, 0);
    
    res.json({ success: true, count: unreadTotal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Subir archivo para chat
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
  res.json({ 
    success: true, 
    url: `/uploads/${req.file.filename}`,
    type: req.file.mimetype.startsWith('image/') ? 'image' : (req.file.mimetype.startsWith('video/') ? 'video' : 'file')
  });
});

// Crear o enviar un mensaje en un chat
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { chatId, text, orderId, type, fileUrl } = req.body;
    const db = getDB('chats');
    await db.read();
    
    const userId = req.user.id;
    const username = req.user.username;
    const userRole = req.user.role;
    
    let chat;
    
    if (chatId) {
      chat = db.data.find(c => c.id === chatId);
    } else if (orderId) {
      // Si no hay chatId pero sí orderId, buscamos si ya existe un chat para ese pedido
      chat = db.data.find(c => c.orderId === orderId);
    }
    
    // Si no existe el chat, lo creamos
    if (!chat) {
      let chatUsername = username;
      let chatTitle = orderId ? `Pedido #${orderId}` : 'Soporte General';
      let finalUserId = userId; // Por defecto el que envía el mensaje

          // Si hay un pedido, intentamos sacar los datos del cliente desde la orden
          if (orderId) {
            const ordersDb = getDB('orders');
            await ordersDb.read();
            const order = ordersDb.data.find(o => o.id === orderId);
            if (order) {
              if (order.username) {
                chatUsername = order.username;
                chatTitle = `Pedido: ${order.username}`;
              }
              // IMPORTANTE: Si el admin crea el chat, el userId del CHAT debe ser el del cliente (su ID de la web)
              // Priorizamos accountId porque es el ID real de la base de datos de la página
              if (userRole === 'admin') {
                if (order.accountId) {
                  finalUserId = order.accountId;
                } else if (order.userId) {
                  finalUserId = order.userId;
                }
              }
            }
          }

      chat = {
        id: dbHelpers.generateId(db.data),
        userId: finalUserId,
        username: chatUsername,
        orderId: orderId || null,
        title: chatTitle,
        status: 'Activo',
        lastMessage: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadUser: userRole === 'admin' ? 1 : 0,
        unreadAdmin: userRole === 'admin' ? 0 : 1,
        messages: []
      };
      db.data.push(chat);
    }
    
    // Añadimos el mensaje
    const newMessage = {
      id: Date.now(),
      text: text || '',
      type: type || 'text', // 'text', 'image', 'video', 'file'
      fileUrl: fileUrl || null,
      sender: userRole === 'admin' ? 'admin' : 'user',
      senderName: username,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = text;
    chat.time = newMessage.time;
    
    // Incrementar el contador correspondiente
    if (userRole === 'admin') {
      chat.unreadUser = (chat.unreadUser || 0) + 1;
    } else {
      chat.unreadAdmin = (chat.unreadAdmin || 0) + 1;
    }
    
    await db.write();
    
    // Emitir mensaje por Socket.io en TIEMPO REAL
    if (req.io) {
      console.log(`✉️ Enviando mensaje en tiempo real a chat-${chat.id}`);
      // 1. Enviar al cuarto del chat específico (para los que tengan el chat abierto)
      req.io.to(`chat-${chat.id}`).emit('new-message', newMessage);
      
      // 2. Enviar notificación global (para el punto rojo de la Navbar)
      const recipientId = userRole === 'admin' ? chat.userId : 'admin';
      
      console.log(`🔔 Emitiendo notificación para: ${recipientId}`);
      
      const payload = {
        chatId: chat.id,
        text: text,
        senderName: username
      };

      // Enviamos a ambos para mayor seguridad
      req.io.emit(`notification-${recipientId}`, payload);
      if (userRole !== 'admin') {
        req.io.emit('notification-admin', payload);
      }
    }

    res.json({ success: true, data: newMessage, chatId: chat.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener mensajes de un chat específico
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const db = getDB('chats');
    await db.read();
    
    const chat = db.data.find(c => c.id === parseInt(req.params.id));
    
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat no encontrado' });
    }
    
    // Verificar que el usuario tenga permiso
    if (req.user.role !== 'admin' && chat.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'No tienes permiso para ver este chat' });
    }
    
    res.json({ success: true, data: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar o finalizar un chat
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso' });
    }
    
    const db = getDB('chats');
    await db.read();
    
    const initialLength = db.data.length;
    db.data = db.data.filter(c => c.id !== parseInt(req.params.id));
    
    if (db.data.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Chat no encontrado' });
    }
    
    await db.write();
    res.json({ success: true, message: 'Chat eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
