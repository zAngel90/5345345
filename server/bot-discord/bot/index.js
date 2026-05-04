const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

const axios = require('axios');
const fs = require('fs');
const groups = require('./groups.json');
const panels = require('./config/panels.json');

const token = 'MTQ4MTgwNDk3OTYyNjA1MzgxNQ.G_TEgk.qC4GyAFv10-MqKw2iPFS_P6hZM-WuHRMl1Q73Y'.trim();
const clientId = '1481804979626053815';
const guildId = '1372409516913852468';

const SHOP_LOG_CHANNEL_ID = '1464638950730629210';
const storeName = 'Pixel Store';
const OWNER_ID = '1225100784644128880';
const STAFF_ROLE_NAME = 'Staff';
const BOOSTER_ROLE_ID = '1446156741267165244';
const VERIFY_CHANNEL_ID = '1481698180818141256';

const LEVEL_ROLE_IDS = {
  BRONCE: '1489796746799354077',
  SILVER: '1489797620799897844',
  GOLD: '1489797523731382502',
  DIAMOND: '1489797794343419985',
  ROYAL: '1489797913193218268',
  MYTHIC: '1489797982483251272'
};
// EMOJIS
const EMOJI_APROBADO = '<:aprobado:1481681557314867345>';
const EMOJI_ESPERA = '<:espera:1488761670045012068>';
const EMOJI_DENEGADO = '<:denegado:1488780706925514852>';
const EMOJI_URL = '<:url:1481683450619494460>';
const EMOJI_ROBLOX = '<:roblox:1395091569329176787>';
const EMOJI_TICKET = '<:ticket:1481437898032156772>';
const EMOJI_CHECK = '<:check:1481437833699791011>';
const EMOJI_ROBUX = '<:robux:1481435890026025183>';
const EMOJI_REGISTRO = '<:registro:1481456835553919178>';
const EMOJI_ENTREGA = '<:entrega:1481456342781788230>';
const EMOJI_GAME = '<:game:1481478787836285040>';
const EMOJI_FORTNITE = '<:fornite:1481478822175047963>';
const EMOJI_PAVOS = '<:pavos:1462575144391151770>';
const EMOJI_GIFT = '<a:gift:1491141636921495874>';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const trackingFilePath = './data/tracking.json';
const ordersFilePath = './data/orders.json';
const ticketsFilePath = './data/tickets.json';
const levelsFilePath = './data/levels.json';

function parseEmoji(emojiString) {
  if (!emojiString || typeof emojiString !== 'string') return undefined;

  const customEmojiMatch = emojiString.match(/^<(a?):([a-zA-Z0-9_]+):(\d+)>$/);
  if (customEmojiMatch) {
    const [, animated, name, id] = customEmojiMatch;
    return {
      id,
      name,
      animated: animated === 'a'
    };
  }

  return { name: emojiString };
}

function loadTrackingData() {
  try {
    if (!fs.existsSync(trackingFilePath)) {
      fs.writeFileSync(trackingFilePath, JSON.stringify({}, null, 2));
      return {};
    }
    return JSON.parse(fs.readFileSync(trackingFilePath, 'utf8'));
  } catch (err) {
    console.error('Error leyendo tracking.json:', err);
    return {};
  }
}

function saveTrackingData(data) {
  try {
    fs.writeFileSync(trackingFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error guardando tracking.json:', err);
  }
}

// 🔽 NUEVO BLOQUE (levels)

function loadLevelsData() {
  try {
    if (!fs.existsSync(levelsFilePath)) {
      fs.writeFileSync(levelsFilePath, JSON.stringify({}, null, 2));
      return {};
    }
    return JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));
  } catch (err) {
    console.error('Error leyendo levels.json:', err);
    return {};
  }
}

