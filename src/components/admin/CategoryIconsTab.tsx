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
  const [iconMapping, setIconMapping] = useState<Record<string, { icon: string, color?: string }>>({});
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
        // Asegurar que el formato sea el nuevo (objeto con icon y color)
        const mapping = res.data || {};
        const normalized: Record<string, { icon: string, color?: string }> = {};
        
        Object.keys(mapping).forEach(key => {
          if (typeof mapping[key] === 'string') {
            normalized[key] = { icon: mapping[key], color: '' };
          } else {
            normalized[key] = mapping[key];
          }
        });
        
        setIconMapping(normalized);
      }
    } catch (err) {
      console.error('Error fetching icon mapping:', err);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await StoreAPI.updateCategoryIconsConfig(iconMapping);
      if (res.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving icons:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateIcon = (category: string, iconName: string) => {
    const current = iconMapping[category] || { icon: '', color: '' };
    setIconMapping({ ...iconMapping, [category]: { ...current, icon: iconName } });
  };

  const updateColor = (category: string, color: string) => {
    const current = iconMapping[category] || { icon: '', color: '' };
    setIconMapping({ ...iconMapping, [category]: { ...current, color } });
  };

  const renderIconPreview = (mapping: { icon: string, color?: string }) => {
    const iconName = mapping?.icon || 'layout-grid';
    
    // Convertir kebab-case (layout-grid) a PascalCase (LayoutGrid)
    const pascalName = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    // @ts-ignore
    const IconComponent = LucideIcons[pascalName] || LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || LucideIcons.HelpCircle;
    
    const color = mapping?.color || '#3b82f6';
    return <IconComponent size={20} style={{ color }} />;
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
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${
            showSuccess 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
          } disabled:opacity-50`}
        >
          {isSaving ? (
            <LucideIcons.Loader2 className="animate-spin" size={18} />
          ) : showSuccess ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}
          {showSuccess ? 'GUARDADO CON ÉXITO' : isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 font-bold text-xs"
        >
          <Check size={16} /> ¡Configuración de iconos y colores actualizada correctamente!
        </motion.div>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map(cat => (
          <motion.div 
            key={cat}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a16] border border-white/5 p-6 rounded-[32px] flex items-center gap-6 group hover:border-blue-500/20 transition-all shadow-xl hover:shadow-blue-500/5"
          >
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner relative overflow-hidden"
              style={{ 
                background: iconMapping[cat]?.color ? `${iconMapping[cat]?.color}15` : 'rgba(255,255,255,0.03)',
                borderColor: iconMapping[cat]?.color ? `${iconMapping[cat]?.color}30` : 'rgba(255,255,255,0.1)',
                borderWidth: '1px'
              }}
            >
              {renderIconPreview(iconMapping[cat])}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{cat}</span>
                <input 
                  type="color" 
                  value={iconMapping[cat]?.color || '#3b82f6'}
                  onChange={(e) => updateColor(cat, e.target.value)}
                  className="w-6 h-6 rounded-md overflow-hidden bg-transparent border-none cursor-pointer p-0"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/5 focus-within:border-blue-500/30 transition-all">
                <LucideIcons.Type size={14} className="text-white/20" />
                <input 
                  type="text" 
                  value={iconMapping[cat]?.icon || ''}
                  placeholder="Nombre del icono"
                  onChange={(e) => updateIcon(cat, e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 text-white font-bold text-xs outline-none placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Check className="text-emerald-500" size={20} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
