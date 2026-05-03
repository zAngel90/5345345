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
  const addItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      name: 'Nuevo Item MM2', 
      price: 0, 
      image: '', 
      category: 'Skins',
      rarity: 'Godly',
      color: '#1a1c20'
    }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(l => l.id !== id));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Gestión de Murder Mystery 2</h2>
          <p className="text-white/40 text-sm">Configura los items de MM2 que la tienda tiene a la venta.</p>
        </div>
        <button onClick={addItem} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all">
          <Plus size={16} /> Agregar Item MM2
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 group relative overflow-hidden">
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
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/20 uppercase ml-1">Precio USD</label>
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))} 
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-emerald-400 text-xs font-bold" 
                      placeholder="0.00" 
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
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2">
                  <span className="text-[10px] font-black text-white/20 uppercase">Color de Aura:</span>
                  <input 
                    type="color" 
                    value={item.color || '#1a1c20'} 
                    onChange={(e) => updateItem(idx, 'color', e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-white/40">{item.color || '#1a1c20'}</span>
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

      <div className="pt-6 border-t border-white/5">
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-3 px-12 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 hover:bg-red-500 transition-all disabled:opacity-50">
          <Save size={20} /> {isSaving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </button>
      </div>
    </div>
  );
}
