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
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreAPI, SERVER_URL } from '../services/api';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [featuredSections, setFeaturedSections] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [activeCurrency, setActiveCurrency] = useState('PEN');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const [gamesRes, prodsRes, curRes] = await Promise.all([
          StoreAPI.getGamesConfig(),
          StoreAPI.getProducts(),
          StoreAPI.getCurrenciesConfig()
        ]);

        if (gamesRes.success) setGames(gamesRes.data);
        if (curRes.success) setCurrencies(curRes.data);
        
        const prodsData = Array.isArray(prodsRes) ? prodsRes : (prodsRes.success ? prodsRes.data : []);
        setProducts(prodsData);

        // Dynamically build sections from Games
        const dynamicSections = (gamesRes.data || []).map((game: any) => {
          return {
            id: game.id,
            title: game.name,
            subtitle: `Los mejores items de ${game.name}`,
            icon: 'Gamepad2',
            image: game.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : '',
            items: prodsData.filter((p: any) => p.game === game.id).map((p: any) => ({
              ...p,
              image: p.image ? (p.image.startsWith('http') ? p.image : `${SERVER_URL}${p.image}`) : '',
              status: 'En stock',
              color: game.color || '#3B82F6',
              rarity: p.rarity || 'Item',
              gameId: game.id
            }))
          };
        }).filter((section: any) => section.items.length > 0); // Only show games with items
        
        setFeaturedSections(dynamicSections.slice(0, 3));

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

      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
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

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(search.toLowerCase())
  );

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
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-pixel-bg pt-28 px-4 selection:bg-blue-500/30"
    >
      {/* Background Gradients - Simplified to avoid scroll bugs */}
      <div className="fixed inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-radial from-blue-500/10 to-transparent opacity-30" />
      </div>

      <div className="max-w-[1140px] mx-auto relative z-10">
        
        {/* Robux Banner Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/catalog/robux')}
          className="relative group overflow-hidden rounded-3xl mb-10 cursor-pointer transition-all hover:brightness-[1.05]"
          style={{ 
            background: 'linear-gradient(135deg, rgba(20, 0, 172, 0.8) 0%, rgba(37, 99, 235, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 40px -10px rgba(20, 0, 172, 0.3)'
          }}
        >
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none">
            <img src="/images/robux-logo.svg" className="w-64 h-64 object-contain brightness-0 invert" alt="" />
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
                <div className="flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-1.5 bg-white/10 border border-emerald-400/30 rounded-full text-[10px] md:text-xs font-bold text-emerald-300 shadow-lg backdrop-blur-sm transition-all hover:bg-white/20">
                  <Shield size={14} className="shrink-0" />
                  Mejor precio
                </div>
                <div className="flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-1.5 bg-white/10 border border-amber-400/30 rounded-full text-[10px] md:text-xs font-bold text-amber-300 shadow-lg backdrop-blur-sm transition-all hover:bg-white/20">
                  <Zap size={14} className="shrink-0" />
                  Entrega rápida
                </div>
                <div className="flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-1.5 bg-white/10 border border-blue-200/30 rounded-full text-[10px] md:text-xs font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20">
                  <CheckCircle2 size={14} className="shrink-0" />
                  +50 000 ventas
                </div>
              </div>
            </div>
            <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
              <div className="hidden md:block text-right mb-1">
                <span className="text-white/70 text-sm font-medium">Desde <span className="text-white font-bold text-[15px]">S/28.00 PEN</span> / 1000 robux</span>
              </div>
              <button 
                className="h-11 md:h-12 px-8 bg-white text-[#1D4ED8] font-black rounded-full flex items-center justify-center gap-2 hover:bg-white/95 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide text-[13px] w-full md:w-auto"
              >
                COMPRAR ROBUX <span className="tracking-tighter ml-1">{">>"}</span>
              </button>
            </div>
          </div>
        </motion.div>

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

        {/* Games Section */}
        <div className="relative mb-20">
          <div 
            ref={carouselRef}
            className={`${isExpanded || search ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide -mx-1 px-1 snap-x snap-mandatory'}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div data-card className={`${isExpanded || search ? '' : 'flex-shrink-0 snap-start w-[140px] sm:w-[260px]'} relative group cursor-pointer`}>
              <div className="absolute -inset-1 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none bg-white/[0.04]" />
              <div className="relative overflow-hidden rounded-2xl bg-[#0F1419] border border-dashed border-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300 h-full flex flex-col">
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
            </div>

            {filteredGames.map((game) => {
              const formattedImage = game.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : '';
              return (
                <div key={game.id} data-card onClick={() => navigate(`/catalog/ingame/${game.id}`)} className={`${isExpanded || search ? '' : 'flex-shrink-0 snap-start w-[140px] sm:w-[260px]'} relative group cursor-pointer`}>
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

        {/* Featured Sections (From Screenshot) */}
        {!search && featuredSections.map((section) => (
          <div key={section.id} id={`section-${section.id}`} className="mb-20 scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                  {section.icon === 'Sword' ? <Sword className="text-blue-400" size={24} /> : <Star className="text-amber-400" size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">{section.title}</h2>
                  <p className="text-white/30 text-xs font-medium">{section.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate(`/catalog/ingame/${section.id}`)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 text-[11px] font-bold uppercase tracking-widest hover:bg-white/[0.06] hover:text-white transition-all"
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
              className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {section.items.map((item: any) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/catalog/ingame/${item.gameId}?game=${item.gameId}`)}
                  className="flex-shrink-0 snap-start w-[240px] sm:w-[270px] group cursor-pointer"
                >
                  <div className="relative rounded-[32px] bg-white/[0.02] border border-white/[0.05] p-5 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1] hover:translate-y-[-4px] overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute -inset-20 bg-gradient-radial from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    {/* Header Badges */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10" style={{ color: item.color, borderColor: `${item.color}30`, background: `${item.color}10` }}>
                        {item.rarity}
                      </span>
                      <span className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest ${item.status === 'Agotado' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Agotado' ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                        {item.status}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-square mb-6 group-hover:scale-105 transition-transform duration-700 ease-out z-10">
                      <img src={item.image} className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" alt={item.name} />
                    </div>

                    {/* Footer */}
                    <div className="relative z-10">
                      <h3 className="text-white font-bold text-sm mb-4 leading-tight">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest mb-0.5">Precio</p>
                          <p className="text-emerald-400 font-black text-sm">
                            {activeCurrency === 'USD' ? '$' : (activeCurrency === 'PEN' ? 'S/' : '$')}
                            {convertPrice(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {activeCurrency}
                          </p>
                        </div>
                        <button className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.95] flex items-center gap-2">
                          Comprar <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="h-40" />
      </div>
    </motion.div>
  );
}
