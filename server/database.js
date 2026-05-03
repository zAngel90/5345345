import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = join(__dirname, 'db');

// Crear directorio de base de datos si no existe
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Estructura inicial de datos
const defaultData = {
  products: [
    {
      "id": 1,
      "name": "Kitsune Fruit",
      "price": 15.0,
      "description": "La fruta más poderosa de Blox Fruits",
      "category": "Frutas",
      "game": "blox-fruits",
      "image": "https://tr.rbxcdn.com/f417f7b3c6b24d7803b82f61a1d2d3d3/150/150/Image/Webp"
    },
    {
      "id": 2,
      "name": "Dark Blade",
      "price": 25.0,
      "description": "Espada legendaria",
      "category": "Gamepasses",
      "game": "blox-fruits",
      "image": "https://tr.rbxcdn.com/4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9/150/150/Image/Webp"
    },
    {
      "id": 3,
      "name": "Nik's Scythe",
      "price": 45.0,
      "description": "El arma más rara de MM2",
      "category": "Ancient",
      "game": "murder-mystery-2",
      "image": "https://tr.rbxcdn.com/97825603b82f61a1d2d3d3f417f7b3c6/150/150/Image/Webp"
    },
    {
      "id": 4,
      "name": "Harvester",
      "price": 12.0,
      "description": "Arco Godly de MM2",
      "category": "Ancient",
      "game": "murder-mystery-2",
      "image": "https://tr.rbxcdn.com/3d3f417f7b3c697825603b82f61a1d2d/150/150/Image/Webp"
    }
  ],
  orders: [],
  admins: [
    {
      id: 'admin-1',
      username: 'admin',
      password: '', // Se llenará con el script de hash
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    siteName: 'Pixel Store',
    commission: 0.7,
    currency: 'USD',
    requiredGroups: [],
    robuxPackages: [
      { id: 1, amount: 400, price: 3.20, popular: false, bestValue: false },
      { id: 2, amount: 800, price: 6.40, popular: false, bestValue: false },
      { id: 3, amount: 1700, price: 13.60, popular: true, bestValue: false },
      { id: 4, amount: 4500, price: 36.00, popular: false, bestValue: true },
      { id: 5, amount: 10000, price: 80.00, popular: false, bestValue: false },
      { id: 6, amount: 20000, price: 160.00, popular: false, bestValue: false },
    ],
    games: [
      { id: 'blox-fruits', name: 'Blox Fruits', slug: 'blox-fruits', image: '/images/image_9.png', color: '#1D4ED8', items: '128 items' },
      { id: 'rivals', name: 'Rivals', slug: 'rivals', image: '/images/image_10.png', color: '#111827', items: '45 items' },
      { id: 'anime-vanguards', name: 'Anime Vanguards', slug: 'anime-vanguards', image: '/images/image_11.png', color: '#581C87', items: '86 items' },
      { id: 'murder-mystery-2', name: 'Murder Mystery 2', slug: 'murder-mystery-2', image: '/images/image_12.png', color: '#991B1B', items: '210 items' },
      { id: 'pet-simulator-99', name: 'Pet Simulator 99', slug: 'pet-simulator-99', image: '/images/image_8.png', color: '#0D9488', items: '154 items' },
      { id: 'king-legacy', name: 'King Legacy', slug: 'king-legacy', image: '/images/image_7.png', color: '#92400E', items: '32 items' },
    ],
    categories: [
      { id: 'frutas', title: 'Frutas', subtitle: 'Poderosas habilidades para tu aventura', icon: 'Sword', image: '/images/image_4.png' },
      { id: 'ancient', title: 'Ancient', subtitle: 'Armas legendarias de Murder Mystery 2', icon: 'Star', image: '/images/image_5.png' },
      { id: 'gamepasses', title: 'Gamepasses', subtitle: 'Mejora tu experiencia de juego', icon: 'Zap', image: '/images/image_6.png' }
    ],
    currencies: [
      { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', rate: 1, flag: 'us', active: true },
      { code: 'COP', name: 'Peso Colombiano', symbol: '$', rate: 4000, flag: 'co', active: true },
      { code: 'ARS', name: 'Peso Argentino', symbol: '$', rate: 1000, flag: 'ar', active: true },
      { code: 'MXN', name: 'Peso Mexicano', symbol: '$', rate: 17, flag: 'mx', active: true },
      { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', rate: 3.7, flag: 'pe', active: true },
      { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, flag: 'eu', active: true },
    ],
    featuredSections: [],
    pricePer1000: 8.00,
    paymentMethods: [
      { id: 'nequi', name: 'Nequi', image: '/images/nequi.png', active: true },
      { id: 'pse', name: 'PSE', image: '/images/pse.png', active: true },
      { id: 'bancolombia', name: 'Bancolombia', image: '/images/bancolombia.png', active: true }
    ]
  },
  users: [],
  limiteds: [],
  mm2: []
};

const databases = {};

const initDB = async (name, defaultValue) => {
  const adapter = new JSONFile(join(dbDir, `${name}.json`));
  const db = new Low(adapter, defaultValue);
  await db.read();
  
  if (!db.data) {
    db.data = defaultValue;
    await db.write();
  }
  
  return db;
};

export const initDatabases = async () => {
  databases.products = await initDB('products', defaultData.products);
  databases.orders = await initDB('orders', defaultData.orders);
  databases.admins = await initDB('admins', defaultData.admins);
  databases.settings = await initDB('settings', defaultData.settings);
  databases.users = await initDB('users', defaultData.users);
  databases.chats = await initDB('chats', []);
  databases.reviews = await initDB('reviews', []);
  databases.limiteds = await initDB('limiteds', defaultData.limiteds);
  databases.mm2 = await initDB('mm2', defaultData.mm2);
  
  console.log('✅ Bases de datos JSON inicializadas');
  return databases;
};

export const getDB = (name) => {
  if (!databases[name]) {
    throw new Error(`Base de datos '${name}' no encontrada`);
  }
  return databases[name];
};

export const dbHelpers = {
  generateId: (items) => {
    if (!items || items.length === 0) return 1;
    return Math.max(...items.map(item => item.id || 0)) + 1;
  }
};

export default databases;
