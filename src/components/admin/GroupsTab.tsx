import React, { useState } from 'react';
import { Plus, ShieldCheck, ExternalLink, Trash2, Save, Users } from 'lucide-react';

import { SERVER_URL } from '../../services/api';

interface GroupsTabProps {
  groups: any[];
  setGroups: (groups: any[]) => void;
  onSave: () => void;
  isSaving: boolean;
  isLoading: boolean;
}

export default function GroupsTab({ groups, setGroups, onSave, isSaving, isLoading }: GroupsTabProps) {
  const [newGroupId, setNewGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMandatory, setNewGroupMandatory] = useState(false);

  React.useEffect(() => {
    const fetchIcons = async () => {
      const missingIcons = groups.filter(g => !g.iconUrl).map(g => g.id);
      if (missingIcons.length > 0) {
        try {
          const res = await fetch(`${SERVER_URL}/api/groups/icons?groupIds=${missingIcons.join(',')}`);
          const data = await res.json();
          if (data.data) {
            setGroups(groups.map(g => {
              const icon = data.data.find((i: any) => i.targetId === parseInt(g.id));
              return icon ? { ...g, iconUrl: icon.imageUrl } : g;
            }));
          }
        } catch (err) {
          console.error('Error fetching group icons:', err);
        }
      }
    };
    if (groups.length > 0) fetchIcons();
  }, [groups.length]);

  const handleAddGroup = () => {
    if (!newGroupId || !newGroupName) return;
    setGroups([...groups, { id: newGroupId, name: newGroupName, isMandatory: newGroupMandatory }]);
    setNewGroupId('');
    setNewGroupName('');
  };

  const handleRemoveGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const handleToggleMandatory = (id: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, isMandatory: !g.isMandatory } : g));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Gestión de Grupos</h2>
        <p className="text-white/40 text-sm">Configura los grupos obligatorios para la entrega de Robux.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Agregar Nuevo Grupo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text" placeholder="ID del Grupo" value={newGroupId}
            onChange={(e) => setNewGroupId(e.target.value)}
            className="bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
          />
          <input 
            type="text" placeholder="Nombre del Grupo" value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={newGroupMandatory} onChange={(e) => setNewGroupMandatory(e.target.checked)} />
            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            <span className="ms-3 text-xs font-bold text-white/60 uppercase tracking-widest">Obligatorio</span>
          </label>
        </div>
        <button onClick={handleAddGroup} className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold text-sm">
          <Plus size={18} /> Agregar Grupo
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-blue-500 font-bold text-xs overflow-hidden">
                <img src={group.iconUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${group.id}&width=150&height=150&format=png`} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{group.name}</h4>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">ID: {group.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleToggleMandatory(group.id)} className={`p-2 ${group.isMandatory ? 'text-blue-500' : 'text-white/20'}`}><ShieldCheck size={18} /></button>
              <a href={`https://www.roblox.com/groups/${group.id}`} target="_blank" className="p-2 text-white/20 hover:text-white"><ExternalLink size={18} /></a>
              <button onClick={() => handleRemoveGroup(group.id)} className="p-2 text-red-500/50 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30">
          <Save size={20} /> {isSaving ? 'Guardando...' : 'Guardar Grupos'}
        </button>
      </div>
    </div>
  );
}
