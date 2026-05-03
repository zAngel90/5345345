import React, { useState } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, X } from 'lucide-react';
import { StoreAPI } from '../../services/api';

interface PaymentField {
  label: string;
  value: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  image: string;
  active: boolean;
  instructions: string;
  fields: PaymentField[];
}

interface PaymentMethodsTabProps {
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  onSave: () => void;
  isSaving: boolean;
  onTriggerUpload: (id: string) => void;
  SERVER_URL: string;
}

export default function PaymentMethodsTab({ 
  paymentMethods, 
  setPaymentMethods, 
  onSave, 
  isSaving, 
  onTriggerUpload,
  SERVER_URL 
}: PaymentMethodsTabProps) {
  const [newMethodName, setNewMethodName] = useState('');

  const handleAddMethod = () => {
    if (!newMethodName) return;
    const newId = newMethodName.toLowerCase().replace(/\s+/g, '-');
    setPaymentMethods([...paymentMethods, { 
      id: newId, 
      name: newMethodName, 
      image: '', 
      active: true, 
      instructions: '',
      fields: [] 
    }]);
    setNewMethodName('');
  };

  const handleRemoveMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setPaymentMethods(paymentMethods.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const handleUpdateMethod = (id: string, updates: Partial<PaymentMethod>) => {
    setPaymentMethods(paymentMethods.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleAddField = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method) {
      const newFields = [...(method.fields || []), { label: '', value: '' }];
      handleUpdateMethod(id, { fields: newFields });
    }
  };

  const handleRemoveField = (id: string, index: number) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method) {
      const newFields = method.fields.filter((_, i) => i !== index);
      handleUpdateMethod(id, { fields: newFields });
    }
  };

  const handleUpdateField = (id: string, index: number, fieldUpdates: Partial<PaymentField>) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method) {
      const newFields = method.fields.map((f, i) => i === index ? { ...f, ...fieldUpdates } : f);
      handleUpdateMethod(id, { fields: newFields });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Métodos de Pago</h2>
        <p className="text-white/40 text-sm">Configura los métodos de pago con campos copiables e instrucciones.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Agregar Nuevo Método</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Nombre del Método (ej: Nequi, PayPal)" 
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
            className="flex-1 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
          />
          <button 
            onClick={handleAddMethod}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            <Plus size={18} /> Agregar
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] group transition-all hover:bg-white/[0.04]">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div 
                  onClick={() => onTriggerUpload(method.id)}
                  className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center cursor-pointer border border-white/10 hover:border-blue-500/50 overflow-hidden group/img relative"
                >
                  {method.image ? (
                    <img src={method.image.startsWith('http') ? method.image : `${SERVER_URL}${method.image}`} className="w-full h-full object-contain p-2" alt="" />
                  ) : (
                    <ImageIcon className="text-white/20" size={24} />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <Plus className="text-white" size={18} />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xl">{method.name}</h4>
                  <p className="text-xs text-white/20 uppercase font-black tracking-widest">ID: {method.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={method.active} 
                    onChange={() => handleToggleActive(method.id)} 
                  />
                  <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <button 
                  onClick={() => handleRemoveMethod(method.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fields Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Campos Copiables</label>
                  <button 
                    onClick={() => handleAddField(method.id)}
                    className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                  >
                    <Plus size={12} /> Añadir Campo
                  </button>
                </div>
                <div className="space-y-3">
                  {method.fields?.map((field, index) => (
                    <div key={index} className="flex gap-2 group/field">
                      <input 
                        type="text" 
                        placeholder="Etiqueta (ej: Cuenta)" 
                        value={field.label}
                        onChange={(e) => handleUpdateField(method.id, index, { label: e.target.value })}
                        className="w-1/3 bg-[#0d0c22] border border-white/10 rounded-xl px-3 py-2 text-white text-[11px] outline-none focus:border-blue-500/50"
                      />
                      <input 
                        type="text" 
                        placeholder="Valor a copiar" 
                        value={field.value}
                        onChange={(e) => handleUpdateField(method.id, index, { value: e.target.value })}
                        className="flex-1 bg-[#0d0c22] border border-white/10 rounded-xl px-3 py-2 text-white text-[11px] outline-none focus:border-blue-500/50"
                      />
                      <button 
                        onClick={() => handleRemoveField(method.id, index)}
                        className="p-2 text-white/10 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(!method.fields || method.fields.length === 0) && (
                    <div className="text-center py-4 border border-dashed border-white/5 rounded-2xl">
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Sin campos configurados</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Instrucciones Generales</label>
                <textarea 
                  placeholder="Instrucciones adicionales que aparecerán debajo de los campos..."
                  value={method.instructions || ''}
                  onChange={(e) => handleUpdateMethod(method.id, { instructions: e.target.value })}
                  className="w-full h-[120px] bg-[#0d0c22] border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500/50 resize-none transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-[0.98]"
        >
          <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
