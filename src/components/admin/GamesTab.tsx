import React from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

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

export default function GamesTab({ games, setGames, products, onSave, onTriggerUpload, onManageItems, isSaving, SERVER_URL }: GamesTabProps) {
  const newItemRef = React.useRef<HTMLDivElement>(null);

  const addGame = () => {
    setGames([...games, { id: 'game-' + Date.now(), name: 'Nuevo Juego', slug: 'game-' + Date.now(), image: '', color: '#3B82F6', items: '0 items', categories: [] }]);
    
    // Scroll to new game after it's added
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

  // Obtener categorías únicas de los productos de un juego específico
  const getProductCategories = (gameId: string, currentOrder: string[] = []) => {
    const gameProducts = products.filter(p => p.game === gameId);
    const uniqueCats = Array.from(new Set(gameProducts.map(p => p.category || 'Sin Categoría').filter(c => c !== '')));
    
    // Si no hay un orden guardado, devolvemos las únicas encontradas
    if (!currentOrder || currentOrder.length === 0) return uniqueCats;

    // Si hay un orden guardado, respetarlo y añadir las nuevas que no estén en el orden
    const ordered = currentOrder.filter(c => uniqueCats.includes(c));
    const news = uniqueCats.filter(c => !currentOrder.includes(c));
    
    return [...ordered, ...news];
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Configuración de Juegos</h2>
          <p className="text-white/40 text-sm">Gestiona los juegos y el orden de sus pestañas (categorías).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, idx) => {
          const availableCategories = getProductCategories(game.id, game.categories);
          
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

                  {/* Categories Reorder */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Orden de Pestañas</label>
                      <span className="text-[9px] font-bold text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-full">Arrastra</span>
                    </div>
                    
                    <Reorder.Group 
                      axis="y" 
                      values={availableCategories} 
                      onReorder={(newOrder) => updateGame(game.id, 'categories', newOrder)}
                      className="bg-black/40 border border-white/5 rounded-2xl p-2 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar"
                    >
                      {availableCategories.length === 0 && (
                        <p className="text-[10px] text-white/20 text-center py-4 italic">No se encontraron productos con categorías asignadas para este juego.</p>
                      )}
                      {availableCategories.map((cat) => (
                        <Reorder.Item 
                          key={cat} 
                          value={cat}
                          className="flex items-center gap-3 group/cat bg-white/[0.02] border border-white/5 rounded-xl p-2 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors shadow-sm"
                        >
                          <div className="text-white/20 group-hover/cat:text-blue-500 transition-colors">
                            <GripVertical size={14} />
                          </div>
                          <span className="flex-1 text-xs text-white font-bold tracking-tight">{cat}</span>
                          <div className="text-[9px] font-black text-white/10 uppercase group-hover/cat:text-white/30 transition-colors pr-2">Mover</div>
                        </Reorder.Item>
                      ))}
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
