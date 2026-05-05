import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Shield,
  ShoppingBag,
  LogOut,
  Mail,
  Phone,
  MessageSquare,
  Camera,
  Link as LinkIcon,
  Crown,
  Trophy,
  CheckCircle2,
  Wallet,
  Tag,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RobloxAPI, StoreAPI, AuthAPI, SERVER_URL, OrdersAPI } from '../services/api';

const LEVEL_CONFIG: Record<string, { name: string, color: string, next: number | null, icon: any, desc: string }> = {
  BRONCE: { 
    name: 'Bronce Pixel', 
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', 
    next: 3000, 
    icon: Star,
    desc: 'Tu comienzo en la comunidad. ¡Sigue sumando!' 
  },
  SILVER: { 
    name: 'Silver Pixel', 
    color: 'bg-slate-400/10 text-slate-300 border-slate-400/20', 
    next: 10000, 
    icon: Shield,
    desc: 'Un cliente fiel. Desbloquea beneficios exclusivos.' 
  },
  GOLD: { 
    name: 'Gold Pixel', 
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', 
    next: 25000, 
    icon: Trophy,
    desc: 'Nivel avanzado. Reconocimiento en el servidor.' 
  },
  DIAMOND: { 
    name: 'Diamond Pixel', 
    color: 'bg-blue-400/10 text-blue-300 border-blue-400/20', 
    next: 50000, 
    icon: Crown,
    desc: 'Usuario distinguido. Prioridad en soporte.' 
  },
  ROYAL: { 
    name: 'Royal Pixel', 
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', 
    next: 80000, 
    icon: Crown,
    desc: 'Miembro de la realeza. Beneficios VIP.' 
  },
  MYTHIC: { 
    name: 'Mythic Pixel', 
    color: 'bg-red-500/10 text-red-400 border-red-500/20', 
    next: null, 
    icon: Crown,
    desc: '¡El nivel máximo! Una leyenda de la Pixel Store.' 
  }
};

