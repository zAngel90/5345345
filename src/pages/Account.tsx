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
  Star,
  ChevronRight,
  Leaf,
  DollarSign,
  Zap,
  TrendingUp,
  HelpCircle,
  ShoppingBag as ShoppingBagIcon,
  X
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RobloxAPI, StoreAPI, AuthAPI, SERVER_URL, OrdersAPI, CouponsAPI } from '../services/api';

const TIERS_CONFIG = [
  { id: 'NINGUNO', name: 'Sin Rango', rbx: 0, desc: 'Realiza tu primera compra para obtener rango', benefit: 'Sin beneficios especiales', icon: Leaf, color: 'text-white/20' },
  { id: 'BRONCE', name: 'Bronce', rbx: 1, desc: 'Rol personalizado en Discord', benefit: 'Acceso a canales exclusivos', logo: '/images/bronce.png', color: 'text-orange-400' },
  { id: 'SILVER', name: 'Plata', rbx: 3000, desc: 'Rol personalizado en Discord', benefit: 'Prioridad en soporte', logo: '/images/plata.png', color: 'text-slate-300' },
  { id: 'GOLD', name: 'Oro', rbx: 10000, desc: 'Rol personalizado en Discord', benefit: 'Descuentos exclusivos', logo: '/images/oro.png', color: 'text-yellow-400' },
  { id: 'DIAMOND', name: 'Diamante', rbx: 25000, desc: 'Rol personalizado en Discord', benefit: 'Sorteos VIP mensuales', logo: '/images/diamante.png', color: 'text-blue-300' },
  { id: 'ROYAL', name: 'Royal', rbx: 50000, desc: 'Rol personalizado en Discord', benefit: 'Invitación a eventos secretos', logo: '/images/Royal.png', color: 'text-purple-400' },
  { id: 'MYTHIC', name: 'Mythic', rbx: 80000, desc: 'Nivel legendario máximo', benefit: 'Beneficios supremos VIP', logo: '/images/mythic.png', color: 'text-red-500' },
];

const TiltButton = ({ label, icon: Icon, onClick, isSuccess }: { label: string, icon: any, onClick: (e: any) => void, isSuccess: boolean }) => {
  const [zone, setZone] = useState<'left' | 'middle' | 'right' | null>(null);
  const [isActive, setIsActive] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const getZone = (e: React.PointerEvent) => {
    if (!btnRef.current) return 'middle';
    const r = btnRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const w = r.width || 1;
    if (x < w * 0.33) return 'left';
    if (x > w * 0.66) return 'right';
    return 'middle';
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onPointerDown={(e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        setZone(getZone(e));
        setIsActive(true);
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        setZone(getZone(e));
      }}
      onPointerUp={() => {
        setIsActive(false);
        setZone(null);
      }}
      onPointerLeave={() => {
        setIsActive(false);
        setZone(null);
      }}
      className={`soft-btn w-full h-[54px] ${isActive ? 'soft-btn--active' : ''} ${zone ? `soft-btn--${zone}` : ''} ${isSuccess ? 'soft-btn--success' : ''}`}
    >
      <span className="soft-btn__wrapper">
        <span className="soft-btn__content">
          <span className="soft-btn__inner flex items-center justify-center gap-2">
            {Icon && <Icon size={14} />}
            {label}
          </span>
        </span>
      </span>
    </button>
  );
};

