import React from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface RobuxTabProps {
  packages: any[];
  setPackages: (packages: any[]) => void;
  pricePer1000: number;
  setPricePer1000: (price: number) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function RobuxTab({ packages, setPackages, pricePer1000, setPricePer1000, onSave, isSaving }: RobuxTabProps) {
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

  return (
    <div className="space-y-8">
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h3 className="text-white font-bold mb-1 uppercase text-sm tracking-tight">Precio por cada 1,000 Robux</h3>
            <p className="text-white/30 text-xs">Este precio se usará para calcular el costo de las cantidades personalizadas.</p>
          </div>
          <div className="w-full md:w-48 relative">
            <input 
              type="number" 
              step="0.01" 
              value={pricePer1000} 
              onChange={(e) => setPricePer1000(parseFloat(e.target.value))} 
              className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white font-bold" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs font-bold uppercase">USD</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Paquetes Fijos</h2>
          <p className="text-white/40 text-sm">Gestiona los montos y precios predefinidos en el catálogo.</p>
        </div>
        <button onClick={addPackage} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider">
          <Plus size={16} /> Nuevo Paquete
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
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Precio (USD)</label>
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
          <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Paquetes'}
        </button>
      </div>
    </div>
  );
}
