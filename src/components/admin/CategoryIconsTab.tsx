import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Search, 
  LayoutGrid, 
  Info,
  ExternalLink,
  Check
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { StoreAPI } from '../../services/api';

interface CategoryIconsTabProps {
  products: any[];
  mm2Items: any[];
  limiteds: any[];
}

export default function CategoryIconsTab({ products, mm2Items, limiteds }: CategoryIconsTabProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [iconMapping, setIconMapping] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Extraer categorías únicas de todos los tipos de productos
    const prodCats = products.map(p => p.category);
    const mm2Cats = mm2Items.map(p => p.category);
    const limitedCats = limiteds.map(p => p.category);

    const allCats = [...prodCats, ...mm2Cats, ...limitedCats, 'MM2', 'Limiteds'];
    const uniqueCats = Array.from(new Set(allCats.filter(Boolean))).map(c => c || 'Otros');
    
    setCategories(uniqueCats);
    fetchIconMapping();
  }, [products, mm2Items, limiteds]);

  const fetchIconMapping = async () => {
    try {
      const res = await StoreAPI.getCategoryIconsConfig();
      if (res.success) {
        setIconMapping(res.data);
      }
    } catch (err) {
      console.error('Error fetching icon mapping:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await StoreAPI.updateCategoryIconsConfig(iconMapping);
      if (res.success) {
        alert('Iconos guardados correctamente');
      }
    } catch (err) {
      alert('Error al guardar iconos');
    } finally {
      setIsSaving(false);
    }
  };

  const updateIcon = (category: string, iconName: string) => {
    setIconMapping({ ...iconMapping, [category]: iconName });
  };

  const renderIconPreview = (iconName: string) => {
    // @ts-ignore
    const IconComponent = LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || LucideIcons.HelpCircle;
    return <IconComponent size={20} className="text-blue-500" />;
  };

  const filteredCategories = categories.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Iconos de Categorías</h2>
          <p className="text-white/30 text-xs mt-1">Asigna iconos de Lucide a cada sección de la tienda.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
        >
          {isSaving ? <LucideIcons.Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          GUARDAR CAMBIOS
        </button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start">
        <Info className="text-blue-500 shrink-0" size={20} />
        <div className="text-xs text-blue-200/70 leading-relaxed">
          Usa nombres de iconos de <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-blue-400 underline font-bold">Lucide.dev</a>. 
          Ejemplos: <code className="bg-white/10 px-1 rounded">sword</code>, <code className="bg-white/10 px-1 rounded">gem</code>, <code className="bg-white/10 px-1 rounded">apple</code>, <code className="bg-white/10 px-1 rounded">zap</code>.
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map(cat => (
          <motion.div 
            key={cat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-white/10 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              {renderIconPreview(iconMapping[cat] || 'layout-grid')}
            </div>
            
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">{cat}</label>
              <input 
                type="text" 
                value={iconMapping[cat] || ''}
                placeholder="Nombre del icono (ej: sword)"
                onChange={(e) => updateIcon(cat, e.target.value)}
                className="w-full bg-transparent border-none p-0 text-white font-bold placeholder:text-white/5 outline-none focus:placeholder:opacity-0 transition-all"
              />
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Check className="text-emerald-500" size={18} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
