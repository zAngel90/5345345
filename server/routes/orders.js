import express from 'express';
import { getDB, dbHelpers } from '../database.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Crear pedido (Público)
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const db = getDB('orders');
    await db.read();
    
    const { 
      amount, 
      username, 
      userId, 
      accountId,
      method, 
      paymentMethodId, 
      total, 
      currency,
      cart,
      gamepassId
    } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'El comprobante de pago es obligatorio' });
    }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      amount: parseInt(amount),
      username,
      userId,
      accountId: accountId || null,
      method, // 'gamepass' o 'group'
      paymentMethodId,
      total: parseFloat(total),
      currency,
      gamepassId: gamepassId || null,
      cart: cart ? JSON.parse(cart) : [],
      receipt: `/uploads/${req.file.filename}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.data.push(newOrder);
    await db.write();

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Error al procesar el pedido' });
  }
});

// Obtener pedidos de un usuario específico
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB('orders');
    await db.read();
    
    console.log('🔍 Buscando pedidos para el usuario:', userId);
    console.log('📦 Total de pedidos en DB:', db.data.length);

    // Filtramos los pedidos que pertenezcan a este userId, accountId o que coincidan con el username
    const userOrders = db.data.filter(order => {
      const matchId = String(order.userId) === String(userId);
      const matchAccountId = order.accountId && String(order.accountId) === String(userId);
      const matchUsername = String(order.username).toLowerCase() === String(userId).toLowerCase();
      
      return matchId || matchAccountId || matchUsername;
    });
    
    console.log('✅ Pedidos encontrados:', userOrders.length);
    res.json({ success: true, data: userOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener pedidos recientes para el feed de "Últimas Compras" (Público)
router.get('/recent', async (req, res) => {
  try {
    const db = getDB('orders');
    await db.read();
    
    // Tomamos los últimos 10 pedidos completados, sin datos sensibles como el comprobante
    const recentOrders = db.data
      .filter(order => order.status && order.status.toLowerCase() === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        username: order.username,
        userId: order.userId,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
      }));
      
    res.json({ success: true, data: recentOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadísticas de pedidos (Público)
router.get('/stats', async (req, res) => {
  try {
    const db = getDB('orders');
    await db.read();
    
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const completedLast24h = db.data.filter(order => 
      order.status && 
      order.status.toLowerCase() === 'completed' &&
      new Date(order.createdAt) >= last24h
    ).length;
    
    res.json({ success: true, count: completedLast24h });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
