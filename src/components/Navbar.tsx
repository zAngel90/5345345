import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, User, Bell, ChevronDown, ChevronRight, Gamepad2, Crown, Diamond, Home, LayoutGrid, Star, Users, Wallet, LogOut, Globe, Package, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StoreAPI, AuthAPI, SERVER_URL, ChatAPI, socket, OrdersAPI } from '../services/api';
import AuthModal from './AuthModal';

// Mapeo: id de sección → clave del nav
const SECTION_TO_NAV: Record<string, string> = {
  home: 'inicio',
  games: 'catalogo',
  'how-it-works': 'catalogo',
  testimonials: 'resenas',
  faq: 'resenas',
  groups: 'grupos',
};

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', href: '/', icon: Home },
  { id: 'catalogo', label: 'Catálogo', href: '/catalog', icon: LayoutGrid, isDropdown: true },
  { id: 'fortnite', label: 'Fortnite', href: '/fortnite', icon: Gamepad2 },
  { id: 'resenas', label: 'Reseñas', href: '/reviews', icon: Star },
  { id: 'grupos', label: 'Grupos', href: '/groups', icon: Users },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orderNotifCount, setOrderNotifCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifTab, setNotifTab] = useState('todas');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('inicio');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [dropdownCategories, setDropdownCategories] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await StoreAPI.getGamesConfig();
        if (res.success) {
          // Tomamos los primeros 4 juegos configurados en el admin (que no estén ocultos)
          setDropdownCategories(res.data.filter((g: any) => !g.hidden).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching games for navbar:', err);
      }
    };
    fetchGames();
  }, [location.pathname]);


  useEffect(() => {
    const token = localStorage.getItem('pixel_token');
    const savedUser = localStorage.getItem('pixel_user');
    if (token && savedUser) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchUnreadCount();
      fetchOrders(parsedUser.id, parsedUser.username);
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await ChatAPI.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchOrders = async (userId: string, username: string) => {
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
      // Solo contamos los pendientes que NO han sido marcados como "vistos"
      const pending = allOrders.filter((o: any) => o.status === 'pending' && !o.seen).length;
      setOrderNotifCount(pending);
    } catch (err) {
      console.error('Error fetching orders for notif:', err);
    }
  };

  // Tiempo Real para notificaciones
  useEffect(() => {
    if (isLoggedIn && user) {
      const channel = user.role === 'admin' ? 'notification-admin' : `notification-${user.id}`;
      
      const handleNotification = () => {
        fetchUnreadCount();
      };

      socket.on(channel, handleNotification);
      
      return () => {
        socket.off(channel, handleNotification);
      };
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (location.pathname.startsWith('/catalog')) {
      setActiveNav('catalogo');
    } else if (location.pathname === '/reviews') {
      setActiveNav('resenas');
    } else if (location.pathname === '/groups') {
      setActiveNav('grupos');
    } else if (location.pathname === '/fortnite') {
      setActiveNav('fortnite');
    } else if (location.pathname === '/') {
      setActiveNav('inicio');
    }
  }, [location]);

  const handleClearNotifications = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Si no está logueado no hacemos nada
    if (!user) return;

    try {
      // 1. Llamadas al backend para persistir el "limpiar"
      await Promise.all([
        ChatAPI.markAllAsRead(user.id),
        OrdersAPI.markAllSeen(user.id)
      ]);

      // 2. Limpiar estado local inmediatamente
      setUnreadCount(0);
      setOrderNotifCount(0);
      
      // Actualizar la lista de órdenes localmente para marcar todas como vistas
      setOrders(prev => prev.map(o => ({ ...o, seen: true })));

    } catch (err) {
      console.error('Error clearing notifications on backend:', err);
      // Fallback: al menos limpiar localmente si falla el backend (opcional)
      setUnreadCount(0);
      setOrderNotifCount(0);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      if (showNotifications) setShowNotifications(false);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfile]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id') || '';
            const navKey = SECTION_TO_NAV[id];
            if (navKey) setActiveNav(navKey);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-10% 0% -80% 0%' }
    );

    document.querySelectorAll('section[id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none pt-0">
        <motion.div
          initial={false}
          animate={isScrolled ? 'scrolled' : 'top'}
          variants={{
            top: {
              width: '100%',
              y: 0,
              borderRadius: '0px',
              backgroundColor: 'rgba(13, 12, 34, 0.98)',
              borderColor: 'rgba(255, 255, 255, 0)',
            },
            scrolled: {
              width: 'min(calc(100% - 2rem), 1200px)',
              y: 20,
              borderRadius: '100px',
              backgroundColor: 'rgba(13, 12, 34, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
            }
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'translateZ(0)',
            WebkitFontSmoothing: 'antialiased',
            filter: 'none' 
          }}
          className="pointer-events-auto relative z-50 border-b lg:border mx-auto overflow-visible transform-gpu"
        >
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 py-2.5">
            
            {/* Mobile View: Menu (Left), Logo (Center), Actions (Right) */}
            <div className="flex lg:hidden items-center justify-between w-full">
              <button
                className="p-2 text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu size={24} />
              </button>

              <Link to="/" onClick={() => setActiveNav('inicio')} className="flex items-center">
                <img src="https://i.postimg.cc/5tSsMDgK/logo-4x.png" alt="Pixel Store" className="h-8 w-auto object-contain" />
              </Link>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 relative">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0D0B1E]"></span>
                </button>
                {isLoggedIn ? (
                  <button 
                    onClick={() => navigate('/account')}
                    className="size-8 rounded-full border border-white/10 overflow-hidden"
                  >
                    <img src="https://i.postimg.cc/mD8ZzQzC/avatar.png" alt="" className="size-full object-cover" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white"
                  >
                    <User size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop View: Logo (Left), Nav (Center), Actions (Right) */}
            <div className="hidden lg:flex items-center justify-between w-full">
              <Link to="/" onClick={() => setActiveNav('inicio')} className="flex items-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                <img src="https://i.postimg.cc/5tSsMDgK/logo-4x.png" alt="Pixel Store" className="h-10 w-auto object-contain" />
              </Link>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 relative overflow-visible">
                <motion.div
                  layoutId="nav-lamp"
                  className="absolute bottom-0 h-full z-0 flex flex-col items-center justify-end pointer-events-none"
                  initial={false}
                  animate={{
                    left: `${NAV_ITEMS.findIndex(i => i.id === (hoveredNav || activeNav)) * (100 / NAV_ITEMS.length)}%`,
                    width: `${100 / NAV_ITEMS.length}%`
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                >
                  <div className="w-full h-full max-w-[80px] mx-auto" style={{ background: 'radial-gradient(circle at bottom, rgba(96,165,250,0.15) 0%, transparent 70%)' }} />
                  <div className="w-8 h-[2.5px] bg-blue-400 rounded-full shadow-[0_-2px_15px_3px_rgba(96,165,250,0.6),0_0_30px_4px_rgba(96,165,250,0.3)]" />
                </motion.div>

                {NAV_ITEMS.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative group"
                    onMouseEnter={() => {
                      setHoveredNav(item.id);
                      if (item.isDropdown) setIsDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      setHoveredNav(null);
                      if (item.isDropdown) setIsDropdownOpen(false);
                    }}
                  >
                    <Link
                      to={item.href}
                      className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 z-10 ${
                        activeNav === item.id ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveNav(item.id)}
                    >
                      <item.icon size={14} />
                      {item.label}
                      {item.isDropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
                    </Link>

                    {item.isDropdown && (
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.995 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.995 }}
                            transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1.0] }}
                            className="absolute top-full left-0 pt-2 z-50 w-full min-w-[220px]"
                          >
                            <div className="bg-[#0D0C22]/95 backdrop-blur-2xl border border-white/5 rounded-[20px] p-1.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/5 overflow-hidden">
                              <div className="space-y-0.5">
                                {dropdownCategories.length > 0 ? (
                                  dropdownCategories.map((cat) => (
                                    <Link
                                      key={cat.id}
                                      to={`/catalog/ingame/${cat.id}`}
                                      className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-white/[0.03] transition-all group relative"
                                      onClick={() => setIsDropdownOpen(false)}
                                    >
                                      <div className="size-6 rounded-lg overflow-hidden bg-white/[0.02] shrink-0 border border-white/5 group-hover:border-white/20 transition-all duration-300">
                                        <img 
                                          src={cat.image?.startsWith('http') ? cat.image : `${SERVER_URL}${cat.image}`} 
                                          alt="" 
                                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale-[0.3] group-hover:grayscale-0" 
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0 leading-tight">
                                        <p className="text-[9px] font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-widest leading-none">{cat.name}</p>
                                        <p className="text-[7px] text-white/20 uppercase font-bold tracking-tighter mt-0.5 leading-none">Explorar items</p>
                                      </div>
                                      <ChevronRight size={10} className="text-white/5 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                  ))
                                ) : (
                                  <div className="p-4 text-center py-6">
                                    <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-white/20 animate-spin mx-auto" />
                                  </div>
                                )}
                              </div>
                              
                                <div className="mt-1 pt-1 border-t border-white/5 space-y-0.5">
                                  <Link
                                    to="/catalog/ingame/limiteds"
                                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-blue-500/10 transition-all group relative border border-transparent hover:border-blue-500/20"
                                    onClick={() => setIsDropdownOpen(false)}
                                  >
                                    <div className="size-6 rounded-lg overflow-hidden bg-blue-500/10 shrink-0 border border-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300 flex items-center justify-center">
                                      <Crown size={12} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0 leading-tight">
                                      <p className="text-[9px] font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-widest leading-none">Limiteds / Trade</p>
                                      <p className="text-[7px] text-white/20 uppercase font-bold tracking-tighter mt-0.5 leading-none">Intercambio de items</p>
                                    </div>
                                    <ChevronRight size={10} className="text-white/5 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                                  </Link>

                                  <Link
                                    to="/catalog/ingame/murder-mystery-2"
                                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-red-500/10 transition-all group relative border border-transparent hover:border-red-500/20"
                                    onClick={() => setIsDropdownOpen(false)}
                                  >
                                    <div className="size-6 rounded-lg overflow-hidden bg-red-500/10 shrink-0 border border-red-500/20 group-hover:border-red-500/40 transition-all duration-300 flex items-center justify-center">
                                      <Shield size={12} className="text-red-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0 leading-tight">
                                      <p className="text-[9px] font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-widest leading-none">Murder Mystery 2</p>
                                      <p className="text-[7px] text-white/20 uppercase font-bold tracking-tighter mt-0.5 leading-none">Armas y Skins raras</p>
                                    </div>
                                    <ChevronRight size={10} className="text-white/5 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                                  </Link>

                                  <Link
                                    to="/catalog"
                                    className="flex items-center justify-center gap-2 py-1 text-[8px] font-black text-white/30 hover:text-white/90 uppercase tracking-[0.2em] transition-all hover:bg-white/[0.02] rounded-lg"
                                    onClick={() => setIsDropdownOpen(false)}
                                  >
                                    Ver todo <ChevronRight size={10} className="opacity-50" />
                                  </Link>
                                </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 relative">
                <div className="relative" ref={notifRef}>
                  <button onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }} className={`p-2 transition-all hover:scale-110 active:scale-95 relative rounded-full ${showNotifications ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-blue-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-[0_0_10px_rgba(59,130,246,0.6)] border-2 border-[#0D0B1E]">
                        {unreadCount > 9 ? '+9' : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>{showNotifications && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10, originX: '90%', originY: '0%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', stiffness: 450, damping: 30 }} className="absolute top-full right-0 mt-3 w-[300px] bg-pixel-panel/98 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] pointer-events-auto">
                      <div className="flex items-center justify-between mb-3 px-2 pt-1">
                        <h3 className="text-sm font-bold text-white tracking-tight">Notificaciones</h3>
                        <button 
                          onClick={handleClearNotifications}
                          className="text-[10px] text-blue-400 hover:underline font-medium"
                        >
                          Limpiar
                        </button>
                      </div>

                      {/* Notification Tabs */}
                      <div className="px-1 mb-3">
                        <div className="flex items-center p-1 bg-white/5 border border-white/5 rounded-2xl gap-1">
                          {[
                            { id: 'todas', label: 'Todas', badge: unreadCount + orderNotifCount },
                            { id: 'pedidos', label: 'Pedidos', badge: orderNotifCount },
                            { id: 'mensajes', label: 'Mensajes', badge: unreadCount }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setNotifTab(tab.id)}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                notifTab === tab.id 
                                  ? 'bg-blue-600/20 text-white shadow-lg' 
                                  : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              <span className="relative z-10">{tab.label}</span>
                              {tab.badge > 0 && (
                                <span className={`
                                  min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[8px] font-black
                                  ${notifTab === tab.id ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
                                  shadow-sm ml-1
                                `}>
                                  {tab.badge > 9 ? '+9' : tab.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 mt-1">
                        {/* Notificaciones de Pedidos Reales */}
                        {(notifTab === 'todas' || notifTab === 'pedidos') && (
                          <div className="space-y-1">
                            {orders.filter(o => !o.seen).length > 0 ? (
                              orders.filter(o => !o.seen).slice(0, 3).map(order => (
                                <div 
                                  key={order.id}
                                  onClick={() => { setShowNotifications(false); navigate('/account'); }}
                                  className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group flex gap-3 items-start"
                                >
                                  <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                    order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    <Package size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className="text-[12px] font-black text-white group-hover:text-blue-400 transition-colors capitalize">Pedido {order.status}</h4>
                                      <span className="text-[9px] font-bold text-white/20">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight truncate">ID: {order.id} • {order.amount} Robux</p>
                                  </div>
                                  {order.status === 'pending' && <div className="size-2 bg-amber-500 rounded-full mt-2 animate-pulse" />}
                                </div>
                              ))
                            ) : notifTab === 'pedidos' && (
                              <div className="p-8 text-center opacity-20">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">No tienes pedidos</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notificaciones de Mensajes */}
                        {(notifTab === 'todas' || notifTab === 'mensajes') && (
                          unreadCount > 0 ? (
                            <div 
                              onClick={() => { setShowNotifications(false); navigate('/chat'); }}
                              className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer group flex gap-3 items-center"
                            >
                              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                                <img src="https://i.postimg.cc/mD8ZzQzC/avatar.png" alt="" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0d0c22] rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-2">
                                  <h4 className="text-[12px] font-black text-white truncate group-hover:text-blue-400 transition-colors">Soporte Pixelito</h4>
                                </div>
                                <p className="text-[10px] text-white/60 font-bold mt-0.5 leading-tight line-clamp-1">Tienes {unreadCount} mensajes nuevos.</p>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-500/30">
                                {unreadCount}
                              </div>
                            </div>
                          ) : notifTab === 'mensajes' && (
                            <div className="p-8 text-center opacity-20">
                              <p className="text-xs font-bold text-white uppercase tracking-widest">Sin mensajes</p>
                            </div>
                          )
                        )}

                        {/* Fallback si no hay nada en la pestaña seleccionada */}
                        {notifTab === 'todas' && unreadCount === 0 && orderNotifCount === 0 && (
                          <div className="p-10 text-center opacity-10">
                            <Bell size={40} className="mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Todo al día</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}</AnimatePresence>
                </div>

                <button 
                  onClick={() => isLoggedIn ? navigate('/account') : setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full font-bold text-[11px] uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95"
                >
                  <ShoppingCart size={13} strokeWidth={2.5} /> Mis Pedidos
                </button>

                {isLoggedIn ? (
                  <div className="relative" ref={profileRef}>
                    <button onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); if (showNotifications) setShowNotifications(false); }} className="flex items-center justify-center p-0.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 transition-all hover:scale-105 relative shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                      <div className="relative size-9 rounded-full overflow-hidden border-2 border-[#0D0B1E]">
                        <img 
                          src={user?.avatar?.startsWith('http') ? user.avatar : `${SERVER_URL}${user?.avatar || '/avatar.png'}`} 
                          alt="Avatar" 
                          className="size-full object-cover" 
                        />
                      </div>
                      <div className="absolute bottom-0.5 right-0.5 size-2.5 bg-emerald-500 rounded-full border-2 border-[#0D0B1E]"></div>
                    </button>
                    <AnimatePresence>{showProfile && (
                      <motion.div initial={{ opacity: 0, scale: 0.8, y: 10, originX: '90%', originY: '0%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }} transition={{ type: 'spring', stiffness: 500, damping: 20, mass: 0.8 }} className="absolute top-full right-0 mt-3 w-[280px] bg-[#161530]/75 backdrop-blur-[32px] border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] z-[70] pointer-events-auto ring-1 ring-white/5 saturate-150 brightness-[1.02]">
                        <div className="p-4 flex items-center gap-3 border-b border-white/5">
                        <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={user?.avatar?.startsWith('http') ? user.avatar : `${SERVER_URL}${user?.avatar || '/avatar.png'}`} 
                            alt="" 
                            className="size-full object-cover" 
                          />
                        </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between"><h4 className="text-sm font-bold text-white truncate">{user?.username || 'Usuario'}</h4><span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-black uppercase tracking-wider">Cliente</span></div>
                            <p className="text-[11px] text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
                          </div>
                        </div>
                        <div className="px-2 pb-2 space-y-0.5 mt-2">
                          {[ 
                            { icon: User, label: 'Mi Perfil', href: '/account' }, 
                            { icon: ShoppingCart, label: 'Mis Pedidos', href: '/orders' }, 
                            { icon: Users, label: 'Referidos', href: '/referrals' }
                          ].map((item, i) => (
                            <Link key={i} to={item.href} onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-all group text-left">
                              <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors"><item.icon size={16} className="text-gray-500 group-hover:text-blue-400" /></div>
                              <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
                            </Link>
                          ))}
                          <div className="h-px bg-white/5 my-1 mx-2"></div>
                          <button onClick={() => { 
                            localStorage.removeItem('pixel_token');
                            localStorage.removeItem('pixel_user');
                            setIsLoggedIn(false); 
                            setUser(null);
                            setShowProfile(false); 
                            navigate('/');
                          }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-500/5 transition-all group text-left mt-1">
                            <div className="size-8 rounded-xl bg-red-500/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors"><LogOut size={16} className="text-red-500/50 group-hover:text-red-500" /></div>
                            <span className="text-xs font-bold text-red-500/70 group-hover:text-red-500 transition-colors">Cerrar Sesión</span>
                          </button>
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                ) : (
                  <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-full font-medium text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    <User size={14} /> Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Auth Modal with Success Handler */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={(userData) => {
            setIsLoggedIn(true);
            setUser(userData);
          }}
        />
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] pointer-events-auto" />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#161530] z-[60] p-6 flex flex-col pointer-events-auto border-r border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <img src="https://i.postimg.cc/5tSsMDgK/logo-4x.png" alt="Logo" className="h-8" />
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="flex flex-col gap-2">
                  {NAV_ITEMS.map(item => (
                    <Link key={item.id} to={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${activeNav === item.id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                      <item.icon size={18} /> <span className="font-bold text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Navigation (Floating) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] lg:hidden w-[calc(100%-2.5rem)] max-w-[400px]">
        <div className="bg-[#161530]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {[
            { id: 'inicio', icon: Home, label: 'Inicio', href: '/' },
            { id: 'catalogo', icon: LayoutGrid, label: 'Catálogo', href: '/catalog' },
            { id: 'carrito', icon: ShoppingCart, label: 'Pedidos', href: isLoggedIn ? '/account' : '#' },
            { id: 'resenas', icon: Star, label: 'Reseñas', href: '/reviews' },
            { id: 'perfil', icon: User, label: 'Perfil', href: isLoggedIn ? '/account' : '#' },
          ].map((item) => {
            const isActive = activeNav === item.id || (item.id === 'perfil' && location.pathname === '/account');
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => {
                  if ((item.id === 'perfil' || item.id === 'carrito') && !isLoggedIn) {
                    setIsAuthModalOpen(true);
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'shrink-0' : ''} />
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="text-xs font-bold whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </div>


    </>
  );
}
