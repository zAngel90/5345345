import React from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, Package } from 'lucide-react';

interface Mm2TabProps {
  items: any[];
  setItems: (items: any[]) => void;
  onSave: () => void;
  onTriggerUpload: (id: any) => void;
  isSaving: boolean;
  SERVER_URL: string;
}

export default function Mm2Tab({ items, setItems, onSave, onTriggerUpload, isSaving, SERVER_URL }: Mm2TabProps) {
  const newItemRef = React.useRef<HTMLDivElement>(null);

  const addItem = () => {
    const newId = Date.now();
    setItems([...items, { 
      id: newId, 
      name: 'Nuevo Item MM2', 
      price: 0, 
      image: '', 
      category: 'Skins',
      rarity: 'Godly',
      color: '#1a1c20'
    }]);
    
    // Scroll to new item after it's added
    setTimeout(() => {
      newItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(l => l.id !== id));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  // Get unique categories from existing items
  const existingCategories = Array.from(new Set(items.map(i => i.category).filter(c => c && c.trim() !== '')));

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Gestión de Murder Mystery 2</h2>
          <p className="text-white/40 text-sm">Configura los items de MM2 que la tienda tiene a la venta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            ref={idx === items.length - 1 ? newItemRef : null}
            className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 group relative overflow-hidden"
          >
            <div className="flex gap-6">
              {/* Thumbnail */}
              <div 
                onClick={() => onTriggerUpload(item.id)}
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden bg-white/5 flex items-center justify-center cursor-pointer hover:border-red-500/50 transition-all group/img relative shrink-0"
              >
                {item.image ? (
                  <img src={item.image.startsWith('http') ? item.image : `${SERVER_URL}${item.image}`} className="w-full h-full object-cover group-hover/img:opacity-40" alt="" />
                ) : (
                  <ImageIcon className="text-white/10 group-hover/img:text-red-500" size={32} />
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
                  onChange={(e) => updateItem(idx, 'name', e.target.value)} 
                  className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-bold" 
                  placeholder="Nombre del Item" 
                />
                
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Precio S/</label>
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-emerald-400 text-xs font-bold" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Precio Robux</label>
                    <input 
                      type="number" 
                      value={item.robuxPrice || ''} 
                      onChange={(e) => updateItem(idx, 'robuxPrice', e.target.value ? parseInt(e.target.value) : undefined)} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-blue-400 text-xs font-bold" 
                      placeholder="0" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Año</label>
                    <input 
                      type="text" 
                      value={item.year || '2026'} 
                      onChange={(e) => updateItem(idx, 'year', e.target.value)} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white/40 text-xs font-bold" 
                      placeholder="2026" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Stock</label>
                    <input 
                      type="number" 
                      value={item.stock || 0} 
                      onChange={(e) => updateItem(idx, 'stock', parseInt(e.target.value))} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-bold" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Rareza</label>
                    <select 
                      value={item.rarity} 
                      onChange={(e) => updateItem(idx, 'rarity', e.target.value)}
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white/60 text-xs outline-none"
                    >
                      <option value="Common">Common</option>
                      <option value="Uncommon">Uncommon</option>
                      <option value="Rare">Rare</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Godly">Godly</option>
                      <option value="Ancient">Ancient</option>
                      <option value="Unique">Unique</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Categoría</label>
                    <input 
                      type="text" 
                      value={item.category || ''} 
                      onChange={(e) => updateItem(idx, 'category', e.target.value)}
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-bold"
                      placeholder="Ej: Skins, Knives..." 
                    />
                    {existingCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {existingCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => updateItem(idx, 'category', cat)}
                            className="px-2 py-0.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg text-[9px] text-white/40 hover:text-red-400 font-bold uppercase tracking-wider transition-all"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-4 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2">
                    <span className="text-[10px] font-black text-white/20 uppercase">Aura:</span>
                    <input 
                      type="color" 
                      value={item.color || '#1a1c20'} 
                      onChange={(e) => updateItem(idx, 'color', e.target.value)}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-4 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2">
                    <span className="text-[10px] font-black text-white/20 uppercase">Badge:</span>
                    <input 
                      type="color" 
                      value={item.badgeColor || item.color || '#1a1c20'} 
                      onChange={(e) => updateItem(idx, 'badgeColor', e.target.value)}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2">
                  <span className="text-[10px] font-black text-white/20 uppercase">Texto Badge:</span>
                  <input 
                    type="color" 
                    value={item.badgeTextColor || '#ffffff'} 
                    onChange={(e) => updateItem(idx, 'badgeTextColor', e.target.value)}
                    className="w-6 h-6 bg-transparent border-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-white/40 ml-auto">{item.badgeTextColor || '#ffffff'}</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Distintivo de Estado</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={item.badge || ''} 
                      onChange={(e) => updateItem(idx, 'badge', e.target.value.toUpperCase())} 
                      placeholder="Texto (Ej: TOP)"
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-lg px-3 py-2 text-white text-[10px] font-bold" 
                    />
                    <select 
                      value={item.badgeIcon || ''} 
                      onChange={(e) => updateItem(idx, 'badgeIcon', e.target.value)}
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-lg px-2 py-2 text-white text-[10px] font-bold outline-none"
                    >
                      <option value="" className="bg-[#0d0c22] text-white">Sin Icono</option>
                      <option value="trending-up" className="bg-[#0d0c22] text-white">TOP</option>
                      <option value="flame" className="bg-[#0d0c22] text-white">HOT</option>
                      <option value="sparkles" className="bg-[#0d0c22] text-white">NEW</option>
                      <option value="star" className="bg-[#0d0c22] text-white">Star</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => removeItem(item.id)}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Trash2 size={16} /> Eliminar Item
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <Package className="mx-auto text-white/10 mb-4" size={48} />
          <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No hay items cargados</p>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <button 
          onClick={addItem} 
          className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl font-bold text-xs shadow-2xl shadow-red-600/40 hover:bg-red-500 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Agregar MM2
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
