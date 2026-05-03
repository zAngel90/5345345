import puppeteer from 'puppeteer';

const ID_PRUEBA = "110904806523075"; // El Universe ID que estamos usando

async function testAPI() {
    console.log("\n--- Probando API Oficial ---");
    try {
        const res = await fetch(`https://games.roblox.com/v1/games/${ID_PRUEBA}/game-passes?limit=10&sortOrder=Asc`);
        const data = await res.json();
        console.log(`API dice: Encontrados ${data.data?.length || 0} gamepasses`);
        data.data?.forEach(gp => console.log(` - ${gp.name}: ${gp.price} R$`));
    } catch (e) {
        console.log("Error en API:", e.message);
    }
}

async function testScraping() {
    console.log("\n--- Probando Scraping Local (Sin Cookies) ---");
    const browser = await puppeteer.launch({ headless: false }); // Lo abrimos para que VEAS qué pasa
    const page = await browser.newPage();
    try {
        await page.goto(`https://www.roblox.com/games/refer?UniverseId=${ID_PRUEBA}`, { waitUntil: 'networkidle2' });
        console.log("Página cargada. Entrando a pestaña Tienda...");
        
        await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.rbx-tab-heading, #horizontal-tabs a'));
            const storeTab = tabs.find(t => t.innerText.toLowerCase().includes('tienda') || t.innerText.toLowerCase().includes('store'));
            if (storeTab) storeTab.click();
        });

        await new Promise(r => setTimeout(r, 4000));
        
        const count = await page.evaluate(() => {
            return document.querySelectorAll('a[href*="/game-pass/"]').length;
        });
        
        console.log(`Scraping dice: Encontrados ${count} enlaces de gamepass`);
        
    } catch (e) {
        console.log("Error en Scraping:", e.message);
    }
    // await browser.close();
}

console.log("Iniciando pruebas para ID:", ID_PRUEBA);
testAPI().then(() => testScraping());
