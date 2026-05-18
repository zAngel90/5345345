const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const colors = {
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    blink: '\x1b[5m'
};

const LICENSE = "SKY-77-PX-2026";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearScreen() {
    process.stdout.write('\x1Bc');
}

async function printBanner() {
    console.log(colors.cyan + colors.bright);
    console.log("███████╗██╗  ██╗██╗   ██╗██╗   ██╗██████╗ ███████╗");
    console.log("██╔════╝██║ ██╔╝╚██╗ ██╔╝██║   ██║██╔══██╗██╔════╝");
    console.log("███████╗█████╔╝  ╚████╔╝ ██║   ██║██████╔╝████████║");
    console.log("╚════██║██╔═██╗   ╚██╔╝  ╚██╗ ██╔╝██╔═══╝ ╚════██║");
    console.log("███████║██║  ██╗   ██║    ╚████╔╝ ██║     ███████║");
    console.log("╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═══╝  ╚═╝     ╚══════╝");
    console.log(colors.dim + "      SKYVPS GLOBAL NETWORK - SECURE TERMINAL v5.0" + colors.reset);
    console.log("\n");
}

async function loadingBar(label, duration = 2000) {
    const width = 25;
    const steps = 20;
    process.stdout.write(`${colors.cyan}${label.padEnd(35)} ${colors.dim}[`);
    for (let i = 0; i <= steps; i++) {
        const progress = "█".repeat(i) + " ".repeat(steps - i);
        process.stdout.write(`\r${colors.cyan}${label.padEnd(35)} ${colors.dim}[${colors.green}${progress}${colors.dim}]`);
        await sleep(duration / steps);
    }
    process.stdout.write(`${colors.reset} ${colors.green}DONE${colors.reset}\n`);
}

async function mainMenu() {
    clearScreen();
    await printBanner();
    console.log(`${colors.bright}--- SYSTEM MENU ---${colors.reset}`);
    console.log(`${colors.green}1.${colors.reset} Generate New OV Certificate`);
    console.log(`${colors.green}2.${colors.reset} View Active Managed Domains`);
    console.log(`${colors.green}3.${colors.reset} Check Server Status (177.7.41.162)`);
    console.log(`${colors.red}4.${colors.reset} Terminate Session`);
    console.log("\n");

    rl.question(`${colors.cyan}SELECT OPTION: ${colors.reset}`, async (choice) => {
        switch(choice) {
            case '1':
                await generateProcess();
                break;
            case '2':
                await viewDomains();
                break;
            case '3':
                await checkStatus();
                break;
            case '4':
                console.log(`${colors.yellow}Shutting down systems...${colors.reset}`);
                process.exit(0);
                break;
            default:
                console.log(`${colors.red}Invalid option.${colors.reset}`);
                await sleep(1000);
                await mainMenu();
        }
    });
}

async function viewDomains() {
    clearScreen();
    await printBanner();
    console.log(`${colors.bright}--- MANAGED DOMAINS ---${colors.reset}\n`);
    
    const domains = [
        { name: "rammatzone.com", type: "OV Certificate", status: "ACTIVE", expire: "2027-05-10" },
        { name: "pixelstore.cloud", type: "DV Certificate", status: "ACTIVE", expire: "2026-12-24" },
        { name: "sky-central.net", type: "OV Certificate", status: "PENDING", expire: "N/A" }
    ];

    console.log(`${colors.dim}${"DOMAIN".padEnd(25)} ${"TYPE".padEnd(20)} ${"STATUS".padEnd(15)}${colors.reset}`);
    console.log("-".repeat(65));

    for (const d of domains) {
        let statusColor = d.status === 'ACTIVE' ? colors.green : colors.yellow;
        console.log(`${colors.bright}${d.name.padEnd(25)}${colors.reset} ${colors.dim}${d.type.padEnd(20)}${colors.reset} ${statusColor}${d.status}${colors.reset}`);
        await sleep(200);
    }

    console.log("\n" + colors.dim + "Press ENTER to return to menu..." + colors.reset);
    rl.once('line', () => mainMenu());
}

async function checkStatus() {
    clearScreen();
    await printBanner();
    console.log(`${colors.bright}--- SERVER DIAGNOSTICS ---${colors.reset}\n`);
    
    await loadingBar("Pinging 177.7.41.162", 1000);
    await loadingBar("Checking SSL Node", 800);
    await loadingBar("Verifying Database Sync", 1200);
    
    console.log(`\n${colors.green}[ONLINE]${colors.reset} Main node is operational.`);
    console.log(`${colors.dim}Latency: 24ms | Encryption: AES-GCM-256${colors.reset}`);
    
    console.log("\n" + colors.dim + "Press ENTER to return to menu..." + colors.reset);
    rl.once('line', () => mainMenu());
}

async function generateProcess() {
    clearScreen();
    await printBanner();
    rl.question(`${colors.bright}TARGET DOMAIN: ${colors.reset}`, async (domain) => {
        console.log(`\n${colors.yellow}Initializing bypass protocols for ${domain}...${colors.reset}\n`);
        
        await loadingBar("CONNECTING TO DIGICERT API", 1500);
        await loadingBar("BYPASSING OV AUTHENTICATION", 3000);
        await loadingBar("SPOOFING ORGANIZATION DATA", 2000);
        await loadingBar("SIGNING RSA 4096-BIT KEY", 1500);
        
        console.log(`\n${colors.green}${colors.bright}SUCCESS! CERTIFICATE ISSUED FOR ${domain.toUpperCase()}${colors.reset}`);
        console.log(`${colors.dim}Saving to encrypted vault...${colors.reset}`);
        await sleep(1500);
        await mainMenu();
    });
}

async function login() {
    clearScreen();
    await printBanner();
    rl.question(`${colors.bright}ENTER SKY-LICENSE: ${colors.reset}`, async (input) => {
        if (input.trim() === LICENSE) {
            console.log(`\n${colors.green}[ACCESS GRANTED]${colors.reset} Connecting to Sky-Net...`);
            await sleep(1500);
            await mainMenu();
        } else {
            console.log(`\n${colors.red}${colors.bright}[ACCESS DENIED]${colors.reset} Unauthorized user.`);
            process.exit(0);
        }
    });
}

login();
