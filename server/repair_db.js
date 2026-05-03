import fs from 'fs';
import path from 'path';

const DB_PATH = './db';

async function repair() {
  console.log('🚀 Iniciando reparación de base de datos...');

  try {
    // 1. Leer archivos
    const settingsPath = path.join(DB_PATH, 'settings.json');
    const productsPath = path.join(DB_PATH, 'products.json');

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    if (!settings.games) {
      console.error('❌ No se encontraron juegos en settings.json');
      return;
    }

    let repairsCount = 0;
    let itemsRepaired = 0;

    // 2. Reparar juegos con IDs duplicadas o erróneas
    settings.games = settings.games.map(game => {
      // Si es un juego normal pero tiene ID de MM2 o Limiteds por error
      if ((game.id === 'murder-mystery-2' || game.id === 'limiteds') && 
          (game.name.toLowerCase() !== 'murder mystery 2' && game.name.toLowerCase() !== 'limiteds')) {
        
        const oldId = game.id;
        const newId = 'game-repaired-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        console.log(`🔧 Reparando juego: "${game.name}" | ID Viejo: ${oldId} -> ID Nuevo: ${newId}`);
        
        // Actualizar items vinculados a este juego (products es un array directo)
        products.forEach(p => {
          if (p.game === oldId) {
            p.game = newId;
            itemsRepaired++;
          }
        });

        game.id = newId;
        repairsCount++;
        return game;
      }
      return game;
    });

    // 3. Guardar cambios
    if (repairsCount > 0) {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

      console.log(`\n✅ ¡Reparación completada!`);
      console.log(`- Juegos corregidos: ${repairsCount}`);
      console.log(`- Items reasignados: ${itemsRepaired}`);
      console.log(`\n⚠️ RECUERDA: Reinicia tu backend (pm2 restart all) para aplicar los cambios.`);
    } else {
      console.log('✨ No se encontraron inconsistencias en los IDs de los juegos.');
    }

  } catch (err) {
    console.error('❌ Error durante la reparación:', err);
  }
}

repair();
