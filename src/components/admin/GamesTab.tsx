import React from 'react';
import { Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';

interface GamesTabProps {
  games: any[];
  setGames: (games: any[]) => void;
  onSave: () => void;
  onTriggerUpload: (id: any) => void;
  onManageItems: (id: string) => void;
  isSaving: boolean;
  SERVER_URL: string;
}

export default function GamesTab({ games, setGames, onSave, onTriggerUpload, onManageItems, isSaving, SERVER_URL }: GamesTabProps) {
  const addGame = () => {
    setGames([...games, { id: 'game-' + Date.now(), name: 'Nuevo Juego', slug: 'game-' + Date.now(), image: '', color: '#3B82F6', items: '0 items' }]);
  };

  const removeGame = (id: string) => {
    setGames(games.filter(g => g.id !== id));
  };

  const updateGame = (id: string, field: string, value: any) => {
    const newGames = games.map(g => g.id === id ? { ...g, [field]: value } : g);
    setGames(newGames);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Configuración de Juegos</h2>
          <p className="text-white/40 text-sm">Gestiona los juegos y sus portadas.</p>
        </div>
        <button onClick={addGame} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">
          <Plus size={16} /> Agregar Juego
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, idx) => (
          <div key={game.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div 
                onClick={() => onTriggerUpload(game.id)}
                className="w-20 h-20 rounded-xl border border-dashed border-white/10 overflow-hidden bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group relative"
              >
                {game.image ? (
                  <img src={game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`} className="w-full h-full object-cover group-hover:opacity-40" alt="" />
                ) : (
                  <ImageIcon className="text-white/10 group-hover:text-blue-500" size={24} />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="text-white" size={20} />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <input type="text" value={game.name} onChange={(e) => updateGame(game.id, 'name', e.target.value)} className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-sm" placeholder="Nombre del Juego" />
                <div className="flex gap-2">
                  <input type="text" value={game.color} onChange={(e) => updateGame(game.id, 'color', e.target.value)} className="flex-1 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-xs" placeholder="#Hex Color" />
                  <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: game.color }} />
                </div>
              </div>
              <button onClick={() => removeGame(game.id)} className="p-2 text-red-500/30 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
            <button onClick={() => onManageItems(game.id)} className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">
              Gestionar Items In-Game
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30">
          <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Juegos'}
        </button>
      </div>
    </div>
  );
}
