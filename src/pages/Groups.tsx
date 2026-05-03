import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Search, 
  ArrowLeft, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RobloxAPI } from '../services/api';

interface Group {
  id: string;
  name: string;
  isMandatory?: boolean;
}

export default function Groups() {
  const [username, setUsername] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any>(null);

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const fetchGroupsData = async () => {
    setIsLoading(true);
    try {
      const res = await RobloxAPI.getGroupsConfig();
      if (res.success && res.data.length > 0) {
        const groupsConfig = res.data;
        const groupIds = groupsConfig.map((g: any) => g.id).join(',');
        
        // Obtener los iconos reales de los grupos vía proxy para evitar CORS
        const thumbData = await RobloxAPI.getGroupIcons(groupIds);
        
        const groupsWithIcons = groupsConfig.map((group: any) => {
          const iconData = thumbData.data?.find((t: any) => t.targetId === parseInt(group.id));
          return {
            ...group,
            iconUrl: iconData?.imageUrl || 'https://tr.rbxcdn.com/180DAY-1264c8f586940a40f89836376887550f/150/150/Image/Webp'
          };
        });
        
        setGroups(groupsWithIcons);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!username.trim()) return;
    setIsVerifying(true);
    setVerificationResults(null);
    try {
      // 1. Buscar al usuario
      const searchRes = await RobloxAPI.searchUser(username);
      if (searchRes.data && searchRes.data.length > 0) {
        const user = searchRes.data[0];
        // 2. Verificar sus grupos
        const checkRes = await RobloxAPI.checkUserGroups(user.id);
        if (checkRes.success) {
          setVerificationResults({
            user,
            results: checkRes.data.details
          });
        }
      } else {
        alert('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error verifying eligibility:', error);
      alert('Error al verificar. Revisa el nombre de usuario.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="min-h-screen bg-[#0d0c22] pt-24 pb-20 px-6 lg:px-12"
    >
      <div className="max-w-[1400px] mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start">
          
          {/* Left Column: Info & Verification */}
          <aside className="space-y-8 lg:sticky lg:top-32">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white leading-tight uppercase tracking-tight">
                Nuestros Grupos de <br />
                <span className="text-blue-500">Roblox</span>
              </h1>
              <p className="text-white/40 text-[15px] leading-relaxed max-w-sm">
                Unete a nuestros grupos para recibir Robux mediante Group Payout. Necesitas estar en el grupo por lo menos 14 dias para poder recibir pagos.
              </p>
            </div>

            {/* Steps Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6">
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Como funciona</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">1. Unete al grupo</h4>
                    <p className="text-xs text-white/40 leading-relaxed">Entra a todos nuestros grupos de Roblox.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">2. Espera 14 dias</h4>
                    <p className="text-xs text-white/40 leading-relaxed">Roblox requiere 14 dias de membresia para pagos.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">3. Recibe Robux</h4>
                    <p className="text-xs text-white/40 leading-relaxed">Ya puedes recibir Robux via Group Payout.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Check Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-white">Verifica tu elegibilidad</h3>
              <p className="text-xs text-white/40 leading-relaxed">Busca tu usuario de Roblox para ver en que grupos estas y si ya puedes recibir pagos.</p>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Buscar usuario de Roblox..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className="w-full h-12 pl-12 pr-4 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/40 transition-all"
                  />
                </div>
                <button 
                  onClick={handleVerify}
                  disabled={isVerifying || !username.trim()}
                  className="w-full h-12 bg-white/5 border border-white/5 text-white font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </button>
              </div>

              {verificationResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img src={verificationResults.user.avatarUrl} className="size-8 rounded-full border border-white/10" alt="" />
                    <div>
                      <p className="text-xs font-black text-white">{verificationResults.user.name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Estado de cuenta</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-white/30">Grupos Unidos</span>
                      <span className="text-white">{verificationResults.results.filter((r: any) => r.isMember).length} / {groups.length}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${(verificationResults.results.filter((r: any) => r.isMember).length / groups.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <Link to="/catalog/robux" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-sm font-medium transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Volver a Comprar Robux
            </Link>
          </aside>

          {/* Right Column: Groups Grid */}
          <main className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Grupos disponibles</h2>
              <div className="flex items-center gap-2 text-white/30 text-xs font-medium">
                <span>Unete a todos nuestros grupos y espera 14 dias para ser elegible</span>
                <span className="size-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">{groups.length}</span>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-start">
              <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-white/60 leading-relaxed">
                Es indispensable unirse a todos los grupos para recibir tu pedido de Robux por grupo correctamente y sin problemas.
              </p>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {isLoading ? (
                <div className="col-span-full py-20 text-center text-white/20 font-bold">Cargando grupos...</div>
              ) : groups.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                  <Users size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/20 font-bold">No hay grupos disponibles en este momento</p>
                </div>
              ) : (
                groups.map((group) => {
                  const verificationDetail = verificationResults?.results.find((r: any) => r.groupId === group.id);
                  const isMember = verificationDetail?.isMember;

                  return (
                    <div 
                      key={group.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 group/item ${
                        isMember 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : verificationResults 
                          ? 'bg-red-500/5 border-red-500/20' 
                          : 'bg-white/[0.03] border-white/5 hover:border-blue-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 rounded-xl overflow-hidden border border-white/10 bg-[#0d0c22]">
                          <img 
                            src={group.iconUrl} 
                            alt={group.name} 
                            className="size-full object-cover" 
                          />
                          {group.isMandatory && (
                            <div className="absolute -bottom-1 -right-1 size-5 bg-blue-500 border-2 border-[#0d0c22] rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 size={10} className="text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold transition-colors ${isMember ? 'text-emerald-400' : 'text-white group-hover/item:text-blue-400'}`}>{group.name}</h4>
                            {group.isMandatory && (
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-wider border border-blue-500/20">Principal</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {verificationResults ? (
                              isMember ? (
                                <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Unido
                                </span>
                              ) : (
                                <span className="text-[10px] text-red-500/60 font-black uppercase tracking-widest flex items-center gap-1">
                                  <Info size={10} /> No unido
                                </span>
                              )
                            ) : (
                              <p className="text-[11px] text-white/20 font-medium">Grupo Oficial</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <a 
                        href={`https://www.roblox.com/groups/${group.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-9 px-5 text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                          isMember 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                        }`}
                      >
                        {isMember ? 'Unido' : 'Unirse'}
                        <ChevronRight size={14} />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </main>

        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-80" />
    </motion.div>
  );
}