function saveLevelsData(data) {
  try {
    fs.writeFileSync(levelsFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error guardando levels.json:', err);
  }
}

function getNow() {
  return new Date().toISOString();
}

function getLevelFromRobux(totalRobux) {
  if (totalRobux >= 80000) {
    return { key: 'MYTHIC', name: '🔥 Mythic Pixel', roleId: LEVEL_ROLE_IDS.MYTHIC };
  }
  if (totalRobux >= 50000) {
    return { key: 'ROYAL', name: '👑 Royal Pixel', roleId: LEVEL_ROLE_IDS.ROYAL };
  }
  if (totalRobux >= 25000) {
    return { key: 'DIAMOND', name: '💎 Diamond Pixel', roleId: LEVEL_ROLE_IDS.DIAMOND };
  }
  if (totalRobux >= 10000) {
    return { key: 'GOLD', name: '🥇 Gold Pixel', roleId: LEVEL_ROLE_IDS.GOLD };
  }
  if (totalRobux >= 3000) {
    return { key: 'SILVER', name: '🥈 Silver Pixel', roleId: LEVEL_ROLE_IDS.SILVER };
  }
  return { key: 'BRONCE', name: '⭐ Bronce Pixel', roleId: LEVEL_ROLE_IDS.BRONCE };
}

function addRobuxToUser(discordId, robuxAmount) {
  const data = loadLevelsData();

  if (!data[discordId]) {
    data[discordId] = {
      totalRobux: 0,
      level: 'BRONCE'
    };
  }

  data[discordId].totalRobux += robuxAmount;

  const newLevel = getLevelFromRobux(data[discordId].totalRobux);
  data[discordId].level = newLevel.key;

  saveLevelsData(data);

  return {
    totalRobux: data[discordId].totalRobux,
    level: newLevel
  };
}

async function updateMemberLevelRole(member, totalRobux) {
  const targetLevel = getLevelFromRobux(totalRobux);

  const allLevelRoleIds = Object.values(LEVEL_ROLE_IDS);

  const rolesToRemove = allLevelRoleIds.filter(roleId =>
    roleId !== targetLevel.roleId && member.roles.cache.has(roleId)
  );

  if (rolesToRemove.length > 0) {
    await member.roles.remove(rolesToRemove).catch(err => {
      console.error('Error quitando roles de nivel:', err);
    });
  }

  if (!member.roles.cache.has(targetLevel.roleId)) {
    await member.roles.add(targetLevel.roleId).catch(err => {
      console.error('Error agregando rol de nivel:', err);
    });
    return targetLevel;
  }

  return null;
}

function loadOrderCounter() {
  try {
    if (!fs.existsSync(ordersFilePath)) {
      fs.writeFileSync(
        ordersFilePath,
        JSON.stringify({ orderCounter: 1 }, null, 2)
      );
      return 1;
    }

    const rawData = fs.readFileSync(ordersFilePath, 'utf8');
    const parsedData = JSON.parse(rawData);

    return Number(parsedData.orderCounter) || 1;
  } catch (error) {
    console.error('Error leyendo orders.json:', error);
    return 1;
  }
}

function saveOrderCounter(orderCounter) {
  try {
    fs.writeFileSync(
      ordersFilePath,
      JSON.stringify({ orderCounter }, null, 2)
    );
  } catch (error) {
    console.error('Error guardando orders.json:', error);
  }
}

function loadTicketCounter() {
  try {
    if (!fs.existsSync(ticketsFilePath)) {
      fs.writeFileSync(
        ticketsFilePath,
        JSON.stringify({ ticketCounter: 1 }, null, 2)
      );
      return 1;
    }

    const rawData = fs.readFileSync(ticketsFilePath, 'utf8');
    const parsedData = JSON.parse(rawData);

    return Number(parsedData.ticketCounter) || 1;
  } catch (error) {
    console.error('Error leyendo tickets.json:', error);
    return 1;
  }
}

function saveTicketCounter(ticketCounter) {
  try {
    fs.writeFileSync(
      ticketsFilePath,
      JSON.stringify({ ticketCounter }, null, 2)
    );
  } catch (error) {
    console.error('Error guardando tickets.json:', error);
  }
}

let orderCounter = loadOrderCounter();
let ticketCounter = loadTicketCounter();

function getOrderNumber() {
  const current = orderCounter;
  orderCounter += 1;
  saveOrderCounter(orderCounter);
  return `#${String(current).padStart(2, '0')}`;
}

function getTicketNumber() {
  const current = ticketCounter;
  ticketCounter += 1;
  saveTicketCounter(ticketCounter);
  return `ticket-${String(current).padStart(2, '0')}`;
}

function getFormattedDateTime() {
  const now = new Date();
  
  const opciones = {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true  // ← Cambiado a true para formato 12 horas
  };
  
  const horaFormateada = now.toLocaleTimeString('es-PE', opciones);
  
  return `hoy a las ${horaFormateada}`;
}

function getTimeProgress(joinedAt) {
  if (!joinedAt) return null;

  const start = new Date(joinedAt);
  const now = new Date();

  const diffMs = now - start;
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return {
    diffMs,
    days,
    hours
  };
}

function formatRemainingTime(joinedAt) {
  const start = new Date(joinedAt);
  const now = new Date();

  const requiredMs = 15 * 24 * 60 * 60 * 1000;
  const remainingMs = requiredMs - (now - start);

  if (remainingMs <= 0) return null;

  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return `${days} día${days === 1 ? '' : 's'} y ${hours} hora${hours === 1 ? '' : 's'}`;
}

function getRobuxColor(amount) {
  return amount >= 5000 ? 0xFFF41A : 0x2CDB00;
}

function getItemColor() {
  return 0xFF0000;
}

function getPavosColor() {
  return 0x26FFF8;
}

function getEffectiveJoinedAt(userTracking, trackingEntry) {
  // 1. Si el grupo tiene una fecha específica grabada, es la más precisa.
  if (trackingEntry.joinedAt) return trackingEntry.joinedAt;
  
  // 2. Si no tiene fecha de grupo, la Global (puesta con /setfecha) es el respaldo absoluto.
  if (userTracking.joinedAtGlobal) return userTracking.joinedAtGlobal;
  
  return null;
}

function buildTrackedGroupLine(group, userTracking, entry) {
  const url = `https://www.roblox.com/groups/${group.id}`;
  const joinedAt = getEffectiveJoinedAt(userTracking, entry);

  if (joinedAt) {
    const progress = getTimeProgress(joinedAt);

    if (!progress) {
      return `> ${EMOJI_APROBADO} **${group.name}**
> — ${EMOJI_URL} ${url}`;
    }

    if (progress.diffMs >= 15 * 24 * 60 * 60 * 1000) {
      return `> ${EMOJI_APROBADO} **${group.name}**
> — ⏳ Tiempo en el grupo: **${progress.days} día${progress.days === 1 ? '' : 's'}** ${EMOJI_APROBADO} (**Cumple requisito**)
> — 🔔 Ya puedes recibir Robux por este grupo
> — ${EMOJI_URL} ${url}`;
    }

    const faltan = formatRemainingTime(joinedAt);

    return `> ${EMOJI_ESPERA} **${group.name}**
> — ⏳ Tiempo en el grupo: **${progress.days} día${progress.days === 1 ? '' : 's'}** ${EMOJI_ESPERA} (**Faltan ${faltan}**)
> — 🔔 Te notificaremos por DM cuando cumplas el plazo
> — ${EMOJI_URL} ${url}`;
  }

  if (entry.verified) {
    return `> ${EMOJI_APROBADO} **${group.name}**
> — ${EMOJI_APROBADO} Cumple requisito
> — ${EMOJI_URL} ${url}`;
  }

  return `> ${EMOJI_ESPERA} **${group.name}**
> — ${EMOJI_URL} ${url}`;
}

function buildGroupLine(group) {
  return `> ${EMOJI_DENEGADO} **${group.name}**
> — ${EMOJI_URL} https://www.roblox.com/groups/${group.id}`;
}

function buildRobuxEmbed({
  amount,
  robloxUsername,
  orderId,
  avatarUrl,
  origin,
  deliveryMethod = 'Grupo',
  isBooster = false
}) {
  const embedColor = isBooster ? 0xC300FF : getRobuxColor(amount);

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`**<a:93check:1498128768521469952> - ¡Se ha registrado una nueva compra!**\n\n`)
    .setDescription(
      `**<a:money:1498169871291257024> - Producto Comprado:**\n` +
      `  **<:1839_Robux:1498155082280337522> ${amount} Robux | ${deliveryMethod}**\n\n` +
      `**<:roblox:1395091569329176787> - Roblox User:**\n` +
      `  **${robloxUsername}**\n\n` +
      `**<:984149edit:1498153410917171210>- N° de Pedido:**\n` +
      `  **${orderId}**`
    )
    .setFooter({
      text: `${storeName.toUpperCase()} | ${origin.toUpperCase()} | ${getFormattedDateTime()}`
    });

  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
  }

  return embed;
}

function buildTradeEmbed({
  items,
  product,
  robloxUsername,
  orderId,
  origin,
  avatarUrl
}) {
  const itemText = items === 1 ? 'Item' : 'Items';

  const embed = new EmbedBuilder()
    .setColor(getItemColor())
    .setTitle(`**<a:93check:1498128768521469952> - ¡Se ha registrado una nueva compra!**\n\n`)
    .setDescription(
      `**${EMOJI_GIFT} - Producto Comprado:**\n` +
      `**${items} ${itemText} - ${product} | Via Trade**\n\n` +

      `**<:roblox:1395091569329176787> - Roblox User:**\n` +
      `**${robloxUsername}**\n\n` +

      `**<:984149edit:1498153410917171210> - N° de Pedido:**\n` +
      `**${orderId}**`
    )
    .setFooter({
      text: `${storeName.toUpperCase()} | ${origin.toUpperCase()} | ${getFormattedDateTime()}`
    });

  if (avatarUrl) embed.setThumbnail(avatarUrl);

  return embed;
}

function buildGiftEmbed({
  items,
  robux,
  robloxUsername,
  orderId,
  origin,
  avatarUrl
}) {
  const itemText = items === 1 ? 'Item' : 'Items';

  const embed = new EmbedBuilder()
    .setColor(getItemColor())
    .setTitle(`**<a:93check:1498128768521469952> - ¡Se ha registrado una nueva compra!**\n\n`)
    .setDescription(
      `**${EMOJI_GIFT} - Producto Comprado:**\n` +
      `**${items} ${itemText} - (<:1839_Robux:1498155082280337522> ${robux} Robux) | Via Regalo**\n\n` +

      `**<:roblox:1395091569329176787> - Roblox User:**\n` +
      `**${robloxUsername}**\n\n` +

      `**<:984149edit:1498153410917171210> - N° de Pedido:**\n` +
      `**${orderId}**`
    )
    .setFooter({
      text: `${storeName.toUpperCase()} | ${origin.toUpperCase()} | ${getFormattedDateTime()}`
    });

  if (avatarUrl) embed.setThumbnail(avatarUrl);

  return embed;
}

