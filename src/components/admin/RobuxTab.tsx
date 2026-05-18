import React from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface RobuxTabProps {
  packages: any[];
  setPackages: (packages: any[]) => void;
  pricePer1000: number;
  setPricePer1000: (price: number) => void;
  customTiers: any[];
  setCustomTiers: (tiers: any[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function RobuxTab({ packages, setPackages, pricePer1000, setPricePer1000, customTiers, setCustomTiers, onSave, isSaving }: RobuxTabProps) {
  const addPackage = () => {
    setPackages([...packages, { id: Date.now(), amount: 1000, price: 10.00, popular: false, bestValue: false }]);
  };

  const removePackage = (id: any) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  const updatePackage = (idx: number, field: string, value: any) => {
    const newPacks = [...packages];
    newPacks[idx] = { ...newPacks[idx], [field]: value };
    setPackages(newPacks);
  };

  const addTier = () => {
    setCustomTiers([...customTiers, { minAmount: 0, pricePerUnit: 0.030 }]);
  };

  const removeTier = (idx: number) => {
    setCustomTiers(customTiers.filter((_, i) => i !== idx));
  };

  const updateTier = (idx: number, field: string, value: any) => {
    const newTiers = [...customTiers];
    newTiers[idx] = { ...newTiers[idx], [field]: value };
    setCustomTiers(newTiers);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h3 className="text-white font-bold mb-1 uppercase text-sm tracking-tight">Precio Base (por cada 1,000 Robux)</h3>
            <p className="text-white/30 text-xs">Se usa si no hay escalas definidas o como referencia.</p>
          </div>
          <div className="w-full md:w-48 relative">
            <input 
              type="number" 
              step="0.01" 
              value={pricePer1000} 
              onChange={(e) => setPricePer1000(parseFloat(e.target.value))} 
              className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white font-bold" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs font-bold uppercase">PEN</span>
          </div>
        </div>
      </div>

      {/* NEW SECTION: CUSTOM TIERS */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Escalas de Precio (Cantidad Personalizada)</h2>
            <p className="text-white/40 text-xs">Define cuánto cuesta 1 Robux según el volumen de compra.</p>
          </div>
          <button onClick={addTier} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600/30 transition-all">
            <Plus size={14} /> Añadir Escala
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {customTiers.map((tier, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Desde (Mín. Robux)</label>
                  <input 
                    type="number" 
                    value={tier.minAmount} 
                    onChange={(e) => updateTier(idx, 'minAmount', parseInt(e.target.value))} 
                    className="w-full bg-[#0d0c22] border border-white/10 rounded-lg px-3 py-2 text-white text-xs" 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Precio por 1 Robux (PEN)</label>
                  <input 
                    type="number" 
                    step="0.001" 
                    value={tier.pricePerUnit} 
                    onChange={(e) => updateTier(idx, 'pricePerUnit', parseFloat(e.target.value))} 
                    className="w-full bg-[#0d0c22] border border-white/10 rounded-lg px-3 py-2 text-white text-xs" 
                    placeholder="0.030"
                  />
                </div>
              </div>
              <button onClick={() => removeTier(idx)} className="p-2 text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
          {customTiers.length === 0 && (
            <div className="py-6 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-xl">
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest italic">Usando precio base global</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end pt-4">
        <div>
          <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Paquetes Fijos</h2>
          <p className="text-white/40 text-xs">Gestiona los montos y precios predefinidos en el catálogo.</p>
        </div>
        <button onClick={addPackage} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all">
          <Plus size={14} /> Nuevo Paquete
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Array.isArray(packages) ? packages.map((pkg, idx) => (
          <div key={pkg.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Robux</label>
                <input type="number" value={pkg.amount} onChange={(e) => updatePackage(idx, 'amount', parseInt(e.target.value))} className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Precio (PEN)</label>
                <input type="number" step="0.01" value={pkg.price} onChange={(e) => updatePackage(idx, 'price', parseFloat(e.target.value))} className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pkg.popular} onChange={(e) => updatePackage(idx, 'popular', e.target.checked)} className="size-4" />
                  <span className="text-[10px] font-black text-white/40 uppercase">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pkg.bestValue} onChange={(e) => updatePackage(idx, 'bestValue', e.target.checked)} className="size-4" />
                  <span className="text-[10px] font-black text-white/40 uppercase">Mejor Valor</span>
                </label>
              </div>
            </div>
            <button onClick={() => removePackage(pkg.id)} className="p-3 text-red-500/30 hover:text-red-500"><Trash2 size={20} /></button>
          </div>
        )) : (
          <div className="py-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No hay paquetes configurados</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-white/5">
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/30">
          <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
