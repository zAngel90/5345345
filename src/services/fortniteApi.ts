import axios from 'axios';

export interface FortniteItem {
  id: string;
  offerId: string;
  name: string;
  description: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  image: string;
  isWide?: boolean;
  isBundle?: boolean;
}

export interface FortniteShopSection {
  name: string;
  items: FortniteItem[];
}

export interface FortniteShopData {
  sections: FortniteShopSection[];
}

// Usamos la API de producción de Rammat Zone
const API_URL = 'https://api.rammatzone.com/api/fortnite/shop';

const rarityMap: Record<string, string> = {
  'common': 'common',
  'uncommon': 'uncommon',
  'rare': 'rare',
  'epic': 'epic',
  'legendary': 'legendary',
  'marvel': 'legendary',
  'dc': 'legendary',
  'icon': 'legendary',
  'starwars': 'legendary',
  'gaminglegends': 'legendary'
};

export const getFortniteShop = async (): Promise<FortniteShopData> => {
  try {
    const response = await axios.get(API_URL);
    const shopData = response.data;

    const sectionMap: Record<string, FortniteItem[]> = {};

    if (shopData.entries && Array.isArray(shopData.entries)) {
      shopData.entries.forEach((entry: any) => {
        const transformed = transformItem(entry);
        const sectionName = entry.section?.name || entry.layout?.name || 'Otras Ofertas';

        if (!sectionMap[sectionName]) {
          sectionMap[sectionName] = [];
        }
        sectionMap[sectionName].push(transformed);
      });
    }

    const sections: FortniteShopSection[] = Object.entries(sectionMap).map(([name, items]) => {
      // Ordenar items: Bundles primero
      items.sort((a, b) => {
        if (a.isBundle && !b.isBundle) return -1;
        if (!a.isBundle && b.isBundle) return 1;
        return 0;
      });

      // Solo el primer bundle de cada sección es grande
      let foundFirstBundle = false;
      const processedItems = items.map(item => {
        if (item.isBundle) {
          if (!foundFirstBundle) {
            foundFirstBundle = true;
            return item;
          } else {
            return { ...item, isBundle: false };
          }
        }
        return item;
      });

      return { name, items: processedItems };
    });

    // Ordenar secciones
    sections.sort((a, b) => {
      const isMusic = (name: string) => 
        name.toLowerCase().match(/jam|track|music|pista|canci/);
      const isOther = (name: string) => 
        name.toLowerCase().includes('otras ofertas');
      
      const hasBundle = (s: FortniteShopSection) => s.items.some(i => i.isBundle);

      if (isMusic(a.name) && !isMusic(b.name)) return 1;
      if (!isMusic(a.name) && isMusic(b.name)) return -1;
      
      if (isOther(a.name) && !isOther(b.name)) return 1;
      if (!isOther(a.name) && isOther(b.name)) return -1;

      const aHas = hasBundle(a);
      const bHas = hasBundle(b);
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;

      return a.name.localeCompare(b.name);
    });

    return { sections };
  } catch (error) {
    console.error('Error fetching Fortnite shop:', error);
    return { sections: [] };
  }
};

function transformItem(entry: any): FortniteItem {
  const item = entry.brItems?.[0] || entry.items?.[0] || {};
  const bundle = entry.bundle;
  const track = entry.tracks?.[0];
  const isBundle = !!bundle && !!(bundle.name && bundle.name.toLowerCase().match(/bundle|lote/));
  
  let name = (isBundle ? bundle?.name : item.name) || item.name || track?.title || 'Objeto Desconocido';
  
  if (!name || name === 'Objeto Desconocido') {
    if (entry.devName) {
      const match = entry.devName.match(/\d+\s*x\s*([^,]+?)(?:\s+for\s+|\s*,)/i);
      if (match && match[1]) {
        name = match[1].trim();
      }
    }
  }
  
  let description = item.description || '';
  if (isBundle) {
    description = bundle?.info || `Lote con ${bundle?.items?.length || 0} objetos`;
  } else if (track) {
    description = `${track.artist} - ${track.releaseYear || 'N/A'}`;
  }
  
  let type = item.type?.displayValue || item.type?.value || 'Objeto';
  if (isBundle) {
    type = 'Lote';
  } else if (track) {
    type = 'Pista de Improvisación';
  }
  
  const rarityValue = item.rarity?.value || 'common';
  const rarity = (rarityMap[rarityValue.toLowerCase()] || 'common') as any;
  const price = entry.finalPrice || 0;
  
  let image = '';
  if (track?.albumArt) {
    image = track.albumArt;
  } else if (isBundle && bundle?.image) {
    image = bundle.image;
  } else if (item.images?.featured) {
    image = item.images.featured;
  } else if (item.images?.icon) {
    image = item.images.icon;
  } else if (item.images?.smallIcon) {
    image = item.images.smallIcon;
  } else if (entry.newDisplayAsset?.renderImages?.[0]?.image) {
    image = entry.newDisplayAsset.renderImages[0].image;
  }

  if (!image) {
    image = `https://placehold.co/512x512/6b7280/ffffff?text=${encodeURIComponent(name)}`;
  }

  return {
    id: entry.offerId || item.id || `item-${Math.random()}`,
    offerId: entry.offerId,
    name,
    description,
    type,
    rarity,
    price,
    image,
    isWide: !!track,
    isBundle
  };
}
