import React, { useState } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, GripVertical, Server, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

interface CategoryConfig {
  name: string;
  deliveryEnabled: boolean;
  deliveryServerUrl: string;
}

interface GamesTabProps {
  games: any[];
  setGames: (games: any[]) => void;
  products: any[];
  onSave: () => void;
  onTriggerUpload: (id: any) => void;
  onManageItems: (id: string) => void;
  isSaving: boolean;
  SERVER_URL: string;
}

function normalizeCategory(cat: string | CategoryConfig): CategoryConfig {
  if (typeof cat === 'string') {
    return { name: cat, deliveryEnabled: false, deliveryServerUrl: '' };
  }
  return {
    name: cat.name,
    deliveryEnabled: cat.deliveryEnabled || false,
    deliveryServerUrl: cat.deliveryServerUrl || '',
  };
}

function getCatDisplayName(cat: string | CategoryConfig): string {
  return typeof cat === 'string' ? cat : cat.name;
}

export default function GamesTab({ games, setGames, products, onSave, onTriggerUpload, onManageItems, isSaving, SERVER_URL }: GamesTabProps) {
  const newItemRef = React.useRef<HTMLDivElement>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const addGame = () => {
    setGames([...games, { id: 'game-' + Date.now(), name: 'Nuevo Juego', slug: 'game-' + Date.now(), image: '', color: '#3B82F6', items: '0 items', categories: [] }]);
    setTimeout(() => {
      newItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const removeGame = (id: string) => {
    setGames(games.filter(g => g.id !== id));
  };

  const updateGame = (id: string, field: string, value: any) => {
    const newGames = games.map(g => g.id === id ? { ...g, [field]: value } : g);
    setGames(newGames);
  };

  const updateCategoryConfig = (gameId: string, catIndex: number, field: keyof CategoryConfig, value: any) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const rawCats = game.categories || [];
    const normalized = rawCats.map(normalizeCategory);
    normalized[catIndex] = { ...normalized[catIndex], [field]: value };

    const newGames = games.map(g => g.id === gameId ? { ...g, categories: normalized } : g);
    setGames(newGames);
  };

  const toggleCatExpanded = (key: string) => {
    const next = new Set(expandedCats);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedCats(next);
  };

  // Obtener categorías únicas de los productos de un juego específico
  const getProductCategories = (gameId: string): CategoryConfig[] => {
    const gameProducts = products.filter(p => p.game === gameId);
    const uniqueCats = Array.from(new Set(gameProducts.map(p => p.category || 'Sin Categoría').filter(c => c !== '')));

    const rawCats = games.find(g => g.id === gameId)?.categories || [];

    // Normalizar las existentes
    const existingNormalized = rawCats.map(normalizeCategory);

    // Respetar orden guardado y añadir nuevas
    const ordered = existingNormalized.filter(c => uniqueCats.includes(c.name));
    const news = uniqueCats.filter(c => !existingNormalized.some(e => e.name === c)).map(name => ({ name, deliveryEnabled: false, deliveryServerUrl: '' }));

    return [...ordered, ...news];
  };

  const handleReorderCategories = (gameId: string, newOrder: CategoryConfig[]) => {
    const newGames = games.map(g => g.id === gameId ? { ...g, categories: newOrder } : g);
    setGames(newGames);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Configuración de Juegos</h2>
          <p className="text-white/40 text-sm">Gestiona los juegos, sus categorías y el modo de entrega.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, idx) => {
          const availableCategories = getProductCategories(game.id);

          return (
            <div
              key={game.id}
              ref={idx === games.length - 1 ? newItemRef : null}
              className="bg-white/[0.03] border border-white/5 rounded-[32px] p-6 space-y-6 relative group/card overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <button
                onClick={() => removeGame(game.id)}
                className="absolute top-4 right-4 p-2 text-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/card:opacity-100 z-10"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex gap-6 relative z-10">
                <div className="flex flex-col gap-2 shrink-0">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Portada</span>
                  <div
                    onClick={() => onTriggerUpload(game.id)}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden bg-black/40 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group relative shadow-inner"
                  >
                    {game.image ? (
                      <img src={game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" alt="" />
                    ) : (
                      <ImageIcon className="text-white/10 group-hover:text-blue-500" size={24} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Nombre del Juego</label>
                    <input
                      type="text"
                      value={game.name}
                      onChange={(e) => updateGame(game.id, 'name', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm font-bold focus:border-blue-500/30 transition-all outline-none"
                      placeholder="Ej: Blox Fruits"
                    />
                  </div>

                  {/* Categories with Delivery Config */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Categorías y Entrega</label>
                      <span className="text-[9px] font-bold text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-full">Arrastra</span>
                    </div>

                    <Reorder.Group
                      axis="y"
                      values={availableCategories}
                      onReorder={(newOrder) => handleReorderCategories(game.id, newOrder)}
                      className="bg-black/40 border border-white/5 rounded-2xl p-2 space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar"
                    >
                      {availableCategories.length === 0 && (
                        <p className="text-[10px] text-white/20 text-center py-4 italic">No se encontraron productos con categorías asignadas para este juego.</p>
                      )}
                      {availableCategories.map((cat, catIdx) => {
                        const catKey = `${game.id}-${cat.name}`;
                        const isExpanded = expandedCats.has(catKey);
                        const hasDelivery = cat.deliveryEnabled;

                        return (
                          <Reorder.Item
                            key={cat.name}
                            value={cat}
                            className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:bg-white/5 transition-colors shadow-sm"
                          >
                            {/* Category Row */}
                            <div className="flex items-center gap-2 p-2 cursor-grab active:cursor-grabbing">
                              <div className="text-white/20 hover:text-blue-500 transition-colors">
                                <GripVertical size={14} />
                              </div>
                              <span className="flex-1 text-xs text-white font-bold tracking-tight truncate">{cat.name}</span>

                              {/* Delivery Toggle */}
                              <div className="flex items-center gap-2">
                                <div
                                  onClick={(e) => { e.stopPropagation(); updateCategoryConfig(game.id, catIdx, 'deliveryEnabled', !cat.deliveryEnabled); }}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${hasDelivery ? 'bg-emerald-500/50' : 'bg-white/10'}`}
                                >
                                  <div className={`w-4 h-4 rounded-full shadow-lg transition-all ${hasDelivery ? 'translate-x-4 bg-emerald-400' : 'translate-x-0 bg-white/50'}`} />
                                </div>
                                {hasDelivery && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleCatExpanded(catKey); }}
                                    className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                                  >
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Delivery Config Expandable */}
                            {hasDelivery && isExpanded && (
                              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Server size={12} className="text-emerald-400" />
                                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Servidor de Entrega</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Globe size={14} className="text-white/30 shrink-0" />
                                  <input
                                    type="text"
                                    value={cat.deliveryServerUrl}
                                    onChange={(e) => updateCategoryConfig(game.id, catIdx, 'deliveryServerUrl', e.target.value)}
                                    placeholder="https://www.roblox.com/share?code=..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
                                  />
                                </div>
                                <p className="text-[9px] text-white/20">Esta URL se enviará al usuario cuando apruebes la entrega.</p>
                              </div>
                            )}
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group/check inline-flex">
                      <div
                        onClick={() => updateGame(game.id, 'hidden', !game.hidden)}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${game.hidden ? 'bg-red-500/50' : 'bg-emerald-500/20 border border-emerald-500/20'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-all ${game.hidden ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${game.hidden ? 'text-red-400' : 'text-emerald-400'}`}>
                        {game.hidden ? 'Oculto en Tienda' : 'Visible en Tienda'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onManageItems(game.id)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 group/btn"
              >
                Gestionar Catálogo <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <button
          onClick={addGame}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-2xl shadow-blue-600/40 hover:bg-blue-500 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Agregar Juego
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-2xl shadow-emerald-600/40 hover:bg-emerald-500 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