function buildPavosEmbed({ fortniteUser, product, pavos, origin, imageUrl }) {
  const embed = new EmbedBuilder()
    .setColor(getPavosColor()) // 0x26FFF8
    .setTitle(`**<a:93check:1498128768521469952> - ¡Se ha registrado una nueva compra!**\n\n`)
    .setDescription(
      `**<a:gifornt:1500556632189567167> - Producto Comprado:**\n` +
      `  **${product} - (<:PngItem_1066548:1500558276583231730> ${pavos}) Pavos | Via Regalo**\n\n` +
      `**<:fornais:1500560079819116677> - Fortnite User:**\n` +
      `  **${fortniteUser}**\n\n` +
      `**<:984149edit:1498153410917171210> - N° de Pedido:**\n` +
      `  **${getOrderNumber()}**`
    )
    .setFooter({
      text: `${storeName.toUpperCase()} | ${origin.toUpperCase()} | ${getFormattedDateTime()}`
    });

  // 🔥 CAMBIO AQUÍ: setThumbnail en lugar de setImage
  if (imageUrl) {
    embed.setThumbnail(imageUrl);
  }

  return embed;
}

async function getRobloxAvatar(userId) {
  try {
    const res = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
      { timeout: 10000 }
    );

    return res.data?.data?.[0]?.imageUrl || null;
  } catch (error) {
    console.error('Error avatar Roblox:', error.message);
    return null;
  }
}

async function getRobloxUser(username) {
  const res = await axios.post(
    'https://users.roblox.com/v1/usernames/users',
    { usernames: [username] },
    { timeout: 10000 }
  );

  if (!res.data.data.length) throw new Error('Usuario Roblox no encontrado');
  return res.data.data[0];
}

function isOwner(interaction) {
  const isMainOwner = interaction.user.id === OWNER_ID;
  const hasStaffRole = interaction.member.roles.cache.has('1488990445781389363'); // ID del rol Staff
  return isMainOwner || hasStaffRole;
}

function normalizePanelValue(value) {
  const v = String(value || '').toLowerCase();
  if (['robux'].includes(v)) return 'robux';
  if (['mm2', 'murder-mystery-2', 'murder_mystery_2'].includes(v)) return 'mm2';
  if (['otros', 'otros_juegos', 'otros-juegos', 'item', 'items', 'gamepass', 'articulos', 'artículos'].includes(v)) return 'otros';
  if (['tokens', 'bladeball', 'blade_ball', 'blade-ball'].includes(v)) return 'tokens';
  if (['fortnite', 'fornite', 'pavos'].includes(v)) return 'fortnite';
  if (['consulta', 'consulta_general', 'support', 'soporte', 'ayuda'].includes(v)) return 'consulta';
  return v;
}

function buildTicketEmbed(title, description, ticketNumber, color = 0xF1C40F) {
  const formattedNumber = ticketNumber.replace('ticket-', '#');

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({
      text: `PIXEL STORE | TICKET ${formattedNumber}`,
      iconURL: 'https://cdn.discordapp.com/attachments/1384965536508805315/1419889898160259253/iconos_perfil.png?ex=69ce8cc4&is=69cd3b44&hm=e2481e823966e4ec01be3f52dc08829f4d590ef83335e21db298e60f76bfd6a3&'
    });
}

async function createTicket(interaction, {
  title,
  description,
  sendPaymentMessage = true,
  type = 'default',
  color = 0xF1C40F
}) {
  const staffRole = interaction.guild.roles.cache.find(r => r.name === STAFF_ROLE_NAME);

  if (!staffRole) {
    return interaction.reply({
      content: `No encontré el rol ${STAFF_ROLE_NAME}.`,
      ephemeral: true
    });
  }

const existingTicket = interaction.guild.channels.cache.find(
  c =>
    c.type === ChannelType.GuildText &&
    c.name.startsWith('ticket-') &&
    c.permissionsFor(interaction.user)?.has(PermissionFlagsBits.ViewChannel)
);

if (existingTicket) {
  const ticketLinkRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Ir al Ticket')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${interaction.guild.id}/${existingTicket.id}`)
  );

  return interaction.reply({
    content: 'Ya tienes un ticket abierto.',
    components: [ticketLinkRow],
    ephemeral: true
  });
}

  const ticketNumber = getTicketNumber();

const channel = await interaction.guild.channels.create({
  name: ticketNumber,
    type: ChannelType.GuildText,
    permissionOverwrites: [
  {
    id: interaction.guild.id,
    deny: [PermissionFlagsBits.ViewChannel]
  },
  {
    id: interaction.user.id,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AttachFiles
    ]
  },
  {
    id: staffRole.id,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AttachFiles
    ]
  }
]
  });

  const embed = buildTicketEmbed(title, description, ticketNumber, color);

let components = [];

if (type === 'consulta') {
  // SOLO cerrar ticket
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Cerrar Ticket')
      .setStyle(ButtonStyle.Danger)
  );

  components = [row];

} else {
  // BOTONES COMPLETOS
  const buttonsRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Cerrar Ticket')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('Reclamar Ticket')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('register_ticket')
      .setLabel('Registrar Compra')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('copy_user')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji({ id: '1395091569329176787' })
  );

  const buttonsRow2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
  .setCustomId('copy_yape')
  .setLabel('Yape')
  .setStyle(ButtonStyle.Secondary)
  .setEmoji({ id: '1490794149060935838' }),

    new ButtonBuilder()
      .setCustomId('copy_plin')
      .setLabel('Plin')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji({ id: '1415001842672341083' })
  );

  components = [buttonsRow1, buttonsRow2];
}

  await channel.send({
  content: `${interaction.user}`,
  embeds: [embed],
  components
});

  const ticketLinkRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setLabel('Ir al Ticket')
    .setStyle(ButtonStyle.Link)
    .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
);

return interaction.reply({
  content: '¡Su ticket ha sido creado!',
  components: [ticketLinkRow],
  ephemeral: true
});
}

const commands = [
  new SlashCommandBuilder()
    .setName('verificar')
    .setDescription('Verifica en qué grupos de Roblox está el usuario')
    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('Nombre de usuario de Roblox')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('principal')
    .setDescription('Publicar panel principal')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('robux')
    .setDescription('Registrar compra de Robux')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName('usuario').setDescription('Usuario Roblox').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('cantidad').setDescription('Cantidad').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('origen')
        .setDescription('Origen')
        .setRequired(true)
        .addChoices(
          { name: 'WhatsApp', value: 'WHATSAPP' },
          { name: 'TikTok', value: 'TIKTOK' },
          { name: 'Discord', value: 'DISCORD' },
          { name: 'Instagram', value: 'INSTAGRAM' }
        )
    )
    .addUserOption(o =>
      o.setName('cliente_discord')
        .setDescription('Cliente de Discord')
        .setRequired(false)
    )
    .addStringOption(o =>
      o.setName('metodo')
        .setDescription('Método de entrega')
        .setRequired(false)
        .addChoices(
          { name: 'Grupo', value: 'Grupo' },
          { name: 'Gamepass', value: 'Gamepass' }
        )
    ),

  new SlashCommandBuilder()
    .setName('nivel')
    .setDescription('Ver tu progreso y nivel de cliente'),

