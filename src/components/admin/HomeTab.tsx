import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { StoreAPI } from '../../services/api';

interface HomeTabProps {
  SERVER_URL: string;
}

export default function HomeTab({ SERVER_URL }: HomeTabProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadIndex, setUploadIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [popRes, gamesRes] = await Promise.all([
        StoreAPI.getHomePopularCategories(),
        StoreAPI.getGamesConfig()
      ]);
      if (popRes.success) setCategories(popRes.data || []);
      if (gamesRes.success) setAllCategories(gamesRes.data || []);
    } catch (err) {
      console.error('Error fetching home config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCategories([...categories, { gameId: '', customImage: '' }]);
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleUpdateCategory = (index: number, field: string, value: string) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadIndex === null) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsSaving(true);
      const res = await StoreAPI.uploadImage(formData);
      if (res.success && res.url) {
        handleUpdateCategory(uploadIndex, 'customImage', res.url);
      }
    } catch (err) {
      alert('Error al subir imagen');
    } finally {
      setIsSaving(false);
      setUploadIndex(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await StoreAPI.updateHomePopularCategories(categories);
      if (res.success) alert('Configuración guardada correctamente');
    } catch (err) {
      alert('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Juegos Populares (Home)</h3>
            <p className="text-white/30 text-sm">Configura qué juegos aparecen en la página de inicio y su imagen personalizada.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            GUARDAR CAMBIOS
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((item, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase ml-2">Juego</label>
                    <select 
                      value={item.gameId}
                      onChange={(e) => handleUpdateCategory(index, 'gameId', e.target.value)}
                      className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    >
                      <option value="">Seleccionar juego...</option>
                      {allCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveCategory(index)}
                  className="ml-4 p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase ml-2">Imagen Personalizada</label>
                <div 
                  onClick={() => { setUploadIndex(index); fileInputRef.current?.click(); }}
                  className="relative aspect-video bg-[#0d0c22] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group overflow-hidden"
                >
                  {item.customImage ? (
                    <img src={item.customImage.startsWith('http') ? item.customImage : `${SERVER_URL}${item.customImage}`} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <>
                      <ImageIcon className="text-white/10 group-hover:text-blue-500 transition-colors" size={32} />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Subir Imagen</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Plus className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddCategory}
            className="border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
              <Plus size={24} />
            </div>
            <span className="text-xs font-black text-white/20 uppercase tracking-widest group-hover:text-white/40">Añadir Categoría</span>
          </button>
        </div>
      </div>
    </div>
  );
}
