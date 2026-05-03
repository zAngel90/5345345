import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

let browser = null;
let pagePool = [];
const MAX_POOL_SIZE = 3;
const avatarCache = new Map();

const getBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security']
    });
  }
  return browser;
};

const getPage = async () => {
  const browser = await getBrowser();
  if (pagePool.length > 0) return pagePool.pop();
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  return page;
};

const releasePage = async (page) => {
  if (pagePool.length < MAX_POOL_SIZE) {
    await page.goto('about:blank');
    pagePool.push(page);
  } else {
    await page.close();
  }
};

const injectCookie = async (page) => {
  const cookieValue = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_CAEaAhADIhwKBGR1aWQSFDE1NTAwOTMwNzcxOTQ4MTA4MzY2KAM.wVDnrhmR2Ikn-SHJ3b8CkBVLAfx2oTOGCd_0rBJq5wr9FNKUPjLz2h1i2wfAY1mZ1Ze9C4dcXR7LqSaz1lKMovssHyUVC3NtOG4IM30-bvTMN0RI3oJ5q3mqL-MT6j1r2S1yIAzdzbz8ckpG1V2IvRtTxxWoHKJSfY-MuOUAqkQpHZO6vM10GI5gBNJhLTkaf8KnKcKW6t5lP27J6a3tdsrrDp22xon58ECVYS06aop4naETVBjAzqDjMGbrCdTaaCVK8wQAPJmKze3cma8JKjjE0IMSjDbNsz3jgIk_3H2Z4Db56eVSp6b-lPLXzTlLmafuTicUB70ZF2s50GH8tIZ4Dj89ztnSYkL8Oh2P31EAK1GPCS1HRw8qKinPE4J68MGCON6wFqRbKx7deKtod1BO3tfuZS9XQAnfNjBf1wv_LOppzdE-4XGDx7ezbVtfsp4l4D0SDcfmn15_aO7WmKRXAezhjj6dUsNa9Nl8Zt3HIEgB25zBcAJ-S51c0lDMuCOCaS7pTIrrwx4sOqxaa6gWhRtqQlAWiinEDPb2qjDSU6yirV4Toc2Wm9Bh1atrvoN9JUpaM5gXT4AdMDRSXbsHEsRPuFQVxpj5Btv2jruv4dcMJK3E33YeLhqh5b5kE9z5IshqIOAz4Lny9ViKc3Q7hV--hcFlOPfq4THDWma4xw7B9s2EMkL0Muwwy2SNWOUa8YoBW-o0AVcqt9nng3-ICuKaUT4Cr1V_S4JAwQJ3medRuKwMuxqjE7o7XT5SAOUtFw";
  await page.setCookie({
    name: '.ROBLOSECURITY',
    value: cookieValue,
    domain: '.roblox.com',
    path: '/',
    secure: true,
    httpOnly: true
  });
};

/**
 * BUSCAR USUARIO (Vía Scraping - Simula navegación real)
 */
