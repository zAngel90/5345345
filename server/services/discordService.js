import axios from 'axios';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const LEVEL_ROLE_IDS = {
  BRONCE: '1489796746799354077',
  SILVER: '1489797620799897844',
  GOLD: '1489797523731382502',
  DIAMOND: '1489797794343419985',
  ROYAL: '1489797913193218268',
  MYTHIC: '1489797982483251272'
};

const getLevelFromRobux = (totalRobux) => {
  if (totalRobux >= 80000) return { key: 'MYTHIC', name: '🔥 Mythic Pixel', roleId: LEVEL_ROLE_IDS.MYTHIC };
  if (totalRobux >= 50000) return { key: 'ROYAL', name: '👑 Royal Pixel', roleId: LEVEL_ROLE_IDS.ROYAL };
  if (totalRobux >= 25000) return { key: 'DIAMOND', name: '💎 Diamond Pixel', roleId: LEVEL_ROLE_IDS.DIAMOND };
  if (totalRobux >= 10000) return { key: 'GOLD', name: '🥇 Gold Pixel', roleId: LEVEL_ROLE_IDS.GOLD };
  if (totalRobux >= 3000) return { key: 'SILVER', name: '🥈 Silver Pixel', roleId: LEVEL_ROLE_IDS.SILVER };
  return { key: 'BRONCE', name: '⭐ Bronce Pixel', roleId: LEVEL_ROLE_IDS.BRONCE };
};

export const syncDiscordRole = async (discordId, totalRobux) => {
  try {
    const targetLevel = getLevelFromRobux(totalRobux);
    const botToken = 'DISCORD_BOT_TOKEN_PLACEHOLDER';
    const guildId = '1372409516913852468';

    if (!botToken || !guildId || !discordId) return null;

    // Obtener el miembro actual
    const response = await axios.get(`${DISCORD_API_URL}/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${botToken}` }
    });

    const currentRoles = response.data.roles;
    const allLevelRoleIds = Object.values(LEVEL_ROLE_IDS);

    // Determinar qué roles quitar y cuál poner
    const rolesToRemove = allLevelRoleIds.filter(roleId => 
      roleId !== targetLevel.roleId && currentRoles.includes(roleId)
    );

    let updatedRoles = currentRoles.filter(roleId => !rolesToRemove.includes(roleId));
    if (!updatedRoles.includes(targetLevel.roleId)) {
      updatedRoles.push(targetLevel.roleId);
    }

    // Si los roles son iguales, no hacer nada
    if (JSON.stringify(currentRoles.sort()) === JSON.stringify(updatedRoles.sort())) {
      return targetLevel;
    }

    // Actualizar roles en Discord
    await axios.patch(`${DISCORD_API_URL}/guilds/${guildId}/members/${discordId}`, 
      { roles: updatedRoles },
      { headers: { Authorization: `Bot ${botToken}` } }
    );

    return targetLevel;
  } catch (error) {
    console.error('Error sincronizando rol de Discord:', error.response?.data || error.message);
    return null;
  }
};

export const getDiscordUser = async (accessToken) => {
  try {
    const response = await axios.get(`${DISCORD_API_URL}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo usuario de Discord:', error.response?.data || error.message);
    throw error;
  }
};
