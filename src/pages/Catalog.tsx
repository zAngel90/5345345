import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  Users,
  Gamepad2,
  Search,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Plus,
  Sword,
  Diamond,
  Star,
  ShoppingCart,
  CheckCircle2,
  Crosshair,
  Crown
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreAPI, SERVER_URL } from '../services/api';

const BannerTilt = ({ navigate }: { navigate: any }) => {
  const [active, setActive] = useState(false);

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
      onClick={() => navigate('/catalog/robux')}
    >
      {/* 
          ESTRUCTURA EXACTA TILT-BUTTON:
          Base (Side Wall) + Cara (Face) elevada
      */}

      {/* Side Wall (Grosor lateral) */}
      <div 
        className="absolute inset-0 rounded-[32px] bg-blue-800 shadow-[0_4px_0_rgba(0,0,0,0.2)]"
        style={{ height: '100%' }}
      />
      
      {/* Face (Cara principal elevada) */}
      <div 
        className={`relative w-full h-full rounded-[32px] transition-all duration-150 border-[3px] border-white/20
          ${active ? 'translate-y-[-4px]' : 'translate-y-[-14px] hover:translate-y-[-16px]'}
        `}
        style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Contenido del Banner */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.1] pointer-events-none pr-4">
          <img src="/images/robux-logo.svg" className="w-56 h-56 object-contain brightness-0 invert" alt="" />
        </div>

        <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-5">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">Robux</h1>
              <p className="text-white/80 text-sm md:text-[15px] max-w-md leading-relaxed hidden md:block">
                Compra robux al mejor precio del mercado.<br />
                Entrega rápida, segura y garantizada.
              </p>
              <p className="text-white/80 text-sm leading-relaxed md:hidden">Mejor precio, entrega rápida y garantizada.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 bg-black/20 rounded-full text-[10px] md:text-xs font-bold text-white/90">
                <Shield size={14} className="text-emerald-400" />
                Mejor precio
              </div>
              <div className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 bg-black/20 rounded-full text-[10px] md:text-xs font-bold text-white/90">
                <Zap size={14} className="text-amber-400" />
                Entrega rápida
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
            <div className="hidden md:block text-right mb-1">
              <span className="text-white/70 text-sm font-medium uppercase tracking-widest text-[10px]">Desde</span>
              <p className="text-white font-black text-2xl">S/28.00</p>
            </div>
            <button
              className="h-11 md:h-12 px-8 bg-white text-blue-700 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all uppercase tracking-wide text-[13px] w-full md:w-auto shadow-lg"
            >
              COMPRAR ROBUX <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [featuredSections, setFeaturedSections] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [activeCurrency, setActiveCurrency] = useState('PEN');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [otherGameSearch, setOtherGameSearch] = useState('');
  const [showOtherGameSearch, setShowOtherGameSearch] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const [gamesRes, prodsRes, curRes, mm2Res, limitedsRes] = await Promise.all([
          StoreAPI.getGamesConfig(),
          StoreAPI.getProducts(),
          StoreAPI.getCurrenciesConfig(),
          fetch(`${SERVER_URL}/api/products/mm2`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
          fetch(`${SERVER_URL}/api/products/limiteds`).then(r => r.json()).catch(() => ({ success: false, data: [] }))
        ]);

        if (gamesRes.success) setGames(gamesRes.data);
        if (curRes.success) setCurrencies(curRes.data);

        const prodsData = Array.isArray(prodsRes) ? prodsRes : (prodsRes.success ? prodsRes.data : []);
        setProducts(prodsData);

        // Build sections ONLY for MM2 and Limiteds
        const specialSections = [];

        // MM2 Section (limit to 8 items)
        if (mm2Res.success && mm2Res.data && mm2Res.data.length > 0) {
          specialSections.push({
            id: 'murder-mystery-2',
            title: 'Murder Mystery 2',
            subtitle: 'Armas y Skins legendarias',
            icon: 'Crosshair',
            image: '',
            items: mm2Res.data.slice(0, 8).map((p: any) => ({
              ...p,
              image: p.image ? (p.image.startsWith('http') ? p.image : `${SERVER_URL}${p.image}`) : '',
              status: 'En stock',
              color: '#ef4444',
              rarity: p.rarity || 'Godly',
              gameId: 'murder-mystery-2'
            }))
          });
        }

        // Limiteds Section (limit to 8 items)
        if (limitedsRes.success && limitedsRes.data && limitedsRes.data.length > 0) {
          specialSections.push({
            id: 'limiteds',
            title: 'Limiteds',
            subtitle: 'Items limitados de Roblox',
            icon: 'Crown',
            image: '',
            items: limitedsRes.data.slice(0, 8).map((p: any) => ({
              ...p,
              image: p.image ? (p.image.startsWith('http') ? p.image : `${SERVER_URL}${p.image}`) : '',
              status: 'En stock',
              color: '#a855f7',
              rarity: p.rarity || 'Limited',
              gameId: 'limiteds'
            }))
          });
        }

        setFeaturedSections(specialSections);

        // Scroll to game if parameter exists
        const params = new URLSearchParams(location.search);
        const gameId = params.get('game');
        if (gameId) {
          setTimeout(() => {
            const el = document.getElementById(`section-${gameId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        setIsLoading(false);
      }
    };
    fetchCatalogData();
  }, [location.search]);

  const convertPrice = (usdPrice: number) => {
    const currency = currencies.find(c => c.code === activeCurrency);
    if (!currency) return usdPrice;
    return usdPrice * currency.rate;
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase());
    if (search) return matchesSearch;
    return matchesSearch && !game.hidden;
  });

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollSection = (id: string, direction: 'left' | 'right') => {
    const el = sectionRefs.current[id];
    if (el) {
      const scrollAmount = 300;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const check = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
      }
    };
    check();
    const el = carouselRef.current;
    if (el) {
      el.addEventListener('scroll', check);
      return () => el.removeEventListener('scroll', check);
    }
  }, [games, search]);

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen pt-32 px-4 selection:bg-blue-500/30 relative"
    >
      {/* Corner Overlays */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-br from-[#090971]/50 via-[#000041]/35 via-30% to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-bl from-[#090971]/55 via-[#000041]/40 via-30% to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/45 via-[#000041]/30 via-30% to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-tl from-[#090971]/50 via-[#000041]/35 via-30% to-transparent" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1140px] mx-auto relative z-10"
      >

        {/* Robux Banner Hero - Exact Tilt-Button Implementation */}
        <motion.div variants={itemVariants} className="relative mb-14 group perspective-1000">
          <BannerTilt navigate={navigate} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />
          {/* Section Header: In-Game Items + Currency Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/15">
                <Gamepad2 className="text-indigo-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">In-Game Items</h2>
                <p className="text-white/50 text-sm">Buy items, fruits, gamepasses and more</p>
              </div>
            </div>

          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {/* Search Bar + Nav Arrows in same row */}
          <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search a game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
            />
          </div>
          {!isExpanded && !search && (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button onClick={() => scroll('left')} disabled={!canScrollLeft} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${canScrollLeft ? 'bg-white/[0.08] border-white/[0.08] text-white/80 hover:bg-white/[0.14] hover:text-white' : 'bg-white/[0.03] border-white/[0.04] text-white/15 cursor-not-allowed'}`}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scroll('right')} disabled={!canScrollRight} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${canScrollRight ? 'bg-white/[0.08] border-white/[0.08] text-white/80 hover:bg-white/[0.14] hover:text-white' : 'bg-white/[0.03] border-white/[0.04] text-white/15 cursor-not-allowed'}`}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {/* Games Section */}
          <div className="relative mb-20">
          <div
            ref={carouselRef}
            className={`${isExpanded || search ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 select-none'}`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              cursor: isExpanded || search ? 'default' : 'grab',
              willChange: 'scroll-position',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden' as const,
              perspective: 1000
            }}
            onMouseDown={(e) => {
              if (isExpanded || search) return;
              e.preventDefault();
              const slider = e.currentTarget;
              let isDown = true;
              let animationId: number;
              slider.style.cursor = 'grabbing';
              slider.setAttribute('data-dragging', 'false');
              
              const startX = e.pageX - slider.offsetLeft;
              const scrollLeft = slider.scrollLeft;
              let currentX = startX;
              
              const animate = () => {
                if (!isDown) return;
                const x = currentX;
                const walk = (x - startX) * 1.2;
                slider.scrollLeft = scrollLeft - walk;
                animationId = requestAnimationFrame(animate);
              };
              
              const onMouseMove = (e: MouseEvent) => {
                if (!isDown) return;
                e.preventDefault();
                currentX = e.pageX - slider.offsetLeft;
                if (Math.abs(currentX - startX) > 5) {
                  slider.setAttribute('data-dragging', 'true');
                }
              };
              
              const onMouseUp = () => {
                isDown = false;
                slider.style.cursor = 'grab';
                if (animationId) cancelAnimationFrame(animationId);
                setTimeout(() => slider.setAttribute('data-dragging', 'false'), 50);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mouseleave', onMouseLeave);
              };
              
              const onMouseLeave = () => {
                isDown = false;
                slider.style.cursor = 'grab';
                if (animationId) cancelAnimationFrame(animationId);
                setTimeout(() => slider.setAttribute('data-dragging', 'false'), 50);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mouseleave', onMouseLeave);
              };
              
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
              document.addEventListener('mouseleave', onMouseLeave);
              animationId = requestAnimationFrame(animate);
            }}
          >
            <div data-card className={`${isExpanded || search ? '' : 'flex-shrink-0 snap-start w-[140px] sm:w-[260px]'} relative group`}>
              <div className="absolute -inset-1 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none bg-white/[0.04]" />
              <div className="relative overflow-hidden rounded-2xl bg-[#0F1419] border border-dashed border-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300 h-full flex flex-col min-h-[140px] sm:min-h-[160px]">
                {!showOtherGameSearch ? (
                  <div className="flex flex-col h-full cursor-pointer" onClick={() => setShowOtherGameSearch(true)}>
                    <div className="relative aspect-square overflow-hidden flex items-center justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 md:w-16 h-10 md:h-16 rounded-xl md:rounded-2xl bg-white/[0.04] border border-dashed border-white/[0.1] flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all">
                          <Plus className="w-5 md:w-7 h-5 md:h-7 text-white/20 group-hover:text-white/50" />
                        </div>
                        <span className="text-white/20 text-[10px] md:text-[11px] font-medium uppercase tracking-wider">Search</span>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 mt-auto">
                      <h3 className="text-white/50 font-bold text-xs md:text-[15px] truncate uppercase">Other game</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-white/25 text-[10px] md:text-xs">Any Roblox game</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full p-3 sm:p-4">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Buscar juego..."
                        className="w-full h-9 pl-9 pr-8 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        value={otherGameSearch}
                        onChange={(e) => setOtherGameSearch(e.target.value)}
                      />
                      {otherGameSearch && (
                        <button onClick={() => setOtherGameSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                          <Plus className="rotate-45" size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 max-h-[200px]">
                      <AnimatePresence mode="popLayout">
                        {otherGameSearch.length < 2 ? (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-[10px] text-white/20 text-center py-10 uppercase font-bold tracking-widest"
                          >
                            Escribe al menos 2 letras<br />para buscar
                          </motion.p>
                        ) : games.filter(g => g.hidden && g.name.toLowerCase().includes(otherGameSearch.toLowerCase())).length === 0 ? (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-[10px] text-white/20 text-center py-10 uppercase font-bold tracking-widest"
                          >
                            No encontrado
                          </motion.p>
                        ) : (
                          games
                            .filter(g => g.hidden && g.name.toLowerCase().includes(otherGameSearch.toLowerCase()))
                            .map((g, idx) => (
                              <motion.div
                                key={g.id}
                                layout
                                initial={{ opacity: 0, y: -15, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 15,
                                  mass: 0.8,
                                  delay: idx * 0.05
                                }}
                                onClick={() => navigate(`/catalog/ingame/${g.id}?add_game=1`)}
                                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-pointer group/item"
                              >
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                  <img src={g.image ? (g.image.startsWith('http') ? g.image : `${SERVER_URL}${g.image}`) : ''} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-white truncate">{g.name}</p>
                                  <p className="text-[9px] text-white/30 uppercase">Roblox</p>
                                </div>
                                <Plus size={14} className="text-white/20 group-hover/item:text-blue-500 transition-colors" />
                              </motion.div>
                            ))
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => { setShowOtherGameSearch(false); setOtherGameSearch(''); }}
                      className="mt-3 py-2 text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {filteredGames.map((game) => {
              const formattedImage = game.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : '';
              return (
                <div key={game.id} data-card onClick={(e) => {
                  const slider = e.currentTarget.parentElement;
                  if (slider?.getAttribute('data-dragging') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  navigate(`/catalog/ingame/${game.id}`);
                }} className={`${isExpanded || search ? '' : 'flex-shrink-0 snap-start w-[140px] sm:w-[260px]'} relative group cursor-pointer`}>
                  <div className="absolute -inset-1 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none" style={{ background: `radial-gradient(circle, ${game.color}30 0%, transparent 70%)` }} />
                  <div className="relative overflow-hidden rounded-2xl bg-pixel-panel border border-white/[0.06] group-hover:border-white/[0.15] transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden" style={{ background: `linear-gradient(160deg, ${game.color}10 0%, #161530 100%)` }}>
                      <img src={formattedImage} alt={game.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0F1419] to-transparent pointer-events-none" />
                    </div>
                    <div className="p-3 md:p-4 mt-auto">
                      <h3 className="text-white font-bold text-xs md:text-[15px] leading-snug truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{game.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-white/35 text-[10px] md:text-xs font-medium uppercase tracking-tighter">
                          {products.filter(p => p.game === game.id).length} items
                        </span>
                        <div className="flex items-center gap-1 text-white/25 group-hover:text-blue-400/80 transition-colors">
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!search && (
            <div className="mt-8 flex justify-center">
              <button onClick={() => setIsExpanded(!isExpanded)} className="w-full md:w-auto px-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/[0.08] hover:text-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg">
                {isExpanded ? 'View less' : 'View all games'}
                <ChevronRight size={16} className={isExpanded ? '-rotate-90' : ''} />
              </button>
            </div>
          )}
        </div>
        </motion.div>

        <motion.div variants={itemVariants}>
        {/* Featured Sections (From Screenshot) */}
        {!search && isLoading && (
          <div className="space-y-20">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03]"></div>
                  <div>
                    <div className="h-6 w-40 bg-white/[0.03] rounded mb-2"></div>
                    <div className="h-3 w-32 bg-white/[0.03] rounded"></div>
                  </div>
                </div>
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex-shrink-0 w-[300px] sm:w-[330px]">
                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 h-[400px]">
                        <div className="h-4 w-16 bg-white/[0.03] rounded-full mb-4"></div>
                        <div className="aspect-square bg-white/[0.03] rounded-2xl mb-6"></div>
                        <div className="h-4 w-full bg-white/[0.03] rounded mb-4"></div>
                        <div className="h-6 w-24 bg-white/[0.03] rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {!search && !isLoading && featuredSections.map((section) => (
          <div key={section.id} id={`section-${section.id}`} className="mb-20 scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${section.icon === 'Crosshair' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                  {section.icon === 'Crosshair' ? <Crosshair className="text-red-400" size={24} /> : <Crown className="text-yellow-400" size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">{section.title}</h2>
                  <p className="text-white/30 text-xs font-medium">{section.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/catalog/ingame/${section.id}`)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-white/40 text-[10px] font-bold uppercase tracking-wider hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  Ver todo <ChevronRight size={14} />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollSection(section.id, 'left')} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white/60 transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => scrollSection(section.id, 'right')} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white/60 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={(el) => sectionRefs.current[section.id] = el}
              className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-1 px-1 select-none"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                cursor: 'grab',
                willChange: 'scroll-position',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden' as const,
                perspective: 1000
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const slider = e.currentTarget;
                let isDown = true;
                let animationId: number;
                let hasMoved = false;
                slider.style.cursor = 'grabbing';
                slider.setAttribute('data-dragging', 'false');
                
                const startX = e.pageX - slider.offsetLeft;
                const scrollLeft = slider.scrollLeft;
                let currentX = startX;
                
                const animate = () => {
                  if (!isDown) return;
                  const x = currentX;
                  const walk = (x - startX) * 1.2;
                  slider.scrollLeft = scrollLeft - walk;
                  animationId = requestAnimationFrame(animate);
                };
                
                const onMouseMove = (e: MouseEvent) => {
                  if (!isDown) return;
                  e.preventDefault();
                  currentX = e.pageX - slider.offsetLeft;
                  if (Math.abs(currentX - startX) > 5) {
                    hasMoved = true;
                    slider.setAttribute('data-dragging', 'true');
                  }
                };
                
                const onMouseUp = () => {
                  isDown = false;
                  slider.style.cursor = 'grab';
                  if (animationId) cancelAnimationFrame(animationId);
                  setTimeout(() => slider.setAttribute('data-dragging', 'false'), 50);
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                  document.removeEventListener('mouseleave', onMouseLeave);
                };
                
                const onMouseLeave = () => {
                  isDown = false;
                  slider.style.cursor = 'grab';
                  if (animationId) cancelAnimationFrame(animationId);
                  setTimeout(() => slider.setAttribute('data-dragging', 'false'), 50);
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                  document.removeEventListener('mouseleave', onMouseLeave);
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                document.addEventListener('mouseleave', onMouseLeave);
                animationId = requestAnimationFrame(animate);
              }}
            >
              {section.items.map((item: any, idx: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: idx * 0.05 }}
                  onClick={(e) => {
                    const slider = (e.target as HTMLElement).closest('[data-dragging]');
                    if (slider?.getAttribute('data-dragging') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    navigate(`/catalog/ingame/${item.gameId}?game=${item.gameId}`);
                  }}
                  className="flex-shrink-0 snap-start w-[220px] sm:w-[280px] md:w-[330px] group cursor-pointer"
                >
                  <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 sm:p-4 md:p-5 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1] hover:translate-y-[-4px] overflow-hidden flex flex-col">
                    {/* Glow effect */}
                    <div className="absolute -inset-20 bg-gradient-radial from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Header Badges */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-xl border" style={{ color: item.color, borderColor: `${item.color}40`, background: `linear-gradient(135deg, ${item.color}15, ${item.color}08)`, boxShadow: `0 4px 12px ${item.color}20, inset 0 1px 0 ${item.color}30` }}>
                        {item.rarity}
                      </span>
                      <span className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest ${item.status === 'Agotado' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Agotado' ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                        {item.status}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="relative mb-3 sm:mb-4 md:mb-5 group-hover:scale-105 transition-transform duration-700 ease-out z-10 flex items-center justify-center h-[140px] sm:h-[180px] md:h-[220px]">
                      <img src={item.image} className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" alt={item.name} />
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 mt-auto">
                      <h3 className="text-white font-bold text-xs sm:text-sm md:text-base mb-2 sm:mb-3 leading-tight line-clamp-2">{item.name}</h3>
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <p className="text-emerald-400 font-black text-sm sm:text-base md:text-lg">
                          {activeCurrency === 'USD' ? '$' : (activeCurrency === 'PEN' ? 'S/' : '$')}
                          {convertPrice(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <button className="relative px-3 h-7 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 group/btn overflow-hidden"
                          style={{
                            boxShadow: '0 4px 0 0 rgb(29, 78, 216), 0 8px 16px rgba(37, 99, 235, 0.3)',
                            transform: 'translateY(0)',
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(3px)';
                            e.currentTarget.style.boxShadow = '0 1px 0 0 rgb(29, 78, 216), 0 4px 8px rgba(37, 99, 235, 0.2)';
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 0 0 rgb(29, 78, 216), 0 8px 16px rgba(37, 99, 235, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 0 0 rgb(29, 78, 216), 0 8px 16px rgba(37, 99, 235, 0.3)';
                          }}
                        >
                          <span className="relative z-10">Comprar</span>
                          <ChevronRight size={12} className="relative z-10" />
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        </motion.div>
        <div className="h-40" />
      </motion.div>
    </motion.div>
  );
}
