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
  const newItemRef = React.useRef<HTMLDivElement>(null);

  const addLimited = () => {
    const newId = Date.now();
    setLimiteds([...limiteds, { 
      id: newId, 
      name: 'Nuevo Limited', 
      price: 0, 
      image: '', 
      assetId: '', 
      rarity: 'Limited',
      color: '#1a1c20',
      category: ''
    }]);
    
    // Scroll to new item after it's added
    setTimeout(() => {
      newItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const removeLimited = (id: number) => {
    setLimiteds(limiteds.filter(l => l.id !== id));
  };

  const updateLimited = (idx: number, field: string, value: any) => {
    const newLimiteds = [...limiteds];
    newLimiteds[idx] = { ...newLimiteds[idx], [field]: value };
    setLimiteds(newLimiteds);
  };

  // Get unique categories from existing limiteds
  const existingCategories = Array.from(new Set(limiteds.map(l => l.category).filter(c => c && c.trim() !== '')));

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Gestión de Limiteds</h2>
          <p className="text-white/40 text-sm">Configura los items limitados que la tienda tiene a la venta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {limiteds.map((item, idx) => (
          <div 
            key={item.id} 
            ref={idx === limiteds.length - 1 ? newItemRef : null}
            className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 group relative overflow-hidden"
          >
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
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Precio PEN</label>
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
                      placeholder="ID" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Año</label>
                    <input 
                      type="text" 
                      value={item.year || '2026'} 
                      onChange={(e) => updateLimited(idx, 'year', e.target.value)} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white/40 text-xs font-bold" 
                      placeholder="2026" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={item.rarity} 
                    onChange={(e) => updateLimited(idx, 'rarity', e.target.value)}
                    className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white/60 text-xs outline-none"
                  >
                    <option value="Limited" className="bg-[#0d0c22] text-white">Limited</option>
                    <option value="Limited U" className="bg-[#0d0c22] text-white">Limited Unique</option>
                    <option value="Godly" className="bg-[#0d0c22] text-white">Godly</option>
                    <option value="Ancient" className="bg-[#0d0c22] text-white">Ancient</option>
                  </select>
                  
                  <select 
                    value={item.itemType || 'NONE'} 
                    onChange={(e) => updateLimited(idx, 'itemType', e.target.value)}
                    className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-pink-400 text-xs font-bold outline-none"
                  >
                    <option value="NONE" className="bg-[#0d0c22] text-white">Tipo (Ninguno)</option>
                    <option value="UNIQUE" className="bg-[#0d0c22] text-white">UNIQUE</option>
                    <option value="LEGENDARY" className="bg-[#0d0c22] text-white">LEGENDARY</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Stock Disponible</label>
                    <input 
                      type="number" 
                      value={item.stock || 0} 
                      onChange={(e) => updateLimited(idx, 'stock', parseInt(e.target.value))} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-bold" 
                      placeholder="0" 
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer group/check">
                      <div 
                        onClick={() => updateLimited(idx, 'onRequest', !item.onRequest)}
                        className={`w-10 h-5 rounded-full p-1 transition-all ${item.onRequest ? 'bg-blue-500' : 'bg-white/10'}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transition-all ${item.onRequest ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-[9px] font-black text-white/40 uppercase group-hover/check:text-white transition-colors">Bajo Pedido</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-black text-white/20 uppercase ml-1">Categoría</label>
                  <input 
                    type="text" 
                    value={item.category || ''} 
                    onChange={(e) => updateLimited(idx, 'category', e.target.value)}
                    className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-bold"
                    placeholder="Ej: Headphones, Hats, Faces..." 
                  />
                  {existingCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {existingCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => updateLimited(idx, 'category', cat)}
                          className="px-2 py-0.5 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-lg text-[9px] text-white/40 hover:text-blue-400 font-bold uppercase tracking-wider transition-all"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-2 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Distintivo de Estado</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={item.badge || ''} 
                      onChange={(e) => updateLimited(idx, 'badge', e.target.value.toUpperCase())} 
                      placeholder="Texto"
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-lg px-2 py-1.5 text-white text-[9px] font-bold" 
                    />
                    <select 
                      value={item.badgeIcon || ''} 
                      onChange={(e) => updateLimited(idx, 'badgeIcon', e.target.value)}
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-lg px-1 py-1.5 text-white text-[9px] font-bold outline-none"
                    >
                      <option value="">Sin Icono</option>
                      <option value="trending-up">TOP</option>
                      <option value="flame">HOT</option>
                      <option value="sparkles">NEW</option>
                    </select>
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <button 
          onClick={addLimited} 
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-2xl shadow-blue-600/40 hover:bg-blue-500 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Agregar Limited
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
