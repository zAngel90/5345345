import React from 'react';
import { Save, Crown, Users, Star, Shield, Diamond, Zap, Leaf } from 'lucide-react';

interface LevelPricingTabProps {
  levelPricing: Record<string, number>;
  setLevelPricing: (data: Record<string, number>) => void;
  onSave: () => void;
  isSaving: boolean;
}

const LEVELS = [
  { id: 'NINGUNO', name: 'Sin Rango', icon: Leaf, color: 'text-white/30', bgColor: 'bg-white/5' },
  { id: 'BRONCE', name: 'Bronce', icon: Shield, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  { id: 'SILVER', name: 'Plata', icon: Star, color: 'text-slate-300', bgColor: 'bg-slate-400/10' },
  { id: 'GOLD', name: 'Oro', icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  { id: 'DIAMOND', name: 'Diamante', icon: Diamond, color: 'text-blue-300', bgColor: 'bg-blue-400/10' },
  { id: 'ROYAL', name: 'Real', icon: Crown, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  { id: 'MYTHIC', name: 'Mítico', icon: Zap, color: 'text-red-500', bgColor: 'bg-red-500/10' },
];

export default function LevelPricingTab({ levelPricing, setLevelPricing, onSave, isSaving }: LevelPricingTabProps) {
  const updateLevel = (levelId: string, value: number) => {
    const newPricing = { ...levelPricing };
    if (value > 0) {
      newPricing[levelId] = value;
    } else {
      delete newPricing[levelId];
    }
    setLevelPricing(newPricing);
  };

  const getValue = (levelId: string) => levelPricing[levelId] || 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Precios por Nivel</h2>
        <p className="text-white/40 text-sm">Define un precio especial por cada 1,000 Robux según el nivel del usuario. Si no tiene precio asignado, se usará el precio base global.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {LEVELS.map((level) => {
          const Icon = level.icon;
          return (
            <div key={level.id} className={`${level.bgColor} border border-white/10 rounded-xl p-4 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${level.bgColor}`}>
                <Icon size={20} className={level.color} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-black ${level.color}`}>{level.name}</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">ID: {level.id}</p>
              </div>
              <div className="w-48 relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={getValue(level.id)}
                  onChange={(e) => updateLevel(level.id, parseFloat(e.target.value) || 0)}
                  placeholder="--"
                  className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-right outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold uppercase">S/ / 1000</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-3">¿Cómo funciona?</h3>
        <ul className="space-y-2 text-xs text-white/40 leading-relaxed">
          <li>• Si un nivel tiene un precio definido, los usuarios con ese nivel verán ese precio por cada 1,000 Robux.</li>
          <li>• Si un nivel no tiene precio definido o el valor es 0, se usará el precio base global (configurado en Paquetes Robux).</li>
          <li>• El precio por nivel reemplaza tanto el precio base como las escalas por volumen.</li>
        </ul>
      </div>

      <div className="pt-6 border-t border-white/5">
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all disabled:opacity-50">
          <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
