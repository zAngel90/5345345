import axios from 'axios';

const USER_ID = '5308798791';

async function testRobloxAPI() {
    try {
        console.log(`🔍 Buscando juegos creados por el usuario ${USER_ID}...`);

        const gamesResponse = await axios.get(`https://games.roblox.com/v2/users/${USER_ID}/games?accessFilter=Public&sortOrder=Asc&limit=10`);

        if (!gamesResponse.data.data || gamesResponse.data.data.length === 0) {
            console.log('❌ No se encontraron juegos públicos para este usuario.');
            return;
        }

        console.log(`✅ Se encontraron ${gamesResponse.data.data.length} juegos.\n`);

        for (const game of gamesResponse.data.data) {
            const universeId = game.id;
            console.log(`🎮 Juego: ${game.name} (Universe ID: ${universeId})`);

            const gpResponse = await axios.get(`https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?passView=Full`);

            if (gpResponse.data.gamePasses && gpResponse.data.gamePasses.length > 0) {
                console.log(`   📦 Gamepasses encontrados:`);
                gpResponse.data.gamePasses.forEach(gp => {
                    console.log(`      - [ID: ${gp.id}] ${gp.name} | Precio: ${gp.price || 'N/A'} Robux`);
                });
            } else {
                console.log('   - No tiene gamepasses públicos en este juego.');
            }
            console.log('--------------------------------------------------');
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

testRobloxAPI();