const SIDEBAR_SECTIONS = [
  {
    title: 'CUENTA',
    items: [
      { id: 'perfil', label: 'Perfil', icon: User },
      { id: 'privacidad', label: 'Privacidad', icon: Lock },
      { id: 'seguridad', label: 'Seguridad', icon: Shield },
    ]
  },
  {
    title: 'ACTIVIDAD',
    items: [
      { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag },
      { id: 'billetera', label: 'Mi Billetera', icon: Wallet },
      { id: 'descuentos', label: 'Descuentos', icon: Tag }
    ]
  },
  {
    title: 'PROGRESO',
    items: [
      { id: 'tiers', label: 'Pixel Tiers', icon: Crown }
    ]
  }
];

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (!savedUser) {
      navigate('/');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchOrders(parsedUser.id, parsedUser.username);
      
      // Refresh profile data from server to get latest robux/level
      AuthAPI.getProfile().then(res => {
        if (res.success) {
          setUser(res.data);
          localStorage.setItem('pixel_user', JSON.stringify(res.data));
        }
      }).catch(err => console.error('Error refreshing profile:', err));
    }
  }, [navigate]);

  const getProgress = () => {
    if (!user) return { percent: 0, next: 0, current: 0 };
    const config = LEVEL_CONFIG[user.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.BRONCE;
    if (!config.next) return { percent: 100, next: 0, current: user.totalRobux || 0 };
    
    const prevThreshold = Object.values(LEVEL_CONFIG).find(c => c.next === config.next) ? 0 : 0; // Simplified
    // Encontrar el umbral anterior
    const levels = Object.keys(LEVEL_CONFIG);
    const currentIndex = levels.indexOf(user.level || 'BRONCE');
    const prevLevelKey = currentIndex > 0 ? levels[currentIndex - 1] : null;
    const prevThresholdVal = prevLevelKey ? LEVEL_CONFIG[prevLevelKey].next || 0 : 0;

    const range = config.next - prevThresholdVal;
    const progressInLevel = (user.totalRobux || 0) - prevThresholdVal;
    const percent = Math.min(Math.max((progressInLevel / range) * 100, 0), 100);

    return {
      percent,
      next: config.next,
      current: user.totalRobux || 0,
      needed: config.next - (user.totalRobux || 0)
    };
  };

  const fetchOrders = async (userId: string, username: string) => {
    setIsLoadingOrders(true);
    try {
      const [resById, resByUsername] = await Promise.all([
        OrdersAPI.getUserOrders(userId),
        OrdersAPI.getUserOrders(username)
      ]);

      let allOrders = [];
      if (resById.success) allOrders = [...resById.data];
      if (resByUsername.success) {
        const existingIds = new Set(allOrders.map(o => o.id));
        const extraOrders = resByUsername.data.filter((o: any) => !existingIds.has(o.id));
        allOrders = [...allOrders, ...extraOrders];
      }

      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pixel_token');
    localStorage.removeItem('pixel_user');
    navigate('/');
    window.location.reload();
  };

  const handleUpdateProfile = async (updates: any) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const res = await AuthAPI.updateProfile(updates);
      if (res.success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('pixel_user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUpdating(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pixel_token')}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Error al subir la imagen al servidor');
      }

      const data = await res.json();

      if (data.success) {
        const updatedUser = { ...user, avatar: data.url };
        const updateRes = await AuthAPI.updateProfile({ avatar: data.url });

        if (updateRes.success) {
          setUser(updatedUser);
          localStorage.setItem('pixel_user', JSON.stringify(updatedUser));
          alert('¡Foto de perfil actualizada correctamente!');
        }
      }
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  );

  if (!user) return null;

  const progress = getProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#0d0c22] pt-28 pb-20 px-4 md:px-8 lg:px-12"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Mi Cuenta</h1>
          <p className="text-white/20 text-sm mt-1">Gestión de perfil y pedidos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                <img src={user.avatar?.startsWith('http') ? user.avatar : `${SERVER_URL}${user?.avatar || '/avatar.png'}`} alt="Avatar" className="size-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{user.username}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-black uppercase tracking-wider ${
                    LEVEL_CONFIG[user.level as keyof typeof LEVEL_CONFIG]?.color || 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {LEVEL_CONFIG[user.level as keyof typeof LEVEL_CONFIG]?.name || 'Cliente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-3 space-y-6">
              {SIDEBAR_SECTIONS.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h5 className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{section.title}</h5>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all group ${activeTab === item.id
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
                          }`}
                      >
                        <item.icon size={18} className={activeTab === item.id ? 'text-blue-400' : 'group-hover:text-white transition-colors'} />
                        <span className="text-sm font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-3xl bg-white/[0.03] border border-white/5 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all group"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold">Cerrar Sesión</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'perfil' && (
                  <div className="space-y-8">
                    {/* Large Banner Card */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group/banner">
                      {/* Premium Oval Pattern (Matching Checkout) */}
                      <div className="absolute top-[-10%] right-[-15%] w-[70%] h-[60%] bg-white/[0.03] rounded-[100%] rotate-[-25deg] pointer-events-none group-hover/banner:bg-white/[0.05] transition-colors duration-700" />
                      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[50%] bg-white/[0.02] rounded-[100%] rotate-[15deg] pointer-events-none group-hover/banner:bg-white/[0.04] transition-colors duration-700" />
                      <div className="absolute top-[20%] left-[-20%] w-[50%] h-[40%] bg-white/[0.015] rounded-[100%] rotate-[-10deg] pointer-events-none group-hover/banner:bg-white/[0.03] transition-colors duration-700" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
                        {/* Avatar Section */}
                        <div className="relative group">
                          <div className="size-32 md:size-40 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl relative">
                            <img 
                              src={user.avatar?.startsWith('http') ? user.avatar : `${SERVER_URL}${user.avatar}`} 
                              alt={user.username}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {isUpdating && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <div className="size-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUpdating}
                            className="absolute -bottom-2 -right-2 size-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-[#0d0c22] group-hover:scale-110 transition-transform shadow-xl disabled:opacity-50"
                          >
                            <Camera size={18} />
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>

                        <div className="text-center md:text-left flex-grow">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h2 className="text-3xl md:text-4xl font-black text-white">{user.username}</h2>
                            <span className={`w-fit mx-auto md:mx-0 text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-wider ${
                              LEVEL_CONFIG[user.level as keyof typeof LEVEL_CONFIG]?.color || 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {LEVEL_CONFIG[user.level as keyof typeof LEVEL_CONFIG]?.name || 'Cliente'}
                            </span>
                          </div>
                          <p className="text-white/30 font-medium mb-4">{user.email}</p>

                          {/* Avatar Selector Gallery */}
                          <div className="space-y-2 mb-6">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">O elige un avatar predeterminado</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                              {[1, 2, 3, 4, 5, 6].map((num) => {
                                const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=pixel${num * 42}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                                return (
                                  <button
                                    key={num}
                                    onClick={() => handleUpdateProfile({ avatar: avatarUrl })}
                                    className={`size-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-90 ${
                                      user.avatar === avatarUrl ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-white/5 hover:border-white/20'
                                    }`}
                                  >
                                    <img src={avatarUrl} alt="Avatar option" className="size-full object-cover" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Progress Section */}
                          {progress.next && (
                            <div className="max-w-md">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="text-white/40">Progreso de Nivel</span>
                                <span className="text-blue-400">{progress.current} / {progress.next} Robux</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress.percent}%` }}
                                  className="h-full bg-blue-500 rounded-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Decorative Background Glow */}
                      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Personal Info */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">INFORMACIÓN PERSONAL</h3>
                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                          <div className="p-6 flex items-start gap-4">
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                              <User size={18} className="text-white/20" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Nombre de Usuario</p>
                              <p className="text-sm font-bold text-white">{user.username}</p>
                            </div>
                          </div>

                          <div className="p-6 flex items-start gap-4">
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                              <Mail size={18} className="text-white/20" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Correo Electrónico</p>
                              <p className="text-sm font-bold text-white">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Connected Accounts */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">CUENTAS CONECTADAS</h3>
                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2]">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white mb-0.5">DISCORD</p>
                              <p className={`text-[11px] font-medium ${user.discordId ? 'text-emerald-400' : 'text-white/20'}`}>
                                {user.discordId ? 'Vinculado correctamente' : 'No vinculado'}
                              </p>
                            </div>
                          </div>
                          {!user.discordId ? (
                            <button 
                              onClick={() => window.location.href = `${SERVER_URL}/api/auth/discord?token=${localStorage.getItem('pixel_token')}`}
                              className="px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-[#5865F2]/20"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                              </svg>
                              Vincular Discord
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                              </svg>
                              Sincronizado
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            {activeTab === 'privacidad' && (
              <div className="space-y-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                  <h3 className="text-2xl font-black text-white mb-6">Ajustes de Notificaciones</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <h4 className="text-sm font-bold text-white">Notificaciones Push</h4>
                        <p className="text-xs text-white/40">Recibe avisos sobre el estado de tus pedidos y mensajes de soporte.</p>
                      </div>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 size-4 bg-white rounded-full"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguridad' && (
              <div className="space-y-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                  <h3 className="text-2xl font-black text-white mb-6">Seguridad de la Cuenta</h3>
                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2">Contraseña Actual</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2">Nueva Contraseña</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <button className="mt-4 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 transition-all">Actualizar Seguridad</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div className="space-y-6">
                {isLoadingOrders ? (
                  <div className="grid grid-cols-1 gap-4">
                    <Skeleton className="h-28 w-full rounded-3xl" />
                    <Skeleton className="h-28 w-full rounded-3xl" />
                    <Skeleton className="h-28 w-full rounded-3xl" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-6">
                          <div className="size-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-black text-white">{order.id}</h4>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                  order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-white/5 text-white/40'
                                }`}>
                                {order.status === 'completed' ? 'Completado' : order.status === 'pending' ? 'Pendiente' : order.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                              {order.amount} Robux • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="text-right flex-grow md:flex-grow-0">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Pagado</p>
                            <p className="text-lg font-black text-white">${order.total} {order.currency}</p>
                          </div>
                          <button
                            onClick={() => navigate('/chat', { state: { orderId: order.id } })}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black transition-all"
                          >
                            Chat Soporte
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-12 text-center">
                    <div className="size-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-400">
                      <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">No tienes pedidos aún</h3>
                    <p className="text-sm text-white/30 max-w-xs mx-auto mb-8">Cuando realices tu primera compra, aparecerá aquí para que puedas seguir su estado.</p>
                    <button onClick={() => navigate('/catalog')} className="px-8 py-3 bg-white text-black rounded-xl font-black text-sm hover:scale-105 transition-all">Explorar Catálogo</button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'tiers' && (
              <div className="space-y-8">
                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white mb-2">Sistema de Tiers</h3>
                    <p className="text-white/30 text-sm max-w-2xl">
                      Sube de nivel realizando compras en nuestra tienda. Cada compra suma Robux a tu acumulado total, desbloqueando rangos exclusivos y beneficios en nuestro servidor de Discord.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(LEVEL_CONFIG).map(([key, config], idx) => {
                    const isCurrent = user.level === key;
                    const levels = Object.keys(LEVEL_CONFIG);
                    const userLevelIndex = levels.indexOf(user.level || 'BRONCE');
                    const tierIndex = levels.indexOf(key);
                    const isCompleted = userLevelIndex > tierIndex;
                    const isLocked = userLevelIndex < tierIndex;
                    
                    const prevThreshold = tierIndex > 0 ? (LEVEL_CONFIG[levels[tierIndex-1]].next || 0) : 0;

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative group p-6 rounded-[2rem] border transition-all duration-500 ${
                          isCurrent 
                            ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-[1.02]' 
                            : isCompleted
                              ? 'bg-emerald-500/[0.03] border-emerald-500/20'
                              : 'bg-white/[0.03] border-white/5 grayscale-[0.5] opacity-60'
                        }`}
                      >
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-6">
                          <div className={`size-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${
                            isCurrent ? 'bg-blue-500/20 border-blue-500/20' : 'bg-white/5 border-white/10'
                          }`}>
                            <config.icon size={24} className={isCurrent ? 'text-blue-400' : 'text-white/20'} />
                          </div>
                          
                          {isCompleted ? (
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400" />
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Completado</span>
                            </div>
                          ) : isCurrent ? (
                            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center gap-1.5 animate-pulse">
                              <div className="size-1.5 bg-blue-400 rounded-full"></div>
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nivel Actual</span>
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Bloqueado</span>
                            </div>
                          )}
                        </div>

                        <h4 className={`text-xl font-black mb-1 ${isCurrent ? 'text-white' : 'text-white/60'}`}>{config.name}</h4>
                        <p className="text-xs text-white/30 font-medium mb-6 leading-relaxed">
                          {config.desc}
                        </p>

                        <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/20">Requisito</span>
                            <span className={isCurrent ? 'text-blue-400' : 'text-white/40'}>
                              {prevThreshold}+ Robux
                            </span>
                          </div>
                          
                          {/* Mini Progress Bar for current tier */}
                          {isCurrent && config.next && (
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-blue-500 rounded-full" 
                                 style={{ width: `${progress.percent}%` }}
                               />
                             </div>
                          )}
                        </div>

                        {/* Background Decor */}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-blue-500/[0.02] rounded-[2rem] pointer-events-none"></div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer Info */}
                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-6 flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                    <MessageSquare size={18} />
                  </div>
                  <p className="text-xs text-white/30 font-medium">
                    Los roles se sincronizan automáticamente en nuestro servidor de Discord. Si tienes problemas, contacta con soporte.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-80" />
    </motion.div>
  );
}
