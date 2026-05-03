import React, { useState, useEffect } from 'react';
import { Zap, Gem, Lock, ShieldCheck, Star, MessageSquare, ArrowRight, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrdersAPI, SERVER_URL } from '../services/api';

export default function Hero() {
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await OrdersAPI.getRecentOrders();
        if (res.success) {
          // Doble filtro: Solo mostramos los completados también en el frontend
          const completedOnly = (res.data || []).filter((o: any) => o.status && o.status.toLowerCase() === 'completed');
          setRecentPurchases(completedOnly);
        }
      } catch (err) {
        console.error('Error fetching recent orders for hero:', err);
      }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  const duplicatedPurchases = recentPurchases.length > 0 
    ? (recentPurchases.length < 10 ? [...recentPurchases, ...recentPurchases, ...recentPurchases] : [...recentPurchases, ...recentPurchases])
    : [];

  return (
    <section id="home" className="relative z-[2] min-h-screen flex flex-col pt-32 pb-6 overflow-hidden bg-pixel-bg">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('https://i.postimg.cc/J0cxTkj2/Chat-GPT-Image-20-abr-2026-13-19-39-(1).png')` }}
      ></div>
      
      {/* Gradient overlays matching the exact dark color */}
      <div className="absolute inset-0 bg-gradient-to-r from-pixel-bg via-pixel-bg/95 to-transparent w-full lg:w-[80%]"></div>
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-pixel-bg via-pixel-bg/90 to-transparent"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-grow flex flex-col w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow items-center pt-10 pb-20">
          
          {/* Left Content */}
          <div className="flex flex-col items-start">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pixel-panel/60 backdrop-blur-md border border-white/10 mb-6 shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              <span className="text-xs font-medium text-gray-300">+500 órdenes completadas hoy</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight mb-4 leading-[1.1]">
              <span className="text-white text-shadow-sm">Compra Robux</span><br />
              {/* Balanced Gradient: Deep Blue to Fuchsia */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primary via-pixel-primaryEnd to-pixel-accent">al Mejor Precio</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-gray-400 text-base max-w-md mb-8 leading-relaxed">
              Entrega rápida, precios por volumen y sistema 100% seguro. Compra en segundos y recibe tus Robux al instante.
            </p>
            
            {/* Features Pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pixel-panel/60 backdrop-blur-md border border-white/10 text-sm font-medium text-gray-300 shadow-lg">
                <Zap size={16} className="text-yellow-400" />
                Entrega inmediata
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pixel-panel/60 backdrop-blur-md border border-white/10 text-sm font-medium text-gray-300 shadow-lg">
                <Gem size={16} className="text-pixel-accent" />
                Mejores precios
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pixel-panel/60 backdrop-blur-md border border-white/10 text-sm font-medium text-gray-300 shadow-lg">
                <Lock size={16} className="text-gray-400" />
                Compra segura 24/7
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
              <button className="px-7 py-3.5 bg-gradient-to-r from-pixel-primaryStart to-pixel-primaryEnd text-white rounded-full font-bold text-base transition-all shadow-[0_0_24px_rgba(59,91,255,0.4)] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_32px_rgba(59,91,255,0.6)] flex items-center justify-center gap-2">
                Comprar Robux Ahora
                <ArrowRight size={18} />
              </button>
              <button className="px-7 py-3.5 bg-pixel-panel/60 backdrop-blur-md hover:bg-pixel-panelHover border border-white/10 text-white rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg">
                Ver Catálogo
                <LayoutGrid size={18} />
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full pt-8 border-t border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-pixel-primaryEnd" />
                  <span className="text-white font-bold text-base">1-5 min</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Entrega promedio</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={16} className="text-pixel-primaryEnd" />
                  <span className="text-white font-bold text-base">99.8%</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Órdenes completadas</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={16} className="text-pixel-primaryEnd" />
                  <span className="text-white font-bold text-base">5.0</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Valoración de clientes</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={16} className="text-pixel-primaryEnd" />
                  <span className="text-white font-bold text-base">24/7</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Soporte activo</p>
              </div>
            </div>

          </div>

          {/* Right Content (Floating Badge) */}
          <div className="relative h-full hidden lg:block">
            <div className="absolute bottom-20 right-0 bg-pixel-panel/40 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center gap-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <div>
                <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-0.5">CONFIANZA</p>
                <p className="text-sm font-bold text-white leading-tight">+10,000 Clientes<br/>Satisfechos</p>
              </div>
              <div className="flex -space-x-3">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" alt="User" className="w-10 h-10 rounded-full border-2 border-pixel-panel object-cover" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100" alt="User" className="w-10 h-10 rounded-full border-2 border-pixel-panel object-cover" />
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" alt="User" className="w-10 h-10 rounded-full border-2 border-pixel-panel object-cover" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Ticker: Compras Recientes (Enhanced Glassmorphism) */}
        <div className="w-full mt-auto">
          <div className="bg-pixel-panel/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 flex items-center gap-4 sm:gap-6 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            
            {/* Left Header */}
            <div className="flex-shrink-0 border-r border-white/10 pr-4 sm:pr-6">
              <h3 className="text-sm font-bold text-white leading-tight">Compras<br/>recientes</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span className="text-[10px] font-bold text-green-500 tracking-wider">EN VIVO</span>
              </div>
            </div>

            {/* Scrolling Carousel */}
            <div className="flex-grow overflow-hidden relative mask-edges">
              <motion.div 
                className="flex cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: -1000, right: 1000 }}
              >
                <motion.div 
                  className="flex gap-4 w-max"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                >
                  {duplicatedPurchases.map((purchase, index) => {
                    const avatarUrl = purchase.userId ? `${SERVER_URL}/api/users/avatar/${purchase.userId}` : "https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png";
                    return (
                      <div key={index} className="flex items-center gap-3 bg-pixel-bg/50 border border-white/5 rounded-2xl p-3 min-w-[240px]">
                        <img src={avatarUrl} alt={purchase.username} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-grow">
                          <p className="text-xs font-bold text-gray-300">{purchase.username}</p>
                          <p className="text-[10px] text-gray-400">Compró <span className="text-pixel-accent font-semibold">{purchase.amount?.toLocaleString()} Robux</span></p>
                          <p className="text-[10px] text-gray-500">{timeAgo(purchase.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1 text-white font-bold text-sm">
                          +{purchase.amount?.toLocaleString()}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
                            <path d="M12 2L22 7L12 12L2 7L12 2Z" fill="currentColor" opacity="0.5"/>
                            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="currentColor"/>
                            <circle cx="12" cy="12" r="3" fill="#05050A"/>
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="hidden sm:flex flex-shrink-0 gap-2 pl-4 border-l border-white/10">
              <button className="w-8 h-8 rounded-full bg-pixel-bg/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-full bg-pixel-bg/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
