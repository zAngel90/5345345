import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { StoreAPI } from '../../services/api';

export default function SettingsTab() {
  const [links, setLinks] = useState<any>({});
  const [faqs, setFaqs] = useState<any[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [isSavingFaqs, setIsSavingFaqs] = useState(false);
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [linksRes, faqsRes, deliveryRes] = await Promise.all([
        StoreAPI.getSocialLinks(),
        StoreAPI.getFaqs(),
        StoreAPI.getDeliveryMethods()
      ]);
      if (linksRes.success) setLinks(linksRes.data);
      if (faqsRes.success) setFaqs(faqsRes.data);
      if (deliveryRes.success) setDeliveryMethods(deliveryRes.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLinks = async () => {
    setIsSavingLinks(true);
    try {
      const res = await StoreAPI.updateSocialLinks(links);
      if (res.success) showToast('Enlaces guardados correctamente', 'success');
      else showToast('Error al guardar enlaces', 'error');
    } catch {
      showToast('Error al guardar enlaces', 'error');
    } finally {
      setIsSavingLinks(false);
    }
  };

  const handleSaveFaqs = async () => {
    setIsSavingFaqs(true);
    try {
      const res = await StoreAPI.updateFaqs(faqs);
      if (res.success) showToast('FAQ guardadas correctamente', 'success');
      else showToast('Error al guardar FAQ', 'error');
    } catch {
      showToast('Error al guardar FAQ', 'error');
    } finally {
      setIsSavingFaqs(false);
    }
  };

  const handleSaveDelivery = async () => {
    setIsSavingDelivery(true);
    try {
      const res = await StoreAPI.updateDeliveryMethods(deliveryMethods);
      if (res.success) showToast('Métodos de entrega guardados', 'success');
      else showToast('Error al guardar métodos de entrega', 'error');
    } catch {
      showToast('Error al guardar métodos de entrega', 'error');
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const addFaq = () => {
    const newFaq = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      order: faqs.length
    };
    setFaqs([...faqs, newFaq]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const moveFaq = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;
    const updated = [...faqs];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFaqs(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-white/50" size={32} />
      </div>
    );
  }

  const linkKeys = ['whatsapp', 'discord', 'instagram', 'tiktok', 'custom'];

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold backdrop-blur-md border ${
          toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ============ REDES SOCIALES ============ */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Redes Sociales</h3>
            <p className="text-sm text-white/40 mt-1">Configura los enlaces de tus redes sociales</p>
          </div>
          <button
            onClick={handleSaveLinks}
            disabled={isSavingLinks}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm"
          >
            {isSavingLinks ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Guardar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkKeys.map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                {key === 'custom' ? 'Enlace Personalizado' : key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              {key === 'custom' && (
                <input
                  type="text"
                    placeholder="Etiqueta (ej: TikTok)"
                  value={links[key]?.label || ''}
                  onChange={(e) => setLinks({ ...links, [key]: { ...links[key], label: e.target.value, url: links[key]?.url || '' } })}
                  className="w-full mb-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500/50 transition-all placeholder-white/20"
                />
              )}
              <input
                type="url"
                placeholder={`https://${key}.com/...`}
                value={links[key]?.url || ''}
                onChange={(e) => setLinks({ ...links, [key]: { ...links[key], url: e.target.value, label: links[key]?.label || key } })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500/50 transition-all placeholder-white/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ============ MÉTODOS DE ENTREGA ============ */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Métodos de Entrega</h3>
            <p className="text-sm text-white/40 mt-1">Activa o desactiva los métodos de entrega disponibles</p>
          </div>
          <button
            onClick={handleSaveDelivery}
            disabled={isSavingDelivery}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm"
          >
            {isSavingDelivery ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Guardar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(deliveryMethods).map(([key, method]: [string, any]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div>
                <p className="text-sm font-bold text-white">{method.label || key}</p>
                <p className="text-xs text-white/40 mt-0.5">{key === 'gamepass' ? 'Entrega vía Gamepass de Roblox' : 'Entrega vía Grupo de Roblox'}</p>
              </div>
              <button
                onClick={() => setDeliveryMethods({ ...deliveryMethods, [key]: { ...method, enabled: !method.enabled } })}
                className={`relative w-12 h-6 rounded-full transition-all ${method.enabled ? 'bg-blue-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${method.enabled ? 'left-6.5' : 'left-0.5'}`}
                  style={{ transform: method.enabled ? 'translateX(0)' : 'translateX(0)', left: method.enabled ? '24px' : '3px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ============ FAQ ============ */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Preguntas Frecuentes</h3>
            <p className="text-sm text-white/40 mt-1">Administra las preguntas frecuentes que se muestran en la página</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addFaq}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm"
            >
              <Plus size={16} />
              Añadir Pregunta
            </button>
            <button
              onClick={handleSaveFaqs}
              disabled={isSavingFaqs}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm"
            >
              {isSavingFaqs ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-white/20 cursor-move" />
                  <span className="text-xs font-bold text-white/40">Pregunta #{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveFaq(index, 'up')} disabled={index === 0} className="p-1.5 text-white/30 hover:text-white disabled:opacity-20 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button onClick={() => moveFaq(index, 'down')} disabled={index === faqs.length - 1} className="p-1.5 text-white/30 hover:text-white disabled:opacity-20 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <button onClick={() => removeFaq(index)} className="p-1.5 text-red-400/50 hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Pregunta"
                value={faq.question}
                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500/50 transition-all placeholder-white/20"
              />
              <textarea
                placeholder="Respuesta (puedes usar HTML)"
                value={faq.answer}
                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500/50 transition-all placeholder-white/20 resize-y"
              />
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-center text-white/30 text-sm py-8">No hay preguntas frecuentes. Haz clic en "Añadir FAQ" para crear una.</p>
          )}
        </div>
      </div>
    </div>
  );
}
