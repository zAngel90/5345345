import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';
import { initDatabases } from './database.js';

// Routes
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import robloxUserRoutes from './routes/roblox.js';
import robloxPlacesRoutes from './routes/robloxPlaces.js';
import robloxGamepassesRoutes from './routes/robloxGamepasses.js';
import robloxGroupsRoutes from './routes/robloxGroups.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('📱 Cliente conectado al WebSocket:', socket.id);
  
  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`);
    console.log(`👤 Socket ${socket.id} se unió al chat-${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado');
  });
});

// Middleware to make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 1. Fix for Private Network Access (CORS loopback) - MUST BE FIRST
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24h
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Content-Length', '0');
    return res.status(204).end();
  }
  next();
});

// 2. Standard CORS and Body Parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(join(__dirname, 'uploads')));
console.log('📂 Carpeta de uploads servida desde:', join(__dirname, 'uploads'));

// Directorio de uploads
const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Inicializar DB y Arrancar Servidor
const startServer = async () => {
  try {
    await initDatabases();
    
    // Rutas
    app.use('/api/admin', adminRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/users', robloxUserRoutes);
    app.use('/api/places', robloxPlacesRoutes);
    app.use('/api/gamepasses', robloxGamepassesRoutes);
    app.use('/api/groups', robloxGroupsRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/chats', chatRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/reviews', reviewRoutes);

    app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

    httpServer.listen(PORT, () => {
      console.log(`🚀 Pixel Store Server con WebSockets corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
