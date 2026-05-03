import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'server', 'db', 'settings.json');

const groupIds = [
  { id: '35425734', mandatory: false },
  { id: '34320912', mandatory: true },
  { id: '36043707', mandatory: false },
  { id: '35155677', mandatory: false },
  { id: '15266551', mandatory: false },
  { id: '34009936', mandatory: false },
  { id: '35656666', mandatory: false },
];

async function updateGroups() {
  const groups = [];
  
  for (const item of groupIds) {
    try {
      const res = await fetch(`https://groups.roblox.com/v1/groups/${item.id}`);
      const data = await res.json();
      groups.push({
        id: item.id,
        name: data.name || `Grupo ${item.id}`,
        isMandatory: item.mandatory
      });
      console.log(`Fetched: ${data.name}`);
    } catch (error) {
      console.error(`Error fetching ${item.id}:`, error);
    }
  }

  let settings = {
    siteName: 'Pixel Store',
    commission: 0.7,
    currency: 'USD',
    requiredGroups: groups
  };

  if (fs.existsSync(dbPath)) {
    const current = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    settings = { ...current, requiredGroups: groups };
  }

  if (!fs.existsSync(dirname(dbPath))) {
    fs.mkdirSync(dirname(dbPath), { recursive: true });
  }

  fs.writeFileSync(dbPath, JSON.stringify(settings, null, 2));
  console.log('✅ Base de datos actualizada con los grupos');
}

updateGroups();