// 🔹 TRADE (items)
new SlashCommandBuilder()
  .setName('trade')
  .setDescription('Registrar compra por trade')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(o =>
    o.setName('usuario').setDescription('Usuario Roblox').setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName('cantidad').setDescription('Cantidad de items').setRequired(true)
  )
  .addStringOption(o =>
    o.setName('producto').setDescription('Items comprados').setRequired(true)
  )
  .addStringOption(o =>
    o.setName('origen')
      .setDescription('Origen')
      .setRequired(true)
      .addChoices(
        { name: 'WhatsApp', value: 'WHATSAPP' },
        { name: 'TikTok', value: 'TIKTOK' },
        { name: 'Discord', value: 'DISCORD' },
        { name: 'Instagram', value: 'INSTAGRAM' }
      )
  ),

// 🔹 GIFT (robux)
new SlashCommandBuilder()
  .setName('gift')
  .setDescription('Registrar compra por regalo')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(o =>
    o.setName('usuario').setDescription('Usuario Roblox').setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName('cantidad').setDescription('Cantidad de items').setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName('robux').setDescription('Cantidad de robux').setRequired(true)
  )
  .addStringOption(o =>
    o.setName('origen')
      .setDescription('Origen')
      .setRequired(true)
      .addChoices(
        { name: 'WhatsApp', value: 'WHATSAPP' },
        { name: 'TikTok', value: 'TIKTOK' },
        { name: 'Discord', value: 'DISCORD' },
        { name: 'Instagram', value: 'INSTAGRAM' }
      )
  ),

   new SlashCommandBuilder()
    .setName('fortnite')
    .setDescription('Registrar compra Fortnite')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName('usuario_fortnite').setDescription('Usuario de Fortnite').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('producto')
        .setDescription('Tipo de producto')
        .setRequired(true)
        .addChoices(
          { name: 'Skin', value: 'Skin' },
          { name: 'Song', value: 'Song' },
          { name: 'Pase de Batalla', value: 'Pase de Batalla' },
          { name: 'Emote', value: 'Emote' }
        )
    )
    .addIntegerOption(o =>
      o.setName('pavos').setDescription('Cantidad de pavos').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('origen')
        .setDescription('Origen')
        .setRequired(true)
        .addChoices(
          { name: 'WhatsApp', value: 'WHATSAPP' },
          { name: 'TikTok', value: 'TIKTOK' },
          { name: 'Discord', value: 'DISCORD' },
          { name: 'Instagram', value: 'INSTAGRAM' }
        )
    )
    .addAttachmentOption(o =>
      o.setName('imagen').setDescription('Imagen opcional').setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('setfecha')
    .setDescription('Asignar fecha global a usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName('usuario').setDescription('Usuario Roblox').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('fecha').setDescription('Formato DD/MM/YYYY').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('hora').setDescription('Formato HH:MM').setRequired(false)
    )
];

const rest = new REST({ version: '10' }).setToken(token);

// --- COMANDO DE EXPORTACIÓN (TEMPORAL PARA MIGRACIÓN) ---
client.on('messageCreate', async (message) => {
  if (message.content === '!exportar') {
    if (message.author.id !== OWNER_ID) return;

    try {
      const filesToExport = [];
      const paths = [trackingFilePath, ordersFilePath, ticketsFilePath, levelsFilePath];
      
      for (const p of paths) {
        // Resolvemos la ruta: si empieza con /, probamos relativo por si acaso
        let finalPath = p;
        if (!fs.existsSync(finalPath) && finalPath.startsWith('/')) {
          finalPath = '.' + p;
        }

        if (fs.existsSync(finalPath)) {
          filesToExport.push(finalPath);
        }
      }

      if (filesToExport.length === 0) {
        return message.reply('❌ No se encontraron archivos de datos para exportar.');
      }

      await message.reply({
        content: '📦 Aquí tienes los archivos de datos para la migración:',
        files: filesToExport
      });
    } catch (err) {
      console.error('Error al exportar archivos:', err);
      message.reply('❌ Error al intentar exportar los archivos.');
    }
  }
});

