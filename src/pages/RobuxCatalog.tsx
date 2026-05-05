import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RobloxAPI, StoreAPI, BASE_URL, OrdersAPI, SERVER_URL } from '../services/api';
import {
  Zap,
  Shield,
  ArrowRight,
  ChevronDown,
  Info,
  CheckCircle2,
  ArrowLeft,
  Users,
  Crown,
  Star,
  ShoppingCart,
  HelpCircle,
  Tag as LucideTag,
  X,
  Search,
  ExternalLink
} from 'lucide-react';

// Mock Data


const LoadingSpinner = () => (
  <div className="animate-spin-custom flex items-center justify-center mr-2">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="3" r="2" fill="#ffffff" />
      <circle cx="18.36" cy="5.64" r="2" fill="#ffffff" fillOpacity="0.8" />
      <circle cx="21" cy="12" r="2" fill="#ffffff" fillOpacity="0.6" />
      <circle cx="18.36" cy="18.36" r="2" fill="#ffffff" fillOpacity="0.4" />
      <circle cx="12" cy="21" r="2" fill="#ffffff" fillOpacity="0.2" />
      <circle cx="5.64" cy="18.36" r="2" fill="#ffffff" fillOpacity="0.1" />
      <circle cx="3" cy="12" r="2" fill="#ffffff" fillOpacity="0.05" />
      <circle cx="5.64" cy="5.64" r="2" fill="#ffffff" fillOpacity="0.02" />
    </svg>
  </div>
);

const currencies = [
  { code: 'USD', name: 'USD', flag: 'us' },
  { code: 'COP', name: 'COP', flag: 'co' },
  { code: 'ARS', name: 'ARS', flag: 'ar' },
  { code: 'MXN', name: 'MXN', flag: 'mx' },
  { code: 'PEN', name: 'PEN', flag: 'pe' },
  { code: 'EUR', name: 'EUR', flag: 'eu' },
];

const faqs = [
  {
    q: '¿Cómo comprar Robux?',
    a: 'Elige tu cantidad de Robux, selecciona tu método de entrega (Gamepass o Grupo), tu moneda y haz clic en Comprar. Sigue los pasos y recibirás tus Robux automáticamente.'
  },
  {
    q: '¿Cuánto tarda la entrega?',
    a: 'Vía Gamepass, la entrega es automática en pocos minutos. Vía Grupo, debes unirte al grupo y esperar 14 días la primera vez, luego es instantáneo.'
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos Tarjetas, PayPal, Binance y más. Todos los pagos se procesan de forma segura y encriptada.'
  },
  {
    q: '¿Es seguro comprar aquí?',
    a: 'Sí, 100% seguro. Tenemos más de 50,000 pedidos completados con una calificación de 5 estrellas. Tu compra está protegida.'
  },
  {
    q: '¿Qué pasa si no recibo mis Robux?',
    a: 'Nuestro soporte está disponible 24/7. Si hay algún problema con tu entrega, te ayudaremos de inmediato vía chat o emitiremos un reembolso total.'
  }
];

const RobuxSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-[84px] rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse">
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-white/5"></div>
            <div className="w-12 h-4 bg-white/5 rounded-md"></div>
          </div>
          <div className="w-10 h-3 bg-white/5 rounded-md"></div>
        </div>
      </div>
    ))}
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