const LEVEL_CONFIG = TIERS_CONFIG.reduce((acc, tier, index) => {
  const nextTier = TIERS_CONFIG[index + 1];
  acc[tier.id] = { 
    name: tier.name, 
    color: tier.id === 'BRONCE' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
           tier.id === 'SILVER' ? 'bg-slate-400/10 text-slate-300 border-slate-400/20' :
           tier.id === 'GOLD' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
           tier.id === 'DIAMOND' ? 'bg-blue-400/10 text-blue-300 border-blue-400/20' :
           tier.id === 'ROYAL' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
           tier.id === 'MYTHIC' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
           'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: tier.icon,
    desc: tier.desc,
    rbx: tier.rbx,
    next: nextTier ? nextTier.rbx : null
  };
  return acc;
}, {} as any);

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'perfil';
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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

  useEffect(() => {
    if (activeTab === 'descuentos') {
      setIsLoadingCoupons(true);
      CouponsAPI.getPublicCoupons()
        .then(data => setCoupons(data || []))
        .catch(err => console.error('Error al cargar cupones:', err))
        .finally(() => setIsLoadingCoupons(false));
    }
  }, [activeTab]);

  const getProgress = () => {
    if (!user) return { percent: 0, next: 0, current: 0 };
    const levelKey = user.level || 'NINGUNO';
    const config = LEVEL_CONFIG[levelKey] || LEVEL_CONFIG.NINGUNO;
    
    const currentRbx = user.totalRobux || 0;
    
    if (config.next === null) {
      return { 
        percent: 100, 
        next: null, 
        current: currentRbx,
        needed: 0
      };
    }

    const prevThreshold = config.rbx || 0;
    const nextThreshold = config.next;
    
    const range = nextThreshold - prevThreshold;
    const progressInLevel = currentRbx - prevThreshold;
    const percent = Math.min(Math.max((progressInLevel / range) * 100, 0), 100);

    return {
      percent,
      next: nextThreshold,
      current: currentRbx,
      needed: nextThreshold - currentRbx
    };
  };

  const fetchOrders = async (userId: string, username: string) => {
    setIsLoadingOrders(true);
    try {
      const [resById, resByUsername] = await Promise.all([
        OrdersAPI.getUserOrders(userId),
        OrdersAPI.getUserOrders(username)
      ]);

      let allOrders: any[] = [];
      if (resById.success) allOrders = [...resById.data];
      if (resByUsername.success) {
        const existingIds = new Set(allOrders.map(o => o.id));
        const extraOrders = resByUsername.data.filter((o: any) => !existingIds.has(o.id));
        allOrders = [...allOrders, ...extraOrders];
      }

      // Ordenar por fecha más reciente primero
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const SpotlightCard = ({ children, className, isCurrent }: { children: React.ReactNode, className: string, isCurrent: boolean }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.98, y: 1, x: 1 }}
        className={`relative overflow-hidden ${className}`}
      >
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, ${isCurrent ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)'}, transparent 80%)`,
            opacity: isHovered ? 1 : 0
          }}
        />
        {children}
      </motion.div>
    );
  };

  if (!user) return null;

  const progress = getProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen pt-20 pb-20 px-4 md:px-8 lg:px-12 relative"
    >
      {/* Corner Overlays */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-br from-[#090971]/50 via-[#000041]/35 via-30% to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-bl from-[#090971]/55 via-[#000041]/40 via-30% to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/45 via-[#000041]/30 via-30% to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-tl from-[#090971]/50 via-[#000041]/35 via-30% to-transparent" />
      </div>
      
      <div className="max-w-[1400px] mx-auto relative z-10">
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
                        onClick={() => setSearchParams({ tab: item.id })}
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
                            onClick={() => setIsAvatarModalOpen(true)}
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

                          
                          {/* Progress Section */}
                          {typeof progress.next === 'number' && progress.next > 0 ? (
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
                          ) : null}
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
                      <div 
                        key={order.id} 
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-6">
                          <div className="size-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-black text-white">#{order.id}</h4>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                  order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-white/5 text-white/40'
                                }`}>
                                {order.status === 'completed' ? 'Completado' : order.status === 'pending' ? 'Pendiente' : order.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                              {order.type === 'fortnite' 
                                ? `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Skin' : 'Skins'} Fortnite`
                                : order.type === 'mm2'
                                  ? `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Item' : 'Ítems'} MM2`
                                  : order.type === 'trade_limited'
                                    ? `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Item' : 'Ítems'} Limited`
                                    : `${order.amount} Robux`
                              } • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="text-right flex-grow md:flex-grow-0">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Pagado</p>
                            <p className="text-lg font-black text-white">${order.total} {order.currency}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/chat', { state: { orderId: order.id } });
                              }}
                              className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                              title="Chat Soporte"
                            >
                              <MessageSquare size={18} />
                            </button>
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                               <ChevronRight size={18} />
                            </div>
                          </div>
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
            {activeTab === 'descuentos' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Tag className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white tracking-wide uppercase">Mis Cupones</h1>
                    <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Códigos de descuento activos</p>
                  </div>
                </div>

                {isLoadingCoupons ? (
                  <div className="py-24 text-center bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-4"
                    >
                      <Tag className="text-blue-500/40" size={32} />
                    </motion.div>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-wider">Buscando promociones...</p>
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="bg-white/[0.02] border border-dashed border-white/5 rounded-[2.5rem] py-24 text-center px-6">
                    <div className="size-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-6 text-white/20 border border-white/5 shadow-inner">
                      <Tag size={36} />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Sin Cupones Activos</h3>
                    <p className="text-xs text-white/30 max-w-xs mx-auto font-medium leading-relaxed mb-8">En este momento no hay cupones de descuento públicos disponibles. ¡Vuelve pronto!</p>
                    <button onClick={() => navigate('/catalog')} className="px-8 py-3 bg-white text-black rounded-xl font-black text-sm hover:scale-105 transition-all">Ir a la Tienda</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5">
                    {coupons.map((c) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.88, x: 8, y: 8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          setCopiedId(c.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="relative flex flex-col md:flex-row items-stretch gap-6 p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-[6px_6px_0px_0px_rgba(12,10,28,1)] hover:shadow-[3px_3px_0px_0px_rgba(12,10,28,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:border-white/10 transition-all group duration-300 overflow-hidden cursor-pointer select-none"
                      >
                        {/* Background premium blur wash (matches standard glass panels) */}
                        <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-blue-500/5 rounded-full blur-[60px] pointer-events-none transition-colors duration-500 group-hover:bg-white/[0.03]"></div>
                        <div className="absolute bottom-0 left-0 w-[120px] h-[120px] bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none transition-colors duration-500 group-hover:bg-white/[0.02]"></div>

                        {/* Premium Signature Oval Pattern */}
                        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[50%] bg-white/[0.02] rounded-[100%] rotate-[-25deg] pointer-events-none transition-colors duration-700 group-hover:bg-white/[0.04] z-0" />
                        <div className="absolute bottom-[-20%] left-[-5%] w-[50%] h-[45%] bg-white/[0.015] rounded-[100%] rotate-[15deg] pointer-events-none transition-colors duration-700 group-hover:bg-white/[0.03] z-0" />

                        {/* Left Side: The core offer / badge */}
                        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0 z-10">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                              <Tag size={14} className="drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">Cupón Disponible</span>
                            </div>
                          </div>
                          
                          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase transition-colors">
                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `-$${c.discountValue}`}
                          </h3>
                          <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-wider mt-2">
                            Válido para toda la tienda
                          </p>
                          
                          <div className="flex items-center gap-2 text-white/25 text-[10px] font-black uppercase tracking-widest mt-5 pt-4 border-t border-white/5 w-fit">
                            <span>EXPIRA:</span>
                            <span className="text-white/40">
                              {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'NUNCA'}
                            </span>
                          </div>
                        </div>



                        {/* Divider (responsive: border-t on mobile, border-l on desktop) */}
                        <div className="hidden md:block w-px border-l border-dashed border-white/15 self-stretch z-10 my-2" />
                        <div className="block md:hidden w-full h-px border-t border-dashed border-white/15 my-2 z-10" />

                        {/* Right Side: The Code and Action */}
                        <div className="w-full md:w-[200px] flex flex-col items-center md:items-end justify-center gap-4 z-10 shrink-0">
                          <div className="text-center md:text-right w-full">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">CÓDIGO DE CANJE</span>
                            <div className="inline-block font-mono text-base font-black text-white bg-black/40 border border-white/10 rounded-2xl px-5 py-3 shadow-inner uppercase tracking-widest font-bold drop-shadow-xl select-all text-center w-full select-all">
                              {c.code}
                            </div>
                          </div>

                          <TiltButton 
                            label={copiedId === c.id ? '¡Copiado!' : 'Copiar Código'}
                            icon={copiedId === c.id ? CheckCircle2 : undefined}
                            isSuccess={copiedId === c.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(c.code);
                              setCopiedId(c.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'tiers' && (
              <div className="space-y-12">
                {/* Header - Exactly as image */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                      <Crown className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white tracking-wide">Pixel Tiers</h1>
                      <p className="text-[11px] text-white/40">Tu progreso y recompensas</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/catalog/robux')}
                    className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white text-[11px] font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                     <ShoppingBagIcon size={14} /> Subir de tier <ChevronRight size={14} />
                  </button>
                </div>

                {/* Main Banner Card */}
                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group/banner shadow-xl">
                  {/* Premium Oval Pattern (Matching Profile/Checkout) */}
                  <div className="absolute top-[-10%] right-[-15%] w-[70%] h-[60%] bg-white/[0.03] rounded-[100%] rotate-[-25deg] pointer-events-none group-hover/banner:bg-white/[0.05] transition-colors duration-700" />
                  <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[50%] bg-white/[0.02] rounded-[100%] rotate-[15deg] pointer-events-none group-hover/banner:bg-white/[0.04] transition-colors duration-700" />
                  <div className="absolute top-[20%] left-[-20%] w-[50%] h-[40%] bg-white/[0.015] rounded-[100%] rotate-[-10deg] pointer-events-none group-hover/banner:bg-white/[0.03] transition-colors duration-700" />

                  {/* Circular $ Icon */}
                  <div className="relative z-10 size-24 rounded-full border-2 border-white/[0.03] bg-white/[0.01] flex items-center justify-center relative shrink-0">
                     <div className="absolute inset-0 rounded-full border border-white/5"></div>
                     <div className="size-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                        <DollarSign size={32} className="text-emerald-500" strokeWidth={2.5} />
                     </div>
                  </div>

                  <div className="relative z-10 flex-1 space-y-4 w-full">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <h2 className="text-xl font-bold text-white">{user.username}</h2>
                      <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold text-white/50 flex items-center gap-1">
                        <Zap size={10} /> {TIERS_CONFIG.find(t => t.id === user.level)?.name || 'Cliente'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-white/40 text-[10px] font-medium uppercase tracking-wider">
                        <TrendingUp size={12} />
                        <span><span className="text-white/80 font-bold">{user.totalRobux || 0}</span> Robux gastados en total</span>
                        <HelpCircle size={10} className="opacity-50" />
                      </div>

                      {/* Matching Progress Bar Logic */}
                      {(() => {
                        const totalRobux = user.totalRobux || 0;
                        const currentTierIndex = [...TIERS_CONFIG].reverse().findIndex(t => totalRobux >= t.rbx);
                        const cTier = TIERS_CONFIG[TIERS_CONFIG.length - 1 - currentTierIndex] || TIERS_CONFIG[0];
                        const nTier = TIERS_CONFIG.find(t => t.rbx > totalRobux);
                        const pPercent = nTier 
                          ? Math.min(((totalRobux - cTier.rbx) / (nTier.rbx - cTier.rbx)) * 100, 100)
                          : 100;

                        return (
                          <div className="space-y-2.5">
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-white/40">Siguiente: <span className="text-orange-400">{nTier?.name || 'MÁX'}</span></span>
                              <span className="text-white/30">{pPercent.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.03] rounded-full relative overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${pPercent}%` }}
                                 className="h-full bg-orange-500/80 rounded-full relative"
                               >
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                               </motion.div>
                            </div>
                            {nTier && (
                              <p className="text-[10px] text-white/20 text-center md:text-left">Te faltan {nTier.rbx - totalRobux} Robux para {nTier.name}</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Beneficios Actuales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <CheckCircle2 size={14} /> Beneficios Actuales
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-xs font-bold text-white/80">Rol personalizado en Discord</p>
                    </div>
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-xs font-bold text-white/80">1.5% cashback a saldo</p>
                    </div>
                    <div className="p-4 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl flex items-center gap-3 opacity-40">
                      <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 shrink-0">
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white/40">Rol Discord Premium</p>
                        <p className="text-[9px] text-orange-400 font-bold mt-0.5">Nivel Bronce</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Todos los Tiers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Zap size={14} fill="currentColor" /> Todos los Tiers
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {TIERS_CONFIG.map((tier) => {
                      const isCurrent = user.level === tier.id;
                      const isUnlocked = (user.totalRobux || 0) >= tier.rbx;
                      const neonColor = tier.color?.includes('orange') ? '#f97316' :
                                       tier.color?.includes('slate') ? '#94a3b8' :
                                       tier.color?.includes('yellow') ? '#eab308' :
                                       tier.color?.includes('blue') ? '#3b82f6' :
                                       tier.color?.includes('purple') ? '#a855f7' :
                                       tier.color?.includes('red') ? '#ef4444' : '#3b82f6';
                      
                      return (
                        <SpotlightCard 
                          key={tier.id}
                          isCurrent={isCurrent}
                          className={`p-4 rounded-2xl border transition-all duration-300 group cursor-pointer flex items-center gap-4 ${
                            isCurrent 
                              ? 'bg-blue-500/10 border-blue-500/30 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.2)]' 
                              : `bg-white/[0.03] border-white/5 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] ${
                                  tier.color?.includes('orange') ? 'hover:bg-orange-500/10 hover:border-orange-500/30' :
                                  tier.color?.includes('slate') || tier.color?.includes('gray') ? 'hover:bg-slate-400/10 hover:border-slate-400/30' :
                                  tier.color?.includes('yellow') ? 'hover:bg-yellow-500/10 hover:border-yellow-500/30' :
                                  tier.color?.includes('blue') ? 'hover:bg-blue-400/10 hover:border-blue-400/30' :
                                  tier.color?.includes('purple') ? 'hover:bg-purple-500/10 hover:border-purple-500/30' :
                                  tier.color?.includes('red') ? 'hover:bg-red-500/10 hover:border-red-500/30' : 'hover:bg-white/[0.06] hover:border-white/10'
                                }`
                          }`}
                        >
                          {/* Logo with Neon Worm - Contours approach */}
                          <div className="relative size-12 shrink-0 flex items-center justify-center group/logo">
                             {(tier as any).logo ? (
                               <>
                                 {/* The "Worm" light following the logo's transparency */}
                                 <div 
                                   className={`absolute inset-0 transition-opacity duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                   style={{
                                     WebkitMaskImage: `url("${(tier as any).logo}")`,
                                     WebkitMaskSize: 'contain',
                                     WebkitMaskRepeat: 'no-repeat',
                                     WebkitMaskPosition: 'center',
                                     maskImage: `url("${(tier as any).logo}")`,
                                     maskSize: 'contain',
                                     maskRepeat: 'no-repeat',
                                     maskPosition: 'center',
                                     filter: `drop-shadow(0 0 10px ${neonColor}) brightness(1.5)`
                                   }}
                                 >
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                      className="absolute -inset-[100%] z-0"
                                      style={{
                                        background: `conic-gradient(from 0deg, transparent 0 40deg, ${neonColor} 50deg, #fff 60deg, ${neonColor} 70deg, transparent 80deg)`,
                                        filter: 'blur(2px)'
                                      }}
                                    />
                                 </div>
                                 <img 
                                   src={(tier as any).logo} 
                                   alt={tier.name} 
                                   className="relative z-10 size-10 object-contain transition-transform duration-300 group-hover:scale-110" 
                                 />
                               </>
                             ) : (
                               <div className={`size-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/10 ${isCurrent ? 'text-emerald-500' : 'text-white/20'}`}>
                                 <tier.icon size={20} />
                               </div>
                             )}
                          </div>
                          
                          <div className="relative z-10 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h4 className="text-[13px] font-bold text-white truncate">{tier.name}</h4>
                              {isCurrent ? (
                                <span className="px-1.5 py-0.5 bg-blue-600 rounded text-[7px] font-bold text-white uppercase tracking-wider">
                                  ACTUAL
                                </span>
                              ) : isUnlocked ? (
                                <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                              ) : (
                                <ChevronRight size={10} className="text-white/10 group-hover:text-white/30" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                               <p className="text-[10px] font-bold text-white/30 tracking-tight">
                                 {(() => {
                                   const currentIndex = TIERS_CONFIG.findIndex(t => t.id === tier.id);
                                   const nextTier = TIERS_CONFIG[currentIndex + 1];
                                   if (tier.rbx === 0) return 'Sin compras';
                                   if (!nextTier) return `${tier.rbx.toLocaleString()}+ R$`;
                                   return `${tier.rbx.toLocaleString()} - ${(nextTier.rbx - 1).toLocaleString()} R$`;
                                 })()}
                               </p>
                            </div>
                            <p className="text-[9px] font-medium text-white/15 group-hover:text-white/30 transition-colors truncate mt-1">{tier.desc}</p>
                          </div>
                        </SpotlightCard>
                      );
                    })}
                  </div>
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

      {/* Modal de Selección de Avatar */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAvatarModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#0d0c22] to-[#0a0919] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white">Seleccionar Avatar</h3>
                <button
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="size-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Opción de subir foto */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsAvatarModalOpen(false);
                  }}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 bg-white/[0.02] hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                      <Camera size={20} className="text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Subir foto personalizada</p>
                      <p className="text-xs text-white/40">JPG, PNG o GIF</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Avatares predeterminados */}
              <div className="space-y-3">
                <p className="text-xs font-black text-white/40 uppercase tracking-widest">O elige un avatar predeterminado</p>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=pixel${num * 42}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                    return (
                      <button
                        key={num}
                        onClick={() => {
                          handleUpdateProfile({ avatar: avatarUrl });
                          setIsAvatarModalOpen(false);
                        }}
                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                          user.avatar === avatarUrl ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={avatarUrl} alt="Avatar option" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