async function main() {
  try {
    console.log('🚀 Iniciando bot...');

    await client.login(token);
    console.log('✅ Bot logueado');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands.map(c => c.toJSON()) }
    );

    console.log('✅ Comandos registrados');

  } catch (err) {
    console.error('❌ Error en main:', err);
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.channel.id !== VERIFY_CHANNEL_ID) return;

  try {
    await message.delete().catch(() => {});

    const warnEmbed = new EmbedBuilder()
      .setColor(0xFF2E2E)
      .setDescription(
        `${EMOJI_DENEGADO} Usa el comando **/verificar** para consultar tus grupos.\n\n` +
        `Ejemplo: **/verificar username:TuUsuario**`
      );

    const warnMsg = await message.reply({ embeds: [warnEmbed] });

    setTimeout(() => {
      warnMsg.delete().catch(() => {});
    }, 5000);

  } catch (error) {
    console.error('Error moderando canal verificador:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'panel_principal') {
      const selected = normalizePanelValue(interaction.values[0]);

      if (selected === 'robux') {
  const modal = new ModalBuilder()
    .setCustomId('robux_modal')
    .setTitle('Compra de Robux');

  const user = new TextInputBuilder()
    .setCustomId('user')
    .setLabel('¿Cuál es tu usuario de Roblox?')
    .setPlaceholder('Escribe tu @usuario')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const amount = new TextInputBuilder()
  .setCustomId('amount')
  .setLabel('¿Cuántos robux deseas comprar?')
  .setPlaceholder('Solo números (ej: 1000, 5000)')
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

  const metodo = new TextInputBuilder()
    .setCustomId('metodo')
    .setLabel('Método de entrega')
    .setPlaceholder('Grupo o Gamepass')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const dias = new TextInputBuilder()
    .setCustomId('dias')
    .setLabel('¿Cumpliste los 15 días en nuestros grupos?')
    .setPlaceholder('Si o No')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(user),
    new ActionRowBuilder().addComponents(amount),
    new ActionRowBuilder().addComponents(metodo),
    new ActionRowBuilder().addComponents(dias)
  );

  return interaction.showModal(modal);
}

      if (selected === 'mm2') {
        const modal = new ModalBuilder()
          .setCustomId('mm2_modal')
          .setTitle('Compra MM2');

        const user = new TextInputBuilder()
          .setCustomId('user')
          .setLabel('¿Cuál es tu usuario de Roblox?')
          .setPlaceholder('Escribe tu @usuario')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const item = new TextInputBuilder()
          .setCustomId('item')
          .setLabel('¿Qué set o godly deseas comprar?')
          .setPlaceholder('Nombre del set o individual')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(user),
          new ActionRowBuilder().addComponents(item)
        );

        return interaction.showModal(modal);
      }

      if (selected === 'otros') {
        const modal = new ModalBuilder()
          .setCustomId('otros_modal')
          .setTitle('Compra de Items');

        const user = new TextInputBuilder()
          .setCustomId('user')
          .setLabel('¿Cuál es tu usuario de Roblox?')
          .setPlaceholder('Escribe tu @usuario')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const item = new TextInputBuilder()
          .setCustomId('item')
          .setLabel('¿Qué item deseas comprar?')
          .setPlaceholder('Escribe el nombre del item')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const game = new TextInputBuilder()
          .setCustomId('game')
          .setLabel('¿De qué experiencia es?')
          .setPlaceholder('Nombre del juego')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const price = new TextInputBuilder()
          .setCustomId('price')
          .setLabel('¿Cuántos robux cuesta el item?')
          .setPlaceholder('Precio en robux del item')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(user),
          new ActionRowBuilder().addComponents(item),
          new ActionRowBuilder().addComponents(game),
          new ActionRowBuilder().addComponents(price)
        );

        return interaction.showModal(modal);
      }

      if (selected === 'tokens') {
        const modal = new ModalBuilder()
          .setCustomId('tokens_modal')
          .setTitle('Compra de Tokens');

        const user = new TextInputBuilder()
          .setCustomId('user')
          .setLabel('¿Cuál es tu usuario de Roblox?')
          .setPlaceholder('Escribe tu @usuario')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const amount = new TextInputBuilder()
          .setCustomId('amount')
          .setLabel('¿Cuántos tokens deseas comprar?')
          .setPlaceholder('Cantidad de tokens')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const pago = new TextInputBuilder()
          .setCustomId('pago')
          .setLabel('Método de pago')
          .setPlaceholder('Yape / Plin / Binance')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(user),
          new ActionRowBuilder().addComponents(amount),
          new ActionRowBuilder().addComponents(pago)
        );

        return interaction.showModal(modal);
      }

      if (selected === 'fortnite') {
        const modal = new ModalBuilder()
          .setCustomId('fortnite_modal')
          .setTitle('Compra Fortnite');

        const user = new TextInputBuilder()
          .setCustomId('user')
          .setLabel('¿Cuál es tu nombre de Fortnite?')
          .setPlaceholder('Escribe tu nickname')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const producto = new TextInputBuilder()
          .setCustomId('producto')
          .setLabel('Producto')
          .setPlaceholder('Skin / Emote / Pase / Otro')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const pavos = new TextInputBuilder()
          .setCustomId('pavos')
          .setLabel('¿Cuántos pavos cuesta el producto?')
          .setPlaceholder('Escribe el costo en pavos')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(user),
          new ActionRowBuilder().addComponents(producto),
          new ActionRowBuilder().addComponents(pavos)
        );

        return interaction.showModal(modal);
      }

      if (selected === 'consulta') {
        const modal = new ModalBuilder()
          .setCustomId('consulta_modal')
          .setTitle('Consulta');

        const pregunta = new TextInputBuilder()
          .setCustomId('consulta')
          .setLabel('¿Cuál es tu consulta?')
          .setPlaceholder('Describe tu consulta de la manera más clara posible')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(pregunta)
        );

        return interaction.showModal(modal);
      }

      return interaction.reply({
        content: 'Esa opción aún no está configurada.',
        ephemeral: true
      });
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'robux_modal') {
  const user = interaction.fields.getTextInputValue('user');
  const amount = interaction.fields.getTextInputValue('amount');
const amountClean = amount.trim();

if (!/^\d+$/.test(amountClean)) {
  return interaction.reply({
    content: '❌ Formato inválido\nIngresa solo números (ej: 1000, 5000)',
    ephemeral: true
  });
}
  const metodo = interaction.fields.getTextInputValue('metodo');
  const dias = interaction.fields.getTextInputValue('dias');

  const isBooster = interaction.member.roles.cache.has(BOOSTER_ROLE_ID);
const embedColor = isBooster ? 0xC300FF : 0xF1C40F;

  const estadoBooster = isBooster
    ? '<a:booster:1489402638729609357> Booster activo'
    : '<:Denegado:1481681758301720616> No (boostea el servidor y paga menos)';

  const cantidadNum = parseInt(amountClean, 10);

let precioTexto = '';

if (isBooster && !isNaN(cantidadNum) && cantidadNum >= 1000) {
  const totalBooster = (cantidadNum / 1000) * 26;
  precioTexto = `\n\n**Precio aplicado:**\nS/26 por 1K\nTotal estimado: S/${totalBooster.toFixed(2)}`;
} else if (isBooster && !isNaN(cantidadNum) && cantidadNum < 1000) {
  precioTexto = `\n\n**Precio aplicado:**\nBeneficio booster desde 1k a más`;
}

      const ticketTitle = isBooster
  ? '<a:booster:1489402638729609357> BOOSTER TICKET ABIERTO'
  : 'Ticket de Robux Abierto';

return createTicket(interaction, {
  title: ticketTitle,
  description:
  `**Cuál es su usuario de Roblox?**\n${user}\n\n` +
  `**Cuantos robux deseas comprar?**\n${amountClean}\n\n` +
  `**Metodo de entrega?**\n${metodo}\n\n` +
  `**Cumplió los 15 dias en nuestros grupos?**\n${dias}\n\n` +
  `**Estado Booster:**\n${estadoBooster}` +
  precioTexto,
  sendPaymentMessage: true,
  color: embedColor
});
    }

    if (interaction.customId === 'mm2_modal') {
      const user = interaction.fields.getTextInputValue('user');
      const item = interaction.fields.getTextInputValue('item');

      return createTicket(interaction, {
  title: 'Ticket de MM2 Abierto',
  description:
    `**Cuál es su usuario de Roblox?**\n${user}\n\n` +
    `**Que set o godly desea comprar?**\n${item}`,
  sendPaymentMessage: true
});
    }

    if (interaction.customId === 'otros_modal') {
      const user = interaction.fields.getTextInputValue('user');
      const item = interaction.fields.getTextInputValue('item');
      const game = interaction.fields.getTextInputValue('game');
      const price = interaction.fields.getTextInputValue('price');

      return createTicket(interaction, {
  title: 'Ticket de Item Abierto',
  description:
    `**Cuál es su usuario de Roblox?**\n${user}\n\n` +
    `**Que item desea comprar?**\n${item}\n\n` +
    `**De que experiencia es?**\n${game}\n\n` +
    `**Cuantos robux cuesta el item?**\n${price}`,
  sendPaymentMessage: true
});
    }

    if (interaction.customId === 'tokens_modal') {
      const user = interaction.fields.getTextInputValue('user');
      const amount = interaction.fields.getTextInputValue('amount');
      const pago = interaction.fields.getTextInputValue('pago');

      return createTicket(interaction, {
  title: 'Ticket de Tokens Abierto',
  description:
    `**Cuál es su usuario de Roblox?**\n${user}\n\n` +
    `**Cuantos tokens deseas comprar?**\n${amount}\n\n` +
    `**Metodo de pago?**\n${pago}`,
  sendPaymentMessage: true
});
    }

    if (interaction.customId === 'fortnite_modal') {
      const user = interaction.fields.getTextInputValue('user');
      const producto = interaction.fields.getTextInputValue('producto');
      const pavos = interaction.fields.getTextInputValue('pavos');

      return createTicket(interaction, {
  title: 'Ticket de Fortnite Abierto',
  description:
    `**Cuál es tu nombre de Fortnite?**\n${user}\n\n` +
    `**Producto?**\n${producto}\n\n` +
    `**Cuantos pavos cuesta el producto?**\n${pavos}`,
  sendPaymentMessage: true
});
    }

    if (interaction.customId === 'consulta_modal') {
  const consulta = interaction.fields.getTextInputValue('consulta');

  const isBooster = interaction.member.roles.cache.has(BOOSTER_ROLE_ID);

  const ticketTitle = isBooster
    ? '<a:booster:1489402638729609357> BOOSTER TICKET ABIERTO'
    : 'Ticket de Consulta Abierto';

  return createTicket(interaction, {
    title: ticketTitle,
    description: `**Cual es tu consulta?**\n${consulta}`,
    sendPaymentMessage: false,
    type: 'consulta'
  });
}
  }

  if (interaction.isButton()) {
  const isStaff = interaction.member.roles.cache.some(r => r.name === STAFF_ROLE_NAME);
  const isOwnerUser = interaction.user.id === OWNER_ID;

  // ================= COPIAR USUARIO =================
  if (interaction.customId === 'copy_user') {
    if (!isStaff && !isOwnerUser) {
      return interaction.reply({
        content: 'No tienes permiso para usar este botón.',
        ephemeral: true
      });
    }

    const embed = interaction.message.embeds[0];
    if (!embed) return;

    const desc = embed.description || '';
    const userMatch =
      desc.match(/\*\*Cu[aá]l es su usuario de Roblox\?\*\*\n(.+?)\n\n/i) ||
      desc.match(/\*\*Cu[aá]l es tu nombre de Fortnite\?\*\*\n(.+?)\n\n/i);

    const user = userMatch ? userMatch[1].trim() : 'Desconocido';

    return interaction.reply({
      content: user,
      ephemeral: true
    });
  }

// ================= COPIAR YAPE (ACTUALIZADO CON QR) =================
if (interaction.customId === 'copy_yape') {
  const yapeEmbed = new EmbedBuilder()
    .setColor('#742284')
    .setTitle('<:yape:1490794149060935838> Pago vía Yape')
    .setDescription('**Número:** 930574775 \n**Titular:** Ruben C.')
    .setImage('https://cdn.discordapp.com/attachments/1486487840614383646/1498005158011998339/d3c23b39-8118-42ed-ac0c-b5d5767bd7e6.png?ex=69ef9585&is=69ee4405&hm=eee6b3a61d08951d49e2b221fe73019003c14fd6307f81e8b3097a463e14dfdc&')
    .setFooter({ text: '¡No olvides enviar el comprobante aquí!' });

  return interaction.reply({ embeds: [yapeEmbed], ephemeral: true });
}

// ================= COPIAR PLIN (ACTUALIZADO CON QR) =================
if (interaction.customId === 'copy_plin') {
  const plinEmbed = new EmbedBuilder()
    .setColor('#00D1FF')
    .setTitle('<:plin:1415001842672341083> Pago vía Plin')
    .setDescription('**Número:** 928751208 \n**Titular:** Ruben C.')
    .setImage('https://cdn.discordapp.com/attachments/1486487840614383646/1498005159064899685/IMG_20260426_1127168467015964181906306_edit_7459173965367.jpg?ex=69ef9585&is=69ee4405&hm=4cd0b807e383beccbebf2d24cf7e4c9684086eb2d40839eb0633e42d9a690b76&')
    .setFooter({ text: '¡No olvides enviar el comprobante aquí!' });

  return interaction.reply({ embeds: [plinEmbed], ephemeral: true });
}

  // ================= CERRAR TICKET =================
  if (interaction.customId === 'close_ticket') {
    return interaction.channel.delete().catch(() => null);
  }

  // ================= RECLAMAR =================
  if (interaction.customId === 'claim_ticket') {
    if (!isStaff && !isOwnerUser) {
      return interaction.reply({
        content: 'No tienes permiso para reclamar tickets.',
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `Ticket reclamado por ${interaction.user}`,
      ephemeral: false
    });
  }

  // ================= REGISTRAR COMPRA =================
  if (interaction.customId === 'register_ticket') {
  // Usar la función isOwner mejorada
  if (!isOwner(interaction)) {
    return interaction.reply({
      content: 'No tienes permiso para registrar compras.',
      ephemeral: true
    });
  }

    const log = interaction.guild.channels.cache.get(SHOP_LOG_CHANNEL_ID);
    if (!log) {
      return interaction.reply({
        content: `No encontré el canal ${shopLogChannelName}.`,
        ephemeral: true
      });
    }

    const sourceEmbed = interaction.message.embeds[0];
    if (!sourceEmbed) {
      return interaction.reply({
        content: 'No encontré el embed del ticket.',
        ephemeral: true
      });
    }

    const title = sourceEmbed.title || '';
    const description = sourceEmbed.description || '';
    const orderId = getOrderNumber();

    let finalEmbed;
    let levelUpMessage = '';

    if (title.includes('Robux') || title.includes('BOOSTER TICKET ABIERTO')) {
      const userMatch = description.match(/\*\*Cu[aá]l es su usuario de Roblox\?\*\*\n(.+?)\n\n/i);
      const amountMatch = description.match(/\*\*Cu[aá]ntos robux deseas comprar\?\*\*\n(\d+)/i);
      const methodMatch = description.match(/\*\*M[eé]todo de entrega\?\*\*\n(.+?)\n\n/i);
      const boosterMatch = description.match(/\*\*Estado Booster:\*\*\n(.+?)(?:\n\n|$)/i);
      const boosterText = boosterMatch ? boosterMatch[1].trim() : '';
      const isBooster = /booster activo/i.test(boosterText);

      let robloxUsername = userMatch ? userMatch[1].trim() : 'Desconocido';

// 🔥 LIMPIAR @
robloxUsername = robloxUsername.replace(/^@/, '');
      const amount = amountMatch ? parseInt(amountMatch[1], 10) : 0;
      const discordId = interaction.channel.permissionOverwrites.cache
        .filter(po => po.type === 1 && po.id !== OWNER_ID)
        .map(po => po.id)[0];

      const rawMethod = methodMatch ? methodMatch[1].trim() : 'Grupo';
      let deliveryMethod = 'Grupo';

      if (rawMethod.toLowerCase().includes('gamepass')) {
        deliveryMethod = 'Gamepass';
      } else if (rawMethod.toLowerCase().includes('grupo')) {
        deliveryMethod = 'Grupo';
      } else {
        deliveryMethod = rawMethod;
      }

      let avatarUrl = null;
      try {
        const robloxUser = await getRobloxUser(robloxUsername);
        avatarUrl = await getRobloxAvatar(robloxUser.id);
      } catch (e) {
        console.error('Error avatar ticket:', e.message);
      }

      finalEmbed = buildRobuxEmbed({
        amount,
        robloxUsername,
        orderId,
        avatarUrl,
        origin: 'DISCORD',
        deliveryMethod,
        isBooster
      });

      if (discordId && amount > 0) {
        const result = addRobuxToUser(discordId, amount);

        const member = await interaction.guild.members.fetch(discordId).catch(() => null);

        if (member) {
          const newRoleAssigned = await updateMemberLevelRole(member, result.totalRobux);

          if (newRoleAssigned) {
            levelUpMessage = `\n🎉 ${member} subió a ${newRoleAssigned.name}`;
          }
        }
      }
    } else {
      return interaction.reply({
        content: 'Solo Robux se registra automático. Usa /item o /pavos manual.',
        ephemeral: true
      });
    }

    await log.send({ embeds: [finalEmbed] });

    await interaction.reply({
      content: `✅ Compra registrada ${orderId}.${levelUpMessage}`,
      ephemeral: true
    });

    return;
  }

  return;
}

if (!interaction.isChatInputCommand()) return;

const isPrivate = ['robux', 'trade', 'gift', 'fortnite', 'setfecha', 'nivel', 'verificar']
  .includes(interaction.commandName);

await interaction.deferReply({
  ephemeral: isPrivate
});

if (interaction.commandName === 'verificar') {
  try {
    let changed = false;

    const username = interaction.options.getString('username');

    const roblox = await getRobloxUser(username);
    const userId = roblox.id;

    const res = await axios.get(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
      { timeout: 10000 }
    );

    const userGroups = res.data.data.map(g => g.group.id);

    const data = loadTrackingData();
    const key = username.toLowerCase();

    if (!data[key]) {
      data[key] = { joinedAtGlobal: null, groups: {} };
      changed = true;
    }

    const tracking = data[key];
    const member = [];
    const notMember = [];

    for (const g of groups) {
      if (!tracking.groups[g.name]) {
        tracking.groups[g.name] = {
          joinedAt: null,
          everNotMember: false,
          verified: false
        };
        changed = true;
      }

      const entry = tracking.groups[g.name];

      if (userGroups.includes(g.id)) {
        if (!entry.joinedAt && entry.everNotMember && !tracking.joinedAtGlobal) {
          entry.joinedAt = getNow();
          changed = true;
        } else if (!entry.joinedAt && !entry.everNotMember && !tracking.joinedAtGlobal) {
          if (!entry.verified) {
            entry.verified = true;
            changed = true;
          }
        }

        member.push(buildTrackedGroupLine(g, tracking, entry));
      } else {
        if (!entry.everNotMember || entry.verified !== false) {
          entry.everNotMember = true;
          // Ya no borramos entry.joinedAt aquí para proteger contra fallos de la API de Roblox
          entry.verified = false;
          changed = true;
        }

        notMember.push(buildGroupLine(g));
      }
    }

    if (changed) {
      saveTrackingData(data);
    }

    const aviso = `• Deberás **cumplir 15 días** dentro de los grupos para realizar tus compras de robux.\n\n`;

    const estado =
      `${EMOJI_APROBADO} Cumple requisito\n` +
      `${EMOJI_ESPERA} En proceso (faltan días)\n` +
      `${EMOJI_DENEGADO} No unido al grupo`;

    const embed = new EmbedBuilder()
      .setColor(0x0012FF)
      .setTitle('VERIFICACIÓN DE GRUPOS')
      .setDescription(
        `${EMOJI_ROBLOX} **Usuario:** ${username}\n\n` +
        `${aviso}${estado}\n\n` +
        `${EMOJI_APROBADO} **MIEMBRO EN:**\n\n${member.join('\n\n') || 'Ninguno'}\n\n` +
        `${EMOJI_DENEGADO} **NO MIEMBRO EN:**\n\n${notMember.join('\n\n') || 'Ninguno'}`
      );

    const verifyChannel = interaction.guild.channels.cache.get(VERIFY_CHANNEL_ID);

    if (!verifyChannel) {
      return interaction.editReply('❌ No encontré el canal verificador.');
    }

    await verifyChannel.send({
      content: `${interaction.user}`,
      embeds: [embed]
    });

    const verifyLinkRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Ir al canal')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${VERIFY_CHANNEL_ID}`)
    );

    return interaction.editReply({
  content: `✅ Verificación enviada al canal <#${VERIFY_CHANNEL_ID}>`,
  components: [verifyLinkRow],
  flags: 64
});

  } catch (error) {
    console.error('Error en /verificar:', error);
    return interaction.editReply('❌ Ocurrió un error al verificar. Intenta nuevamente.');
  }
}

 if (interaction.commandName === 'setfecha') {
  if (!isOwner(interaction)) return interaction.editReply('No tienes permiso');

  const user = interaction.options.getString('usuario');
  const fechaInput = interaction.options.getString('fecha');
  const horaInput = interaction.options.getString('hora');

  if (!fechaInput.includes('/')) {
    return interaction.editReply('❌ Usa la fecha en formato DD/MM/YYYY');
  }

  const [day, month, year] = fechaInput.split('/');

  if (!day || !month || !year) {
    return interaction.editReply('❌ Usa la fecha en formato DD/MM/YYYY');
  }

  const fecha = `${year}-${month}-${day}`;

  const data = loadTrackingData();
  const key = user.toLowerCase();

  let horaFinal;
  let minutoFinal;

  if (horaInput) {
    const [hora, minuto] = horaInput.split(':');

    if (
      hora === undefined ||
      minuto === undefined ||
      isNaN(Number(hora)) ||
      isNaN(Number(minuto)) ||
      Number(hora) < 0 ||
      Number(hora) > 23 ||
      Number(minuto) < 0 ||
      Number(minuto) > 59
    ) {
      return interaction.editReply('❌ Usa la hora en formato HH:MM');
    }

    horaFinal = String(hora).padStart(2, '0');
    minutoFinal = String(minuto).padStart(2, '0');
  } else {
    const now = new Date();
    horaFinal = String(now.getHours()).padStart(2, '0');
    minutoFinal = String(now.getMinutes()).padStart(2, '0');
  }

  const fechaLocal = new Date(`${fecha}T${horaFinal}:${minutoFinal}:00-05:00`);

  if (!data[key]) {
    data[key] = {
      joinedAtGlobal: fechaLocal.toISOString(),
      groups: {}
    };
  } else {
    data[key].joinedAtGlobal = fechaLocal.toISOString();
    
    // ✅ SOLO limpia fechas de grupos que están como "verified" (sin contador)
    // ✅ NO toca grupos que ya tienen joinedAt (con contador activo)
    for (const groupName in data[key].groups) {
      const group = data[key].groups[groupName];
      if (group.verified === true && !group.joinedAt) {
        group.joinedAt = null;
      }
    }
  }

  saveTrackingData(data);
  return interaction.editReply(`✅ Fecha asignada: ${fechaInput} ${horaFinal}:${minutoFinal}`);
}

  if (interaction.commandName === 'principal') {
  if (!isOwner(interaction)) return interaction.editReply('No tienes permiso');

  try {
    const panel = panels.principal;

    if (!panel) {
      return interaction.editReply('No se encontró el panel principal en panels.json.');
    }

    const embed = new EmbedBuilder()
      .setTitle(panel.title)
      .setDescription(panel.description)
      .setColor(panel.color);

    const options = panel.options.map(option => ({
      label: option.label,
      description: option.description,
      value: option.ticketType,
      emoji: parseEmoji(option.emoji)
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId('panel_principal')
      .setPlaceholder(panel.placeholder)
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.editReply('Panel principal enviado.');
  } catch (error) {
    console.error('Error enviando panel principal:', error);
    return interaction.editReply('❌ Error al enviar el panel.');
  }
}

if (interaction.commandName === 'nivel') {
  const discordId = interaction.user.id;
  const data = loadLevelsData();

  if (!data[discordId]) {
    return interaction.editReply({
      content: '❌ Aún no tienes compras registradas.'
    });
  }

  const total = data[discordId].totalRobux;

  const LEVELS = {
    BRONCE: { name: '🥉 Bronce', req: 0 },
    SILVER: { name: '🥈 Silver', req: 3000 },
    GOLD: { name: '🥇 Gold', req: 10000 },
    DIAMOND: { name: '💎 Diamond', req: 25000 },
    ROYAL: { name: '🈹 Royal', req: 50000 },
    MYTHIC: { name: '🈳 Mythic', req: 80000 }
  };

  let current;
  let next;

  if (total >= 80000) {
    current = LEVELS.MYTHIC;
  } else if (total >= 50000) {
    current = LEVELS.ROYAL;
    next = LEVELS.MYTHIC;
  } else if (total >= 25000) {
    current = LEVELS.DIAMOND;
    next = LEVELS.ROYAL;
  } else if (total >= 10000) {
    current = LEVELS.GOLD;
    next = LEVELS.DIAMOND;
  } else if (total >= 3000) {
    current = LEVELS.SILVER;
    next = LEVELS.GOLD;
  } else {
    current = LEVELS.BRONCE;
    next = LEVELS.SILVER;
  }

  const faltan = next ? next.req - total : 0;

  const colores = {
    '🥉 Bronce': 0xCD7F32,
    '🥈 Silver': 0xC0C0C0,
    '🥇 Gold': 0xFFD700,
    '💎 Diamond': 0x00E5FF,
    '🈹 Royal': 0xFF4D6D,
    '🈳 Mythic': 0x8A2BE2
  };

  const color = colores[current.name] || 0x2B2D31;

  const embed = new EmbedBuilder()
    .setTitle('📊 Tu progreso')
    .setDescription(
      `💰 **Robux acumulados:** ${total.toLocaleString()}\n` +
      `🏆 **Nivel actual:** ${current.name}\n\n` +
      (next
        ? `📈 **Te faltan:** ${faltan.toLocaleString()} robux para ${next.name}`
        : '🔥 **Nivel máximo alcanzado**')
    )
    .setColor(color)
    .setFooter({ text: 'PIXEL STORE | NIVELES' });

  const NIVEL_CHANNEL_ID = '1489821743211221213';

  const canal = interaction.guild.channels.cache.get(NIVEL_CHANNEL_ID);

  if (!canal) {
    return interaction.editReply({
      content: '❌ Canal de niveles no configurado.'
    });
  }

  await canal.send({
  content: `📊 Nivel de ${interaction.user}`,
  embeds: [embed]
});

const nivelLinkRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setLabel('Ir al canal')
    .setStyle(ButtonStyle.Link)
    .setURL(`https://discord.com/channels/${interaction.guild.id}/${NIVEL_CHANNEL_ID}`)
);

return interaction.editReply({
  content: `✅ Tu nivel fue enviado al canal <#${NIVEL_CHANNEL_ID}>`,
  components: [nivelLinkRow],
  flags: 64
});

}
if (interaction.commandName === 'robux') {
  if (!isOwner(interaction)) return interaction.editReply('❌ No tienes permiso para usar este comando.');

  const robloxInput = interaction.options.getString('usuario');
  const amount = interaction.options.getInteger('cantidad');
  const metodo = interaction.options.getString('metodo') || 'Grupo';
  const origin = interaction.options.getString('origen');
  const clienteDiscord = interaction.options.getUser('cliente_discord');

  let robloxUser;
  let avatarUrl;

  try {
    robloxUser = await getRobloxUser(robloxInput);
    avatarUrl = await getRobloxAvatar(robloxUser.id);
  } catch (e) {
    console.error('Error Roblox:', e.message);
    return interaction.editReply('❌ Usuario de Roblox inválido o error al obtener datos.');
  }

  const orderId = getOrderNumber();

  const embed = buildRobuxEmbed({
    amount,
    robloxUsername: robloxUser.name,
    orderId,
    avatarUrl,
    origin,
    deliveryMethod: metodo
  });

  const shopLogChannel = interaction.guild.channels.cache.get(SHOP_LOG_CHANNEL_ID);

if (!shopLogChannel) {
  return interaction.editReply('❌ No encontré el canal de logs.');
}

  let levelUpMessage = '';

  if (origin === 'DISCORD' && amount > 0) {
    if (!clienteDiscord) {
      return interaction.editReply('❌ Debes seleccionar el cliente de Discord para sumar esta compra.');
    }

    const discordId = clienteDiscord.id;
    const result = addRobuxToUser(discordId, amount);

    const member = await interaction.guild.members.fetch(discordId).catch(() => null);

    if (member) {
      const newRoleAssigned = await updateMemberLevelRole(member, result.totalRobux);

      if (newRoleAssigned) {
        levelUpMessage = ` 🎉 ${member} subió a ${newRoleAssigned.name}`;
      }
    }
  }

  await shopLogChannel.send({ embeds: [embed] });
  return interaction.editReply(`Compra registrada.${levelUpMessage}`);
}

if (interaction.commandName === 'trade') {
  if (!isOwner(interaction)) return interaction.editReply('❌ No tienes permiso para usar este comando.');

  let robloxInput = interaction.options.getString('usuario').replace(/^@/, '');
  const items = interaction.options.getInteger('cantidad');
  const product = interaction.options.getString('producto');
  const origin = interaction.options.getString('origen');

  if (items <= 0) {
    return interaction.editReply('La cantidad debe ser mayor a 0.');
  }

  const itemText = items === 1 ? 'Item' : 'Items';

  let robloxUser, avatarUrl;

  try {
    robloxUser = await getRobloxUser(robloxInput);
    avatarUrl = await getRobloxAvatar(robloxUser.id);
  } catch {
    return interaction.editReply('❌ Usuario inválido.');
  }

  const orderId = getOrderNumber();

  const embed = buildTradeEmbed({
    items,
    itemText,
    product,
    robloxUsername: robloxUser.name,
    orderId,
    origin,
    avatarUrl
  });

  const channel = interaction.guild.channels.cache.get(SHOP_LOG_CHANNEL_ID);
  await channel.send({ embeds: [embed] });

  return interaction.editReply('Trade registrado.');
}

if (interaction.commandName === 'gift') {
  if (!isOwner(interaction)) return interaction.editReply('❌ No tienes permiso para usar este comando.');

  let robloxInput = interaction.options.getString('usuario').replace(/^@/, '');
  const items = interaction.options.getInteger('cantidad');
  const robux = interaction.options.getInteger('robux');
  const origin = interaction.options.getString('origen');

  if (items <= 0) {
    return interaction.editReply('La cantidad debe ser mayor a 0.');
  }

  const itemText = items === 1 ? 'Item' : 'Items';

  let robloxUser, avatarUrl;

  try {
    robloxUser = await getRobloxUser(robloxInput);
    avatarUrl = await getRobloxAvatar(robloxUser.id);
  } catch {
    return interaction.editReply('❌ Usuario inválido.');
  }

  const orderId = getOrderNumber();

  const embed = buildGiftEmbed({
    items,
    itemText,
    robux,
    robloxUsername: robloxUser.name,
    orderId,
    origin,
    avatarUrl
  });

  const channel = interaction.guild.channels.cache.get(SHOP_LOG_CHANNEL_ID);
  await channel.send({ embeds: [embed] });

  return interaction.editReply('Gift registrado.');
}

  if (interaction.commandName === 'fortnite') {
    if (!isOwner(interaction)) return interaction.editReply('❌ No tienes permiso para usar este comando.');

    const fortniteUser = interaction.options.getString('usuario_fortnite');
    const product = interaction.options.getString('producto');
    const pavos = interaction.options.getInteger('pavos');
    const origin = interaction.options.getString('origen');
    const image = interaction.options.getAttachment('imagen');

    const embed = buildPavosEmbed({
      fortniteUser,
      product,
      pavos,
      origin,
      imageUrl: image ? image.url : null
    });

    const shopLogChannel = interaction.guild.channels.cache.get(SHOP_LOG_CHANNEL_ID);

if (!shopLogChannel) {
  return interaction.editReply('❌ No encontré el canal de logs.');
}

    await shopLogChannel.send({ embeds: [embed] });
    return interaction.editReply('Compra registrada.');
  }
});

client.once('ready', () => {
  console.log('✅ Bot conectado como ' + client.user.tag);
});

main();