import React from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, ExternalLink, Package } from 'lucide-react';

interface LimitedsTabProps {
  limiteds: any[];
  setLimiteds: (limiteds: any[]) => void;
  onSave: () => void;
  onTriggerUpload: (id: any) => void;
  isSaving: boolean;
  SERVER_URL: string;
}

export default function LimitedsTab({ limiteds, setLimiteds, onSave, onTriggerUpload, isSaving, SERVER_URL }: LimitedsTabProps) {
  const addLimited = () => {
    setLimiteds([...limiteds, { 
      id: Date.now(), 
      name: 'Nuevo Limited', 
      price: 0, 
      image: '', 
      assetId: '', 
      rarity: 'Limited',
      color: '#1a1c20'
    }]);
  };

  const removeLimited = (id: number) => {
    setLimiteds(limiteds.filter(l => l.id !== id));
  };

  const updateLimited = (idx: number, field: string, value: any) => {
    const newLimiteds = [...limiteds];
    newLimiteds[idx] = { ...newLimiteds[idx], [field]: value };
    setLimiteds(newLimiteds);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Gestión de Limiteds</h2>
          <p className="text-white/40 text-sm">Configura los items limitados que la tienda tiene a la venta.</p>
        </div>
        <button onClick={addLimited} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
          <Plus size={16} /> Agregar Limited
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {limiteds.map((item, idx) => (
          <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 group relative overflow-hidden">
            <div className="flex gap-6">
              {/* Thumbnail */}
              <div 
                onClick={() => onTriggerUpload(item.id)}
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group/img relative shrink-0"
              >
                {item.image ? (
                  <img src={item.image.startsWith('http') ? item.image : `${SERVER_URL}${item.image}`} className="w-full h-full object-cover group-hover/img:opacity-40" alt="" />
                ) : (
                  <ImageIcon className="text-white/10 group-hover/img:text-blue-500" size={32} />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <Plus className="text-white" size={24} />
                </div>
              </div>

              {/* Data */}
              <div className="flex-1 space-y-3">
                <input 
                  type="text" 
                  value={item.name} 
                  onChange={(e) => updateLimited(idx, 'name', e.target.value)} 
                  className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-bold" 
                  placeholder="Nombre del Limited" 
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Precio USD</label>
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateLimited(idx, 'price', parseFloat(e.target.value))} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-emerald-400 text-xs font-bold" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Asset ID</label>
                    <input 
                      type="text" 
                      value={item.assetId} 
                      onChange={(e) => updateLimited(idx, 'assetId', e.target.value)} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-blue-400 text-xs font-mono" 
                      placeholder="ID de Roblox" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={item.rarity} 
                    onChange={(e) => updateLimited(idx, 'rarity', e.target.value)}
                    className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white/60 text-xs outline-none"
                  >
                    <option value="Limited">Limited</option>
                    <option value="Limited U">Limited Unique</option>
                    <option value="Godly">Godly</option>
                    <option value="Ancient">Ancient</option>
                  </select>
                  
                  <div className="flex items-center gap-2 bg-[#0d0c22] border border-white/10 rounded-xl px-2">
                    <input 
                      type="color" 
                      value={item.color || '#1a1c20'} 
                      onChange={(e) => updateLimited(idx, 'color', e.target.value)}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={item.category || ''} 
                      onChange={(e) => updateLimited(idx, 'category', e.target.value)}
                      className="flex-1 bg-transparent border-none text-[10px] text-white/40 focus:text-white transition-colors outline-none"
                      placeholder="Categoría" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => window.open(`https://www.roblox.com/catalog/${item.assetId}`, '_blank')}
                disabled={!item.assetId}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-30"
              >
                <ExternalLink size={12} /> Ver en Roblox
              </button>
              <button 
                onClick={() => removeLimited(item.id)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {limiteds.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <Package className="mx-auto text-white/10 mb-4" size={48} />
          <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No hay items cargados</p>
        </div>
      )}

      <div className="pt-6 border-t border-white/5">
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-3 px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all disabled:opacity-50">
          <Save size={20} /> {isSaving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </button>
      </div>
    </div>
  );
}
