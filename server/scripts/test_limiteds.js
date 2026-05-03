import axios from 'axios';

async function getLimiteds(username) {
  try {
    console.log(`\n🔍 Buscando ID para el usuario: ${username}...`);
    
    // 1. Obtener el UserID
    const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: true
    });

    if (!userRes.data.data || userRes.data.data.length === 0) {
      console.log('❌ No se encontró el usuario.');
      return;
    }

    const userId = userRes.data.data[0].id;
    console.log(`✅ Usuario encontrado (ID: ${userId})`);

    // 2. Obtener los limiteds
    console.log(`📦 Consultando limiteds...`);
    const invRes = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?assetType=null&cursor=&limit=100&sortOrder=Asc`);
    const items = invRes.data.data;

    if (!items || items.length === 0) {
      console.log('ℹ️ El usuario no tiene limiteds visibles (o su inventario es privado).');
      return;
    }

    // 3. Obtener imágenes (Thumbnails) de los assets
    const assetIds = items.map(i => i.assetId).join(',');
    const thumbRes = await axios.get(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds}&size=150x150&format=Png&isCircular=false`);
    const thumbnails = thumbRes.data.data;

    console.log(`\n✨ Se encontraron ${items.length} limiteds:`);
    console.log('--------------------------------------------------');
    
    items.forEach((item, index) => {
      const thumb = thumbnails.find(t => t.targetId === item.assetId)?.imageUrl || 'N/A';
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   💰 RAP: ${item.recentAveragePrice || 'N/A'} Robux`);
      console.log(`   🖼️ Imagen: ${thumb}`);
      console.log('--------------------------------------------------');
    });

  } catch (error) {
    console.error('❌ Error en el script:', error.message);
  }
}

const usernameToTest = process.argv[2] || 'zAngel90_yt'; 
getLimiteds(usernameToTest);