export const scrapeUserSearch = async (username) => {
  const page = await getPage();
  try {
    const searchUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}`;
    console.log(`🔍 Scrapeando búsqueda de Roblox para: ${username}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Esperar a que el contenedor de resultados aparezca
    await page.waitForSelector('.avatar-card-container, .avatar-card', { timeout: 10000 });

    // Esperar específicamente a que el texto del nombre no esté vacío
    try {
      await page.waitForFunction(() => {
        const labels = document.querySelectorAll('.avatar-card-label, .avatar-name, .text-overflow');
        for (const label of labels) {
          if (label.textContent && label.textContent.trim().length > 0) return true;
        }
        return false;
      }, { timeout: 5000 });
    } catch (e) {
      console.log('⚠️ Aviso: Tiempo de espera de renderizado de nombre agotado, intentando captura directa.');
    }

    const userData = await page.evaluate(() => {
      const firstCard = document.querySelector('.avatar-card-container, .avatar-card, [class*="AvatarCard"], .avatar-container');
      if (!firstCard) return null;

      const link = firstCard.querySelector('a[href*="/users/"]');
      if (!link) return null;

      // Intentar múltiples selectores para el nombre
      const selectors = ['.avatar-card-label', '.avatar-name', '.text-overflow', 'span', 'div'];
      let name = '';
      
      for (const selector of selectors) {
        const el = firstCard.querySelector(selector);
        if (el && el.textContent && el.textContent.trim().length > 0) {
          name = el.textContent.trim();
          break;
        }
      }

      const href = link.getAttribute('href');
      const idMatch = href.match(/\/users\/(\d+)\//);
      
      if (name.startsWith('@')) name = name.substring(1);
      
      return {
        id: idMatch ? idMatch[1] : null,
        name: name || 'Usuario Encontrado',
        avatarUrl: firstCard.querySelector('img')?.src || null
      };
    });

    await releasePage(page);

    if (userData && userData.id) {
      console.log(`✅ Usuario encontrado vía Scraping: ${userData.name} (${userData.id})`);
      
      if (userData.id && userData.avatarUrl) {
        avatarCache.set(userData.id, userData.avatarUrl);
      }

      return { 
        id: userData.id, 
        name: userData.name, 
        displayName: userData.name,
        avatarUrl: userData.avatarUrl 
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error en scrapeUserSearch (Scraping):', error.message);
    await page.close().catch(() => {});
    return null;
  }
};

/**
 * OBTENER PLACES (Vía API)
 */
export const scrapeUserPlaces = async (userId) => {
  try {
    const res = await fetch(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=10`);
    const data = await res.json();
    return (data.data || []).map(g => ({ id: g.rootPlace.id, universeId: g.id, name: g.name }));
  } catch (e) { return []; }
};

/**
 * OBTENER GAMEPASSES (Estrategia de Inventario Logueado)
 */
export const scrapePlaceGamePasses = async (inputId, userId) => {
  if (!userId) {
    console.error('❌ Error: userId es requerido para scrapear el inventario');
    return [];
  }
  const page = await getPage();
  try {
    await injectCookie(page);
    
    // Vamos al inventario del usuario en la sección de Gamepasses
    const inventoryUrl = `https://www.roblox.com/users/${userId}/inventory/#!/game-passes`;
    console.log(`🎫 Scrapeando inventario: ${inventoryUrl}`);
    
    await page.goto(inventoryUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Esperar a que cargue la lista de items
    await new Promise(r => setTimeout(r, 5000));
    
    const gamepasses = await page.evaluate(() => {
      const results = [];
      const items = Array.from(document.querySelectorAll('.item-card'));
      
      items.forEach(item => {
        const link = item.querySelector('a[href*="/game-pass/"]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        const id = href.match(/\/game-pass\/(\d+)/)?.[1];
        const name = item.querySelector('.item-card-name')?.innerText.trim();
        
        // Selectores de precio más robustos para el Inventario
        const priceEl = item.querySelector('.item-card-price, .text-robux, .price-text, .item-card-label .text-robux');
        let priceText = priceEl ? priceEl.innerText.trim() : '0';
        
        // Si el precio es "Gratis" o vacío, es 0
        const price = parseInt(priceText.replace(/\D/g, '')) || 0;
        
        results.push({
          id: parseInt(id),
          name: name || `Pass ${id}`,
          price: price,
          thumbnail: item.querySelector('img')?.src || null
        });
      });
      return results;
    });

    console.log(`✅ Inventario: Encontrados ${gamepasses.length} gamepasses:`);
    gamepasses.forEach(gp => {
      console.log(`   - ID: ${gp.id} | Nombre: ${gp.name} | Precio: ${gp.price} R$`);
    });
    
    await releasePage(page);
    return gamepasses.map(gp => ({ ...gp, placeId: inputId, displayName: gp.name }));

  } catch (error) {
    console.error('❌ Error inventario:', error.message);
    await page.close().catch(() => {});
    return [];
  }
};

/**
 * AVATAR
 */
export const scrapeUserAvatar = async (userId) => {
  try {
    // 1. Intentar desde el cache de la búsqueda actual
    if (avatarCache.has(userId)) return avatarCache.get(userId);

    // 2. Intentar API oficial
    const res = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
    const data = await res.json();
    const url = data.data?.[0]?.imageUrl;
    
    if (url) {
      avatarCache.set(userId, url);
      return url;
    }

    // 3. Fallback a URL directa (a veces funciona si la API falla por rate limit)
    return `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;
  } catch (e) { 
    return `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`; 
  }
};

/**
 * DETALLES GAMEPASS
 */
export const scrapeGamePassDetails = async (gamepassId) => {
  const page = await getPage();
  try {
    await injectCookie(page);
    await page.goto(`https://www.roblox.com/game-pass/${gamepassId}`, { waitUntil: 'domcontentloaded' });
    const details = await page.evaluate(() => {
      const title = document.querySelector('.game-pass-title, h1');
      const price = document.querySelector('.price-text, .text-robux');
      const gameLink = document.querySelector('a[href*="/games/"]');
      return {
        name: title ? title.textContent.trim() : 'Gamepass',
        price: price ? parseInt(price.textContent.replace(/\D/g, '')) || 0 : 0,
        placeId: gameLink ? parseInt(gameLink.href.match(/\/games\/(\d+)/)?.[1]) : null
      };
    });
    await releasePage(page);
    return { id: gamepassId, ...details, displayName: details.name };
  } catch (e) { return null; }
};
