async function testGamepassPrice(id) {
    console.log(`🔍 Probando precio para el Gamepass ID: ${id}...`);
    try {
        const response = await fetch(`https://apis.roblox.com/game-passes/v1/game-passes/${id}/product-info`);
        const data = await response.json();
        console.log('✅ Datos recibidos de la API oficial:');
        console.log(JSON.stringify(data, null, 2));
        console.log(`\n💰 Precio exacto: ${data.PriceInRobux} Robux`);
    } catch (error) {
        console.error('❌ Error al consultar la API:', error.message);
    }
}

testGamepassPrice('1784322697');