export default function RobuxCatalog() {
  const navigate = useNavigate();
  const [robuxPackages, setRobuxPackages] = useState<any[]>([]);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [method, setMethod] = useState<'gamepass' | 'group'>('gamepass');
  const [currency, setCurrency] = useState('USD');
  const [customAmount, setCustomAmount] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [dynamicCurrencies, setDynamicCurrencies] = useState<any[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [dynamicPricePer1000, setDynamicPricePer1000] = useState(8.00);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % 4);
    }, 4000); // 4 seconds total cycle per card
    return () => clearInterval(interval);
  }, []);

  // Group Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupStep, setGroupStep] = useState(1);
  
  // Gamepass Modal States
  const [isGamepassModalOpen, setIsGamepassModalOpen] = useState(false);
  const [gamepassStep, setGamepassStep] = useState(1);
  const [ordersCount24h, setOrdersCount24h] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [existingGamepasses, setExistingGamepasses] = useState<any[]>([]);
  const [selectedGamepass, setSelectedGamepass] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const fetchRobuxPacks = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/admin/robux-config`);
        const data = await res.json();
        console.log('💎 Catalog Robux Data:', data);
        if (data.success) {
          if (Array.isArray(data.data)) {
            setRobuxPackages(data.data);
            if (data.data.length > 0) {
              const defaultPack = data.data.find((p: any) => p.amount === 1700) || data.data[0];
              setSelectedAmount(defaultPack.amount);
            }
          } else {
            setRobuxPackages(data.data.packages || []);
            setDynamicPricePer1000(data.data.pricePer1000 || 8.00);
            if (data.data.packages && data.data.packages.length > 0) {
              const defaultPack = data.data.packages.find((p: any) => p.amount === 1700) || data.data.packages[0];
              setSelectedAmount(defaultPack.amount);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching robux packs:', err);
      } finally {
        setIsLoadingPacks(false);
      }
    };
    fetchRobuxPacks();
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [requiredGroups, setRequiredGroups] = useState<any[]>([]);
  const [groupVerificationResults, setGroupVerificationResults] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('roblox_recent_users') || '[]');
    } catch { return []; }
  });

  const saveRecentUser = (user: any) => {
    const updated = [user, ...recentUsers.filter(u => u.id !== user.id)].slice(0, 5);
    setRecentUsers(updated);
    localStorage.setItem('roblox_recent_users', JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchGroupsConfig = async () => {
      try {
        const res = await RobloxAPI.getGroupsConfig();
        if (res.success) {
          setRequiredGroups(res.data);
        }
      } catch (error) {
        console.error('Error fetching groups config:', error);
      }
    };
    fetchGroupsConfig();

    const fetchCurrencies = async () => {
      try {
        const res = await StoreAPI.getCurrenciesConfig();
        if (res.success) {
          const activeOnes = res.data.filter((c: any) => c.active);
          setDynamicCurrencies(activeOnes);
          if (activeOnes.length > 0 && !activeOnes.find((c: any) => c.code === currency)) {
            setCurrency(activeOnes[0].code);
          }
        }
      } catch (err) {
        console.error('Error fetching currencies:', err);
      }
    };
    fetchCurrencies();

    const fetchRecentOrders = async () => {
      try {
        const res = await OrdersAPI.getRecentOrders();
        if (res.success) {
          setRecentPurchases(res.data);
        }
      } catch (err) {
        console.error('Error fetching recent orders:', err);
      }
    };
    fetchRecentOrders();

    const fetchOrderStats = async () => {
      try {
        const res = await OrdersAPI.getOrderStats();
        if (res.success) {
          setOrdersCount24h(res.count);
        }
      } catch (err) {
        console.error('Error fetching order stats:', err);
      }
    };
    fetchOrderStats();

    const interval = setInterval(() => {
      fetchRecentOrders();
      fetchOrderStats();
    }, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleVerifyGroups = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const res = await RobloxAPI.checkUserGroups(selectedUser.id);
      if (res.success) {
        setGroupVerificationResults(res.data);
        // Siempre ir al paso 3 para que el usuario vea el estado de sus grupos
        setGroupStep(3);
      }
    } catch (error) {
      console.error('Error verifying groups:', error);
      alert('Error al verificar los grupos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll Lock
  React.useEffect(() => {
    if (isGroupModalOpen || isGamepassModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isGroupModalOpen, isGamepassModalOpen]);

  const displayAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
  
  const selectedCurrencyData = dynamicCurrencies.find(c => c.code === currency) || { rate: 1, symbol: '$' };
  const currentPrice = (displayAmount * (dynamicPricePer1000 / 1000) * selectedCurrencyData.rate).toFixed(2);
  const gamepassRequiredPrice = Math.ceil(displayAmount / 0.7);

  const handlePurchase = () => {
    console.log('🚀 Purchase Initiated:', { method, displayAmount });
    if (method === 'group') {
      setGroupStep(1);
      setIsGroupModalOpen(true);
    } else {
      setGamepassStep(1);
      setIsGamepassModalOpen(true);
    }
  };

  useEffect(() => {
    if (gamepassStep === 2 && selectedUser) {
      const fetchGamepasses = async () => {
        try {
          const placesRes = await RobloxAPI.getUserPlaces(selectedUser.id);
          if (placesRes.data) {
            let allGp: any[] = [];
            for (const place of placesRes.data) {
              const gpRes = await RobloxAPI.getPlaceGamepasses(place.id, selectedUser.id);
              if (gpRes.data) {
                const passesWithUniverse = gpRes.data.map((gp: any) => ({
                  ...gp, 
                  universeId: place.universeId 
                }));
                allGp = [...allGp, ...passesWithUniverse];
              }
            }
            setExistingGamepasses(allGp);
          }
        } catch (e) {
          console.error('Error fetching gamepasses in background:', e);
        }
      };
      fetchGamepasses();
    }
  }, [gamepassStep, selectedUser, gamepassRequiredPrice]);

  return (
    <>
      <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-[#0d0c22] relative selection:bg-blue-500/30 selection:text-blue-200 font-sans text-white"
    >
      {/* Background Gradients - Simplified to avoid scroll bugs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true" style={{
        background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59, 130, 246, 0.05), transparent 50%),
                     radial-gradient(ellipse 50% 40% at 80% 100%, rgba(99, 102, 241, 0.03), transparent 50%)`
      }}></div>

      {/* Floating Robux Icons with exact positions/animations */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block overflow-hidden z-0 opacity-35">
        {[
          { top: '22%', left: '6%', size: 'w-7 h-7', delay: '0s', slow: false },
          { top: '58%', left: '5%', size: 'w-5 h-5', delay: '-1.5s', slow: true },
          { bottom: '18%', left: '12%', size: 'w-4 h-4', delay: '-3s', slow: false },
          { top: '28%', right: '8%', size: 'w-6 h-6', delay: '-0.8s', slow: true },
          { top: '55%', right: '6%', size: 'w-7 h-7', delay: '-2.2s', slow: false },
          { bottom: '25%', right: '10%', size: 'w-5 h-5', delay: '-4s', slow: true },
          { top: '42%', left: '8%', size: 'w-4 h-4', delay: '-2.5s', slow: false },
          { top: '72%', right: '14%', size: 'w-5 h-5', delay: '-1s', slow: true },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`absolute opacity-[0.3] ${item.slow ? 'animate-float-slow' : 'animate-float'}`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
              animationDelay: item.delay
            }}
          >
            <div className={`relative ${item.size}`}>
              <img src="/images/robux-logo.svg" className="w-full h-full object-contain filter brightness-0 invert" alt="Robux" />
            </div>
          </div>
        ))}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-4 lg:py-8 pb-32 max-w-[1000px] relative z-10"
      >
        {/* Breadcrumb */}
        <motion.div variants={itemVariants} className="mb-5 lg:mb-8 mt-24">
          <div className="flex flex-col gap-3">
            <a className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-all duration-200 group w-fit" href="/catalog">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">Catálogo</span>
            </a>
            
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 w-fit">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-emerald-400">{ordersCount24h.toLocaleString()}</span>
                <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-tight">Órdenes completadas últimas 24h</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          {/* Main Column */}
          <div className="flex-1 w-full space-y-10">
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-row items-center gap-3.5 md:gap-6">
              <div className="relative shrink-0">
                <div className="absolute inset-0 scale-[2] opacity-20 blur-2xl" style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)' }}></div>
                <div className="relative w-11 h-11 md:w-[72px] md:h-[72px] rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="relative w-6 h-6 md:w-10 md:h-10 drop-shadow-2xl">
                    <img src="/images/robux-logo.svg" className="w-full h-full object-contain filter brightness-0 invert" alt="Robux" />
                  </div>
                </div>
              </div>
              <div className="text-left flex-1 min-w-0">
                <h1 className="text-xl md:text-4xl font-black tracking-tight mb-0.5 md:mb-1.5 text-white uppercase">COMPRA TUS ROBUX</h1>
                <p className="text-white/35 text-xs md:text-sm mb-2 md:mb-3">Elige tu cantidad. método de entrega y recibe tus robux.</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                    <Shield size={12} />
                    Mejor precio
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 border border-amber-500/40 bg-amber-500/5 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                    <Zap size={12} />
                    Entrega rápida
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 border border-blue-500/40 bg-blue-500/5 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                    <CheckCircle2 size={12} />
                    +50 000 ventas
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Packages Grid */}
            <motion.div variants={itemVariants}>
              <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">Cantidad de Robux</h3>
              {isLoadingPacks ? (
                <RobuxSkeleton />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {Array.isArray(robuxPackages) && robuxPackages.map((pkg) => (
                    <div key={pkg.id} className="relative">
                      {pkg.popular && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="text-[10px] px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold tracking-wide shadow-lg shadow-orange-500/30 whitespace-nowrap flex items-center gap-1">
                            <Crown size={10} /> Popular
                          </span>
                        </div>
                      )}
                      {pkg.bestValue && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="text-[10px] px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold tracking-wide shadow-lg shadow-emerald-500/30 whitespace-nowrap flex items-center gap-1">
                            <Star size={10} /> Mejor valor
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => { setSelectedAmount(pkg.amount); setCustomAmount(''); }}
                        className={`relative w-full rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 group cursor-pointer overflow-hidden ${selectedAmount === pkg.amount && !customAmount
                          ? 'pt-4 pb-3 px-3 bg-blue-500/[0.08] border-blue-500/50'
                          : 'py-3.5 px-3 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                          }`}
                        style={selectedAmount === pkg.amount && !customAmount ? { boxShadow: '0 0 0 1px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.08)' } : {}}
                      >
                        {selectedAmount === pkg.amount && !customAmount && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-4 h-4">
                            <img
                              src="/images/robux-logo.svg"
                              style={selectedAmount === pkg.amount && !customAmount
                                ? { filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(199deg) brightness(109%) contrast(95%)' }
                                : { filter: 'brightness(0) invert(1)' }
                              }
                              className="w-full h-full object-contain"
                              alt="Robux"
                            />
                          </div>
                          <span className={`text-lg font-bold tracking-tight ${selectedAmount === pkg.amount && !customAmount ? 'text-blue-400' : 'text-white'}`}>
                            {pkg.amount.toLocaleString()}
                          </span>
                        </div>
                        <span className={`text-[11px] font-medium ${selectedAmount === pkg.amount && !customAmount ? 'text-blue-400/60' : 'text-white/30'}`}>
                          {pkg.price.toFixed(2)}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </motion.div>
              {/* Custom Input */}
              <motion.div 
                variants={itemVariants} 
                className={`relative rounded-xl border transition-all duration-300 flex items-center gap-3 overflow-hidden p-3 sm:p-4 ${
                  customAmount 
                    ? 'bg-blue-500/[0.05] border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  customAmount ? 'bg-blue-500/20' : 'bg-white/[0.04]'
                }`}>
                  <div className="relative w-4.5 h-4.5 sm:w-5 sm:h-5">
                    <img 
                      src="/images/robux-logo.svg" 
                      className={`w-full h-full object-contain transition-all duration-300 ${
                        customAmount ? 'brightness-110' : 'filter brightness-0 invert opacity-40'
                      }`} 
                      style={customAmount ? { filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(199deg) brightness(109%) contrast(95%)' } : {}}
                      alt="Robux" 
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 block transition-colors duration-300 ${
                    customAmount ? 'text-blue-400/60' : 'text-white/30'
                  }`}>
                    Cantidad personalizada
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 3500"
                    value={customAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCustomAmount(val);
                      if (val) setSelectedAmount(0); // Deselect packages if custom is used
                    }}
                    className="w-full bg-transparent text-lg font-bold placeholder:text-white/15 focus:outline-none text-white"
                  />
                </div>
                {customAmount && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  </motion.div>
                )}
              </motion.div>

            {/* Method & Currency */}
            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Tab Selector Method */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Método</h3>
                  <Info size={14} className="text-white/20" />
                </div>
                <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <button
                    onClick={() => setMethod('gamepass')}
                    className={`flex-1 py-3 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${method === 'gamepass' ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]' : 'text-white/35 hover:text-white/50'
                      }`}
                  >
                    <img src="/images/gamepass2.svg" className="w-4 h-4 shrink-0" alt="Gamepass" />
                    Gamepass
                  </button>
                  <button
                    onClick={() => setMethod('group')}
                    className={`flex-1 py-3 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${method === 'group' ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]' : 'text-white/35 hover:text-white/50'
                      }`}
                  >
                    <Users size={16} />
                    Group
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">-15%</span>
                  </button>
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">Moneda</h3>
                <div className="flex flex-wrap gap-2">
                  {dynamicCurrencies.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={`relative px-3 py-2 rounded-lg border text-[10px] font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${currency === curr.code
                        ? 'bg-white/[0.08] border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.04)]'
                        : 'bg-white/[0.02] border-white/[0.05] text-white/40 hover:text-white/60'
                        }`}
                    >
                      <img src={`https://flagcdn.com/w80/${curr.flag}.png`} className="w-5 h-3.5 object-cover rounded-[3px] shadow-[0_0_0_0.5px_rgba(255,255,255,0.1)]" alt={curr.code} />
                      {curr.code}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* FAQ Box inside Main Column */}
            <motion.div variants={itemVariants} className="hidden lg:block border-t border-white/[0.04] pt-8">
              <div className="relative rounded-2xl overflow-hidden bg-[#0d0c22]">
                <div className="absolute inset-0 z-0">
                  <img src="/images/epic1.jpg" className="w-full h-full object-cover opacity-20" alt="FAQ Background" />
                  <div className="absolute inset-0 bg-[#0d0c22]/60"></div>
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent, #0d0c22 95%)' }}></div>
                </div>
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/15">
                      <HelpCircle size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Preguntas frecuentes</h3>
                      <p className="text-white/30 text-[11px]">Todo lo que necesitas saber</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {faqs.map((faq, i) => (
                      <div key={i} className="group">
                        <button
                          onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                          className="w-full text-left rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.08]"
                        >
                          <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-sm font-semibold text-white/90">{faq.q}</span>
                            <ChevronDown size={16} className={`text-white/30 transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
                          </div>
                          <AnimatePresence>
                            {activeFaq === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-3">
                                  <p className="text-xs text-white/45 leading-relaxed">{faq.a}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24 space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <div className="p-6 bg-white/[0.02] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-white/40">
                    <ShoppingCart size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Resumen</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <div className="relative w-4 h-4">
                      <img
                        src="/images/robux-logo.svg"
                        style={{ filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(199deg) brightness(109%) contrast(95%)' }}
                        className="w-full h-full object-contain"
                        alt="Robux"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white tracking-tight">{displayAmount.toLocaleString()}</span>
                      <span className="text-sm font-medium text-white/30">Robux</span>
                    </div>
                    <div className="relative w-6 h-6 opacity-30">
                      <img src="/images/robux-logo.svg" className="w-full h-full object-contain filter brightness-0 invert" alt="Robux" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 py-4 border-y border-white/[0.04]">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30">Precio por cada 1,000</span>
                    <span className="text-white/60 font-medium">{(dynamicPricePer1000 * selectedCurrencyData.rate).toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30">Método</span>
                    <span className="text-white/60 font-medium capitalize flex items-center gap-1.5">
                      <img src="/images/gamepass2.svg" className="w-3 h-3 opacity-50" alt="" />
                      {method}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs items-center gap-1.5">
                    <span className="text-white/30">Moneda</span>
                    <span className="text-white/60 font-medium flex items-center gap-1.5 uppercase">
                      <img src={`https://flagcdn.com/w80/${dynamicCurrencies.find(c => c.code === currency)?.flag}.png`} className="w-5 h-3.5 object-cover rounded-[3px]" alt="" />
                      {currency}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/40 text-xs font-medium">Total</span>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold tracking-tight text-white">{currentPrice}</span>
                      <span className="text-[9px] text-white/40 uppercase font-bold tracking-wide">{currency}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/30 hover:text-white/50 transition-colors mt-0.5 cursor-help">
                      <span className="text-[9px] font-bold tracking-wider uppercase">PRECIO NO FINAL</span>
                      <Info size={12} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  className="relative w-full h-[52px] px-8 font-extrabold rounded-xl bg-[#3B82F6] text-white flex items-center justify-center gap-2.5 transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-[0.98] uppercase tracking-wider text-sm cursor-pointer"
                  style={{ boxShadow: '0 4px 0 #1D4ED8, 0 8px 20px rgba(59, 130, 246, 0.25)' }}
                >
                  <ShoppingCart size={16} />
                  Comprar ahora
                  <ArrowRight size={16} />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={12} className="text-amber-400 fill-amber-400 opacity-70" />
                    ))}
                  </div>
                  <span className="text-[11px] text-white/30 font-medium">5.0 (—)</span>
                </div>
              </div>
            </div>

            {/* Recent Purchases Section in Sidebar */}
            <div className="rounded-2xl bg-white/[0.02] backdrop-blur-sm px-3 pt-4 pb-3" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                  <h3 className="text-[11px] font-bold text-white tracking-widest uppercase opacity-40">Últimas compras</h3>
                </div>
                <span className="text-[9px] font-bold text-blue-400/50 uppercase tracking-widest">En vivo</span>
              </div>

              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {recentPurchases.length > 0 ? recentPurchases.map((item, i) => {
                  const timeAgo = (date: string) => {
                    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
                    if (seconds < 60) return 'HACE UN MOMENTO';
                    if (seconds < 3600) return `HACE ${Math.floor(seconds / 60)} MIN`;
                    return `HACE ${Math.floor(seconds / 3600)} HORAS`;
                  };
                  
                  // Solo cargar avatar si tenemos el ID de Roblox
                  const avatarUrl = item.userId ? `${SERVER_URL}/api/users/avatar/${item.userId}` : null;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-blue-500/15 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden group-hover/item:border-blue-500/30 transition-colors">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = '/images/robux-logo.svg'; }} />
                          ) : (
                            <img src="/images/robux-logo.svg" alt="" className="w-5 h-5 opacity-20" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white/80 leading-tight group-hover/item:text-white transition-colors">{item.username}</span>
                          <span className="text-[9px] text-white/20 uppercase font-medium tracking-wider">{timeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-500/5 px-2.5 py-1.5 rounded-lg border border-blue-500/10">
                        <span className="text-xs font-black text-blue-400">+{item.amount?.toLocaleString() || '0'}</span>
                        <div className="relative w-3.5 h-3.5">
                          <img
                            src="/images/robux-logo.svg"
                            style={{ filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(199deg) brightness(109%) contrast(95%)' }}
                            className="w-full h-full object-contain opacity-80"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-8 text-center opacity-20">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Esperando compras...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile/Side badges */}
            <div className="rounded-xl border border-white/[0.06] p-3.5 relative overflow-hidden bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/15 shrink-0">
                  <Shield size={14} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-xs">Pago Seguro</h3>
                  <p className="text-white/30 text-[11px] leading-tight line-clamp-1">Tarjetas, PayPal, Binance y más.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div variants={itemVariants}>
          {/* Large SEO/Bottom Section */}
          <section className="w-full mt-24 pt-20 border-t border-white/[0.06]">
            <div className="mb-14 sm:mb-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-5">Compra Robux Baratos con Entrega en Minutos</h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-400 max-w-3xl">
                En PIXEL STORE puedes comprar Robux al mejor precio con entrega automática. Aceptamos pagos locales de toda Latinoamérica. Con más de 50,000 pedidos completados y 0 baneos reportados, somos la tienda número uno en confianza.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 relative">
              {[
                { val: '+50,000', label: 'pedidos completados' },
                { val: '+50M', label: 'Robux vendidos' },
                { val: '0', label: 'baneos reportados' },
                { val: '4.9/5', label: 'estrellas promedio' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="relative rounded-2xl px-5 py-6 text-center border border-white/[0.06] bg-white/[0.02] overflow-hidden group"
                >
                  {/* Shared Layout Highlight */}
                  <AnimatePresence>
                    {activeStatIndex === i && (
                      <motion.div 
                        layoutId="active-stat-bg"
                        className="absolute inset-0 z-0 bg-blue-600/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 150,
                          damping: 25,
                          mass: 1.2
                        }}
                      >
                        {/* Fake Motion Blur Effect */}
                        <motion.div 
                          className="absolute inset-0 bg-blue-500/20 blur-xl"
                          animate={{ 
                            scaleX: [1, 1.3, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{ duration: 0.8 }}
                        />
                        <div className="absolute inset-0 border-2 border-blue-500/30 rounded-2xl" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative z-10">
                    <motion.div 
                      animate={{ 
                        scale: activeStatIndex === i ? 1.1 : 1,
                        color: activeStatIndex === i ? "#60a5fa" : "#ffffff"
                      }}
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-500"
                    >
                      {stat.val}
                    </motion.div>
                    <motion.div 
                      animate={{ 
                        opacity: activeStatIndex === i ? 1 : 0.4,
                        color: activeStatIndex === i ? "#60a5fa" : "#94a3b8"
                      }}
                      className="text-xs sm:text-sm mt-1 uppercase font-bold tracking-tighter transition-colors duration-500"
                    >
                      {stat.label}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-16">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 tracking-tight">¿Por qué comprar Robux en PIXEL STORE?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: 'Mejor precio garantizado', d: 'Ahorra hasta un 40% comparado con el precio oficial de Roblox. Monitoreamos el mercado constantemente para darte lo mejor.' },
                  { t: 'Entrega automática', d: 'El 95% de los pedidos se completan en menos de 5 minutos mediante nuestro sistema automático de Gamepass.' },
                  { t: 'Pagos locales', d: 'Paga con tu método favorito en tu propia moneda. Transferencias, depósitos y más. Seguro y encriptado.' },
                  { t: '100% seguro, 0 baneos', d: 'Más de 50,000 entregas exitosas sin un solo baneo. Nuestros métodos son los más seguros del mercado.' },
                ].map((f, i) => (
                  <div key={i} className="rounded-2xl px-5 py-5 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-2">{f.t}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-20">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 tracking-tight">Preguntas y Respuestas</h2>
              <div className="space-y-3">
                {[
                  {
                    q: '¿Cómo comprar Robux?',
                    a: 'Elige la cantidad de Robux, selecciona tu método de entrega (Gamepass o Grupo), tu moneda y haz clic en Comprar. Sigue los pasos y recibirás tus Robux automáticamente.'
                  },
                  {
                    q: '¿Cuánto tarda la entrega?',
                    a: 'Vía Gamepass, la entrega es automática en minutos. Vía Grupo, debes unirte al grupo y esperar 14 días la primera vez, luego es instantáneo.'
                  },
                  {
                    q: '¿Qué métodos de pago aceptan?',
                    a: 'Aceptamos Tarjetas, PayPal, Binance, y métodos locales de tu país. Todos los pagos se procesan de forma segura.'
                  },
                  {
                    q: '¿Es seguro comprar aquí?',
                    a: 'Sí, 100% seguro. Tenemos más de 50,000 pedidos completados con excelentes calificaciones. Tu compra está protegida.'
                  },
                  {
                    q: '¿Qué pasa si no recibo mis Robux?',
                    a: 'Nuestro soporte está disponible 24/7. Si hay algún problema con tu entrega, te ayudaremos de inmediato o te daremos un reembolso total.'
                  }
                ].map((faq, i) => (
                  <div key={i} className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(activeFaq === i + 10 ? null : i + 10)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white/80">{faq.q}</span>
                      <ChevronDown size={20} className={`text-white/20 transition-transform ${activeFaq === i + 10 ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeFaq === i + 10 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      </motion.div>
    </motion.div>

    {/* Modals outside main motion.div for stability */}
    <AnimatePresence>
      {isGamepassModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsGamepassModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[480px] bg-[#0d0c22] border border-blue-500/20 rounded-[24px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.15), transparent 60%)'
            }}
          >
            {gamepassStep === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6"
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Verificación</h2>
                    <p className="text-white/40 text-[11px] font-medium">Confirma tu cuenta de Roblox</p>
                  </div>
                  <button onClick={() => setIsGamepassModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center justify-center gap-0 my-8 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <Search size={14} className="text-white" />
                    </div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">BUSCAR</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-white/20"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/></svg>
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">CREAR GAMEPASS</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white/20" />
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">VERIFICADO</span>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="relative mt-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                      <Search size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Usuario de Roblox..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (selectedUser) setSelectedUser(null);
                      }}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/5 transition-all shadow-inner"
                    />
                  </div>
                  
                  {/* Recent users or empty state */}
                  {!selectedUser && !searchQuery.trim() && recentUsers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Recientes</p>
                      {recentUsers.map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => { 
                            setSelectedUser(u); 
                            setSearchQuery(u.name);
                            setGamepassStep(2);
                          }}
                          className="w-full p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/30 rounded-xl flex items-center gap-3 transition-all text-left"
                        >
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0">
                            <img
                              src={(u.id || u.userId) ? `${BASE_URL}/users/avatar/${u.id || u.userId}` : `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=0D8ABC&color=fff`}
                              alt={u.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { 
                                console.log("Avatar load failed, using fallback for:", u.name);
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=0D8ABC&color=fff`; 
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{u.displayName || u.name}</p>
                            <p className="text-[11px] text-white/40">@{u.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!selectedUser && !searchQuery.trim() && recentUsers.length === 0 && (
                    <div className="py-6 flex flex-col items-center justify-center gap-3 opacity-40">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                         <Search size={24} className="text-blue-500/40" />
                      </div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">
                        Ingresa tu nombre de usuario para continuar
                      </p>
                    </div>
                  )}
                  
                  {selectedUser && (
                    <div className="p-4 bg-white/[0.03] border border-blue-500/30 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-full overflow-hidden border-2 border-blue-500/50">
                          <img 
                            src={(selectedUser.id || selectedUser.userId) ? `${BASE_URL}/users/avatar/${selectedUser.id || selectedUser.userId}` : `https://ui-avatars.com/api/?name=${selectedUser.name || 'User'}&background=0D8ABC&color=fff`} 
                            alt={selectedUser.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { 
                              console.log("Selected avatar load failed");
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedUser.name || 'User'}&background=0D8ABC&color=fff`; 
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white leading-tight">{selectedUser.displayName || selectedUser.name}</h4>
                          <p className="text-blue-400/80 text-[11px] font-medium">@{selectedUser.name}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                         <CheckCircle2 size={16} />
                      </div>
                    </div>
                  )}
                  
                  {(selectedUser || searchQuery.trim().length > 0) && (
                    <button 
                      onClick={async () => {
                        if (isLoading) return;
                        
                        if (!selectedUser && searchQuery.trim()) {
                          setIsLoading(true);
                          try {
                            const result = await RobloxAPI.searchUser(searchQuery.trim());
                            if (result && result.data && result.data.length > 0) {
                              const user = result.data[0];
                              setSelectedUser(user);
                              saveRecentUser(user);
                            } else {
                              alert('Usuario no encontrado. Verifica el nombre exacto de Roblox.');
                            }
                          } catch (error) {
                            console.error(error);
                            alert('Error al buscar el usuario. Intenta de nuevo más tarde.');
                          } finally {
                            setIsLoading(false);
                          }
                        } else if (selectedUser) {
                          setGamepassStep(2);
                        }
                      }}
                      disabled={isLoading}
                      className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 uppercase tracking-wider mt-4"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner />
                          <span>Buscando...</span>
                        </>
                      ) : (
                        <>
                          {selectedUser ? 'Continuar' : 'Buscar Usuario'} <ArrowRight size={16} strokeWidth={3} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
            
            {gamepassStep === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6"
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Verificación</h2>
                    <p className="text-white/40 text-[11px] font-medium">Confirma tu cuenta de Roblox</p>
                  </div>
                  <button onClick={() => setIsGamepassModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center justify-center gap-0 my-8 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center opacity-50">
                      <Search size={14} className="text-white" />
                    </div>
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">BUSCAR</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-blue-600/30 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-white"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/></svg>
                    </div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">CREAR GAMEPASS</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white/20" />
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">VERIFICADO</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                         <div className="relative w-5 h-5">
                           <img src="/images/robux-logo.svg" className="w-full h-full object-contain filter brightness-0 invert" style={{ filter: 'brightness(0) saturate(100%) invert(60%) sepia(80%) saturate(300%) hue-rotate(100deg) brightness(90%) contrast(90%)' }} alt="Robux" />
                         </div>
                       </div>
                       <div>
                         <h4 className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Precio requerido</h4>
                         <p className="text-lg font-black text-white">{gamepassRequiredPrice.toLocaleString()} R$</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => navigator.clipboard.writeText(gamepassRequiredPrice.toString())}
                       className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-[11px] font-bold transition-colors border border-white/10"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                       Copiar
                    </button>
                  </div>
                  
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                     <HelpCircle size={14} className="text-amber-500 flex-shrink-0" />
                     <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wide">Desactiva "Precios Regionales" en tu gamepass</span>
                  </div>
                  
                  {existingGamepasses.find(gp => gp.price === gamepassRequiredPrice) ? (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-black/40 rounded-xl overflow-hidden border border-emerald-500/30 shrink-0">
                          {existingGamepasses.find(gp => gp.price === gamepassRequiredPrice)?.thumbnail ? (
                            <img src={existingGamepasses.find(gp => gp.price === gamepassRequiredPrice)?.thumbnail} className="w-full h-full object-cover" alt="Gamepass" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <LucideTag size={20} className="text-emerald-500/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 truncate">
                          <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">¡Encontrado!</h4>
                          <p className="text-sm font-black text-white truncate">{existingGamepasses.find(gp => gp.price === gamepassRequiredPrice)?.name}</p>
                          <p className="text-xs text-white/50">{existingGamepasses.find(gp => gp.price === gamepassRequiredPrice)?.price} R$</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                         <CheckCircle2 size={16} className="text-emerald-400" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-1">Pasos</h4>
                        <div className="space-y-2">
                           {[
                             { num: 1, text: "Abre Roblox Create" },
                             { num: 2, text: "Crea un Gamepass en tu juego" },
                             { num: 3, text: "Desactiva precios regionales" },
                             { num: 4, text: `Pon el precio exacto: ${gamepassRequiredPrice.toLocaleString()} R$` }
                           ].map(step => (
                             <div key={step.num} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400">
                                  {step.num}
                                </div>
                                <span className="text-xs font-bold text-white/80">{step.text}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 flex flex-col gap-3 items-center">
                         {existingGamepasses.length > 0 && existingGamepasses[0].universeId && (
                           <button 
                             onClick={() => window.open(`https://create.roblox.com/dashboard/creations/experiences/${existingGamepasses[0].universeId}/passes/${existingGamepasses[0].id}/sales`, '_blank')}
                             className="w-full flex items-center justify-center gap-2 p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl text-white/80 text-xs font-bold transition-all shadow-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-white/40"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                             Editar gamepass existente ({existingGamepasses[0].price} R$) <ExternalLink size={12} className="text-white/40 ml-1" />
                           </button>
                         )}
                         
                         <button 
                           onClick={() => {
                             if (existingGamepasses.length > 0 && existingGamepasses[0].universeId) {
                               window.open(`https://create.roblox.com/dashboard/creations/experiences/${existingGamepasses[0].universeId}/passes`, '_blank');
                             } else {
                               window.open('https://create.roblox.com/dashboard/creations', '_blank');
                             }
                           }}
                           className="text-[11px] font-bold text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                           O crear uno nuevo <ExternalLink size={10} />
                         </button>
                      </div>
                    </>
                  )}
                  
                  <button 
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const alreadyFound = existingGamepasses.find(gp => gp.price === gamepassRequiredPrice);
                        if (alreadyFound) {
                          setSelectedGamepass(alreadyFound);
                          setGamepassStep(3);
                          return;
                        }
                        
                        if (!selectedUser) {
                          alert('Usuario no seleccionado.');
                          return;
                        }
                        const placesRes = await RobloxAPI.getUserPlaces(selectedUser.id);
                        if (!placesRes.data || placesRes.data.length === 0) {
                          alert('No tienes juegos públicos en Roblox para crear un gamepass.');
                          return;
                        }
                        
                        let foundGamepass = null;
                        for (const place of placesRes.data) {
                          const gpRes = await RobloxAPI.getPlaceGamepasses(place.id, selectedUser.id);
                          if (gpRes.data && gpRes.data.length > 0) {
                            foundGamepass = gpRes.data.find((gp: any) => gp.price === gamepassRequiredPrice);
                            if (foundGamepass) break;
                          }
                        }
                        
                        if (foundGamepass) {
                          setSelectedGamepass(foundGamepass);
                          setGamepassStep(3);
                        } else {
                          alert(`No se encontró ningún gamepass tuyo con el precio exacto de ${gamepassRequiredPrice} R$. Asegúrate de que está a la venta y el precio es el correcto.`);
                        }
                      } catch (error) {
                        console.error('Error verificando gamepass:', error);
                        alert('Hubo un error de conexión al verificar el gamepass. Por favor, intenta de nuevo en unos segundos.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 uppercase tracking-wider mt-4"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>Verificando...</span>
                      </>
                    ) : existingGamepasses.find(gp => gp.price === gamepassRequiredPrice) ? (
                      <>
                        Continuar <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        Verificar ahora
                      </>
                    )}
                  </button>
                  
                  <div className="text-center pt-2">
                     <button className="text-[11px] font-bold text-white/40 hover:text-white/70 flex items-center gap-1 justify-center mx-auto transition-colors">
                       ¿Quieres buscar el gamepass por URL? <ExternalLink size={10} />
                     </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {gamepassStep === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 flex flex-col items-center justify-center text-center min-h-[300px]"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20"
                >
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-black text-white tracking-tight mb-2"
                >
                  ¡Verificado!
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/40 text-sm font-bold mb-8"
                >
                  Gamepass encontrado correctamente
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setGamepassStep(4)}
                  className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-3 uppercase tracking-wider"
                >
                  Continuar <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}
            
            {gamepassStep === 4 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6"
              >
                <div className="flex justify-end mb-2">
                  <button onClick={() => setIsGamepassModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-600/20 shadow-inner">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                       <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                         <div className="w-3 h-3 bg-white rounded-full"></div>
                       </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                    {displayAmount.toLocaleString()} Robux
                  </h2>
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">Entrega por gamepass</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 ml-1">Cuenta de Roblox</h4>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-[24px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-2xl overflow-hidden border border-white/10">
                          <img 
                            src={selectedUser?.avatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${selectedUser?.id || 0}&width=150&height=150&format=png`} 
                            alt={selectedUser?.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-7CD8F7C85B3C840748F735B16F6D2687-Png/150/150/AvatarHeadshot/Webp/noFilter';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-white tracking-tight">{selectedUser?.displayName || selectedUser?.name || 'Usuario'}</h4>
                            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                              <CheckCircle2 size={10} strokeWidth={4} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setGamepassStep(1)}
                        className="text-[11px] font-black text-[#3B82F6] hover:text-[#5fa1ff] transition-colors uppercase tracking-wider"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3">
                      <LucideTag size={16} className="text-white/20" />
                      <span className="text-[11px] font-black text-white tracking-widest uppercase">¿Tienes un código?</span>
                    </div>
                    <span className="text-[11px] font-bold text-white/20">Aplícalo aquí</span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        setIsGamepassModalOpen(false);
                        navigate('/checkout', { 
                          state: { 
                            amount: displayAmount,
                            username: selectedUser?.name || 'Usuario',
                            userId: selectedUser?.id || '0',
                            method: 'gamepass',
                            gamepassId: selectedGamepass?.id
                          } 
                        });
                      }, 1000);
                    }}
                    disabled={isLoading}
                    className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_12px_24px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 tracking-wider mt-4"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        Ir al pago <ArrowRight size={18} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsGroupModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[480px] bg-[#0d0c22] border border-blue-500/20 rounded-[24px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.15), transparent 60%)'
            }}
          >
            {/* Step 1: Initial Summary */}
            {groupStep === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1835] border border-white/5 rounded-2xl flex items-center justify-center shadow-inner">
                      <div className="w-6 h-6">
                        <img src="/images/robux-logo.svg" className="w-full h-full object-contain filter brightness-0 invert opacity-90" alt="" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white leading-tight">{displayAmount.toLocaleString()} Robux</h2>
                      <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.1em]">Entrega por grupo</p>
                    </div>
                  </div>
                  <button onClick={() => setIsGroupModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mb-1 px-1">CUENTA DE ROBLOX</div>
                  
                  {selectedUser ? (
                    <div className="relative group p-4 bg-white/[0.03] border border-white/[0.08] rounded-[22px] flex items-center justify-between transition-all hover:bg-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gray-800 rounded-full overflow-hidden border border-white/10 ring-4 ring-white/5">
                          <img 
                            src={selectedUser.avatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${selectedUser.id}&width=150&height=150&format=png`} 
                            alt={selectedUser.name} 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-7CD8F7C85B3C840748F735B16F6D2687-Png/150/150/AvatarHeadshot/Webp/noFilter'; }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{selectedUser.name}</h4>
                            <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-500/10" strokeWidth={3} />
                          </div>
                          <p className="text-white/30 text-[10px] font-bold">Cuenta Verificada</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setGroupStep(2)}
                        className="text-[10px] font-black text-[#3B82F6] hover:text-[#5fa1ff] transition-colors uppercase tracking-widest"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setGroupStep(2)}
                      className="w-full group flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-blue-500/5 hover:border-blue-500/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                          <Users size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Seleccionar usuario</h4>
                          <p className="text-white/30 text-[10px]">Busca tu cuenta de Roblox</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  <button className="w-full flex items-center justify-center gap-2 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white/40 hover:text-white/60 hover:bg-white/[0.05] transition-all text-xs font-bold shadow-sm">
                    <LucideTag size={14} className="opacity-40" />
                    ¿Tienes un código? <span className="text-white/60">Aplícalo aquí</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (selectedUser) {
                        handleVerifyGroups();
                      } else {
                        setGroupStep(2);
                      }
                    }}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-[0.1em] shadow-lg ${
                      !isLoading
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white hover:brightness-110 active:scale-[0.98]' 
                      : 'bg-white/[0.05] text-white/20 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <LoadingSpinner />
                        <span>Cargando...</span>
                      </div>
                    ) : (
                      <>
                        Continuar <ArrowRight size={18} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Search User */}
            {groupStep === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6"
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Verificación</h2>
                    <p className="text-white/40 text-[11px] font-medium">Únete al grupo para recibir tus Robux</p>
                  </div>
                  <button onClick={() => setIsGroupModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Progress Bar from Image */}
                <div className="flex items-center justify-center gap-0 my-8 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <Search size={14} className="text-white" />
                    </div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">BUSCAR</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                      <Users size={14} className="text-white/20" />
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">VERIFICAR GRUPO</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white/20" />
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">VERIFICADO</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Step 2: Search User */}
                  <div>
                    {recentUsers.length > 0 && !searchQuery.trim() && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <HelpCircle size={14} className="text-white/20" />
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Usuarios recientes</span>
                        </div>
                        <div className="space-y-2">
                          {recentUsers.map(user => (
                            <div 
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                handleVerifyGroups();
                              }}
                              className={`flex items-center justify-between p-3 border transition-all cursor-pointer rounded-xl ${selectedUser?.id === user.id ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                                  <img src={user.avatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${user.id}&width=150&height=150&format=png`} alt={user.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-7CD8F7C85B3C840748F735B16F6D2687-Png/150/150/AvatarHeadshot/Webp/noFilter'; }} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-white leading-tight">{user.name}</h4>
                                  <p className="text-white/30 text-[10px]">@{user.name}</p>
                                </div>
                              </div>
                              <ArrowRight size={14} className="text-white/20" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!selectedUser && !searchQuery.trim() && recentUsers.length === 0 && (
                      <div className="py-6 flex flex-col items-center justify-center gap-3 opacity-40">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                           <Search size={24} className="text-blue-500/40" />
                        </div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">
                          Ingresa tu nombre de usuario para continuar
                        </p>
                      </div>
                    )}

                    <div className="relative mt-4">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                        <Search size={16} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Usuario de Roblox..." 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (selectedUser) setSelectedUser(null);
                        }}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/5 transition-all shadow-inner"
                      />
                    </div>

                    {searchQuery.trim().length > 0 && (
                      <button 
                        onClick={async () => {
                          if (isLoading) return;
                          setIsLoading(true);
                          try {
                            const result = await RobloxAPI.searchUser(searchQuery.trim());
                            if (result && result.data && result.data.length > 0) {
                              // Limpiar estados anteriores para asegurar búsqueda limpia
                              setExistingGamepasses([]);
                              setSelectedUser(null);
                              
                              const user = result.data[0];
                              setSelectedUser(user);
                              saveRecentUser(user);
                              handleVerifyGroups();
                            } else {
                              alert('Usuario no encontrado. Verifica el nombre exacto de Roblox.');
                            }
                          } catch (error) {
                            console.error(error);
                            alert('Error al buscar el usuario.');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 uppercase tracking-wider mt-4"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner />
                            <span>Buscando...</span>
                          </>
                        ) : (
                          <>
                            Buscar Usuario <ArrowRight size={16} strokeWidth={3} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Verify Group */}
            {groupStep === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Verificación</h2>
                    <p className="text-white/40 text-[11px] font-medium">Únete a los grupos para recibir tus Robux</p>
                  </div>
                  <button onClick={() => setIsGroupModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>

                {/* Progress Bar - Updated for Step 3 */}
                <div className="flex items-center justify-center gap-0 my-5 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center opacity-50">
                      <Search size={14} className="text-white" />
                    </div>
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">BUSCAR</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-blue-600/30 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <Users size={14} className="text-white" />
                    </div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">VERIFICAR GRUPO</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white/20" />
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">VERIFICADO</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Important Alert */}
                  <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-[24px] relative overflow-hidden">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex-shrink-0 flex items-center justify-center text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <div>
                        <h4 className="text-sm text-white font-bold mb-1">Importante: 14 días de espera</h4>
                        <p className="text-[12px] text-white/70 leading-relaxed font-medium">
                          Debes permanecer al menos <span className="font-bold text-amber-500">14 días</span> en los grupos para que Roblox permita la transferencia de Robux.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {groupVerificationResults?.details
                      .sort((a: any, b: any) => {
                        const isAMandatory = requiredGroups.find(rg => rg.id === a.groupId)?.isMandatory;
                        const isBMandatory = requiredGroups.find(rg => rg.id === b.groupId)?.isMandatory;
                        if (isAMandatory && !isBMandatory) return -1;
                        if (!isAMandatory && isBMandatory) return 1;
                        return 0;
                      })
                      .map((group: any) => (
                      <div key={group.groupId} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-[24px] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white leading-tight">{group.groupName}</h4>
                              {requiredGroups.find(rg => rg.id === group.groupId)?.isMandatory && (
                                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[7px] font-black uppercase tracking-widest rounded border border-blue-500/30">OBLIGATORIO</span>
                              )}
                            </div>
                            {group.isMember ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Ya eres miembro</span>
                              </div>
                            ) : (
                              <p className="text-white/30 text-[10px] mt-1">Debes unirte a este grupo</p>
                            )}
                          </div>
                        </div>
                        {!group.isMember && (
                          <a 
                            href={`https://www.roblox.com/groups/${group.groupId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-5 py-2 bg-white text-[#0d0c22] rounded-xl font-bold text-xs hover:scale-105 transition-all"
                          >
                            Unirse
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      const mandatoryJoined = groupVerificationResults?.details
                        .filter((g: any) => requiredGroups.find(rg => rg.id === g.groupId)?.isMandatory)
                        .every((g: any) => g.isMember);

                      if (mandatoryJoined) {
                        setGroupStep(5);
                      } else {
                        handleVerifyGroups();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 uppercase tracking-wider mt-4"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        {(() => {
                          const mandatoryJoined = groupVerificationResults?.details
                            .filter((g: any) => requiredGroups.find(rg => rg.id === g.groupId)?.isMandatory)
                            .every((g: any) => g.isMember);
                          return mandatoryJoined ? 'Continuar' : 'Verificar nuevamente';
                        })()} <ArrowRight size={16} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Final Summary */}
            {groupStep === 5 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6"
              >
                <div className="flex justify-end mb-2">
                  <button onClick={() => setIsGroupModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-inner">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <img 
                        src="/images/robux-logo.svg" 
                        className="w-6 h-6 object-contain brightness-0 invert" 
                        alt="Robux" 
                      />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                    {displayAmount.toLocaleString()} Robux
                  </h2>
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">Entrega por grupo</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 ml-1">Cuenta de Roblox</h4>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-[24px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-2xl overflow-hidden border border-white/10">
                          <img 
                            src={selectedUser?.avatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${selectedUser?.id || 0}&width=150&height=150&format=png`} 
                            alt={selectedUser?.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-7CD8F7C85B3C840748F735B16F6D2687-Png/150/150/AvatarHeadshot/Webp/noFilter';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-white tracking-tight">{selectedUser?.name || 'Usuario'}</h4>
                            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">
                              <CheckCircle2 size={10} strokeWidth={4} />
                            </div>
                          </div>
                          <p className="text-white/30 text-[10px] font-bold">
                            {requiredGroups.find(g => g.isMandatory)?.name || 'Grupos Verificados'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setGroupStep(2)}
                        className="text-[11px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3">
                      <LucideTag size={16} className="text-white/20" />
                      <span className="text-[11px] font-black text-white tracking-widest uppercase">¿Tienes un código?</span>
                    </div>
                    <span className="text-[11px] font-bold text-white/20">Aplícalo aquí</span>
                  </div>

                  <button 
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        setIsGroupModalOpen(false);
                        navigate('/checkout', { 
                          state: { 
                            amount: displayAmount,
                            username: selectedUser?.name || 'Usuario',
                            userId: selectedUser?.id || '0',
                            method: 'group'
                          } 
                        });
                      }, 1500);
                    }}
                    disabled={isLoading}
                    className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_12px_24px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 uppercase tracking-wider mt-4"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                          Ir al pago <ArrowRight size={18} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
  );
}
