import bcrypt from 'bcryptjs';
import { getDB, initDatabases } from '../database.js';

const password = process.argv[2];

if (!password) {
  console.log('❌ Error: Debes proporcionar una contraseña. Ejemplo: npm run hash miPassword123');
  process.exit(1);
}

const run = async () => {
  await initDatabases();
  const db = getDB('admins');
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Actualizar el admin por defecto
  db.data[0].password = hashedPassword;
  await db.write();
  
  console.log('--------------------------------------------------');
  console.log('✅ Contraseña hasheada y guardada para el admin');
  console.log(`👤 Usuario: ${db.data[0].username}`);
  console.log(`🔐 Password Hasheada: ${hashedPassword}`);
  console.log('--------------------------------------------------');
  process.exit(0);
};

run();
