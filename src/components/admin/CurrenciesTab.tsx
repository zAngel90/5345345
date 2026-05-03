import React, { useState } from 'react';
import { Plus, Trash2, Save, DollarSign, Globe, CheckCircle2, XCircle } from 'lucide-react';

interface CurrenciesTabProps {
  currencies: any[];
  setCurrencies: (currencies: any[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function CurrenciesTab({ currencies, setCurrencies, onSave, isSaving }: CurrenciesTabProps) {
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
    rate: 1,
    flag: '',
    active: true
  });

  const handleAddCurrency = () => {
    if (!newCurrency.code || !newCurrency.name) return;
    setCurrencies([...currencies, { ...newCurrency }]);
    setNewCurrency({
      code: '',
      name: '',
      symbol: '',
      rate: 1,
      flag: '',
      active: true
    });
  };

  const handleRemoveCurrency = (code: string) => {
    setCurrencies(currencies.filter(c => c.code !== code));
  };

  const handleToggleActive = (code: string) => {
    setCurrencies(currencies.map(c => c.code === code ? { ...c, active: !c.active } : c));
  };

  const handleUpdateRate = (code: string, rate: number) => {
    setCurrencies(currencies.map(c => c.code === code ? { ...c, rate } : c));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Tasas de Cambio</h2>
        <p className="text-white/40 text-sm">Configura las monedas y sus valores respecto al Dólar (USD).</p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Agregar Nueva Moneda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            type="text" placeholder="Código (Ej: COP)" value={newCurrency.code}
            onChange={(e) => setNewCurrency({...newCurrency, code: e.target.value.toUpperCase()})}
            className="bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
          />
          <input 
            type="text" placeholder="Nombre (Ej: Peso Colombiano)" value={newCurrency.name}
            onChange={(e) => setNewCurrency({...newCurrency, name: e.target.value})}
            className="bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
          />
          <input 
            type="text" placeholder="Símbolo (Ej: $)" value={newCurrency.symbol}
            onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
            className="bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
          />
          <input 
            type="number" placeholder="Tasa vs USD (Ej: 4000)" value={newCurrency.rate}
            onChange={(e) => setNewCurrency({...newCurrency, rate: parseFloat(e.target.value)})}
            className="bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
          />
          <div className="flex items-center gap-3 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3">
            <input 
              type="text" placeholder="Bandera (co, mx...)" value={newCurrency.flag}
              onChange={(e) => setNewCurrency({...newCurrency, flag: e.target.value.toLowerCase()})}
              className="bg-transparent text-white text-sm outline-none w-full"
            />
            <div className="w-6 h-4 overflow-hidden rounded-sm bg-white/5 shrink-0 border border-white/10">
                <img 
                    src={`https://flagcdn.com/w80/${newCurrency.flag || 'us'}.png`} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e) => (e.target as any).src = 'https://flagcdn.com/w80/un.png'}
                />
            </div>
          </div>
        </div>
        <button onClick={handleAddCurrency} className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold text-sm">
          <Plus size={18} /> Agregar Moneda
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currencies.map((curr) => (
          <div key={curr.code} className={`flex items-center justify-between p-4 bg-white/[0.03] border rounded-2xl transition-all ${curr.active ? 'border-white/5' : 'border-red-500/20 opacity-60'}`}>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-xl overflow-hidden shrink-0">
                <img src={`https://flagcdn.com/w80/${curr.flag}.png`} className="w-full h-full object-cover" alt="" onError={(e) => (e.target as any).src = 'https://flagcdn.com/w80/us.png'} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">{curr.code}</h4>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{curr.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs">Rate:</span>
                    <input 
                        type="number" 
                        value={curr.rate} 
                        onChange={(e) => handleUpdateRate(curr.code, parseFloat(e.target.value))}
                        className="w-20 bg-transparent border-b border-white/10 text-sm text-blue-400 font-bold focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="hidden md:block">
                    <span className="text-[10px] text-white/30 uppercase font-black">1 USD = {curr.rate} {curr.code}</span>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={() => handleToggleActive(curr.code)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            curr.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                    >
                        {curr.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {curr.active ? 'Activa' : 'Inactiva'}
                    </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {curr.code !== 'USD' && (
                <button onClick={() => handleRemoveCurrency(curr.code)} className="p-2 text-red-500/50 hover:text-red-500"><Trash2 size={18} /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30">
          <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
