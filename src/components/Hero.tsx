import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, Star, Shield, Gamepad2, Sword, Crown, Monitor, ArrowRight, Clock } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { StoreAPI, SERVER_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';

const FortniteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1581 441" fill="currentColor">
    <polygon points="1580.5 7.5 1580.5 112.5 1510.5 115.5 1510.5 173.5 1569.5 173.5 1569.5 258.5 1511.5 258.5 1511.5 332.5 1580.5 332.5 1580.5 430.5 1416.5 418.5 1416.5 20.5 1580.5 7.5"/>
    <polygon points="178.5 .5 169 96.5 96.5 96.5 96.5 167 98 168.5 160.5 168.5 158.5 260.5 98 260.5 96.5 262 96.5 423.5 .5 440.5 .5 .5 178.5 .5"/>
    <polygon points="1071.5 21.5 1074.36 389.86 999.61 397.38 935.49 240.51 939.5 384.5 852.5 384.5 852.5 40.5 928.51 25.93 996.49 191.5 983.5 21.5 1071.5 21.5"/>
    <path d="M547,28.5c15.34,1.56,35.79,11.58,47.51,21.49,56.77,47.99,64.11,151.74,5.29,200.99l46.7,145.52-95,8.01-36.02-126-3.99,111.99h-92V28.5h127.5ZM512.5,210.5c18.95-1.78,26.96-23.8,28.05-40.45,1.38-21.27.04-57.99-28.05-59.55v100Z"/>
    <path d="M278.3,27.8c99.15-7.84,124.67,74.92,128.19,157.21,3.29,76.74-2.47,205.98-103.5,213.48-102.52,7.6-124.48-76.71-128.5-160.48-3.78-78.7,1.11-202.09,103.81-210.21ZM293.22,104.79c-7.13-5.88-11.16,5.09-12.64,10.28-5.09,17.81-4.36,37.63-5.03,55.97-1.48,40.23-3.97,93.39,3.27,132.64,3.79,20.53,13.74,33.11,20.22,4.85,5.86-25.55,4.23-57.24,4.42-83.58s1.36-54.97-.97-81.95c-.69-7.97-3.46-33.43-9.27-38.21Z"/>
    <polygon points="1404.5 46.5 1404.5 139.5 1350.5 139.5 1350.5 412.5 1255.5 412.5 1255.5 149.5 1203.5 149.5 1203.5 56.5 1404.5 46.5"/>
    <polygon points="841.5 44.5 841.5 137.5 788.5 137.5 788.5 388.5 693.5 388.5 693.5 121.5 643.5 121.5 643.5 28.5 841.5 44.5"/>
    <rect x="1094.5" y="38.5" width="98" height="363"/>
  </svg>
);

// Generate random stars outside component to prevent regeneration
const stars = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2
}));

export default function Hero() {
  const [games, setGames] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allGames, setAllGames] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const springX = useSpring(x, isMobile ? {
    stiffness: 300,
    damping: 30,
    mass: 0.5
  } : {
    stiffness: 600,
    damping: 50,
    mass: 0.3,
    restDelta: 0.001,
    restSpeed: 0.001
  });

  const updateX = (newX: number) => {
    if (!carouselRef.current) return;
    const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
    const clampedX = Math.max(-maxScroll, Math.min(0, newX));
    x.set(clampedX);
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const [popRes, prodRes, gamesRes] = await Promise.all([
          StoreAPI.getHomePopularCategories(),
          StoreAPI.getProducts(),
          StoreAPI.getGamesConfig()
        ]);

        if (popRes.success && gamesRes.success) {
          const config = popRes.data;
          const productsData = Array.isArray(prodRes) ? prodRes : (prodRes.success ? prodRes.data : []);
          const gamesData = gamesRes.data || [];

          // Guardar para búsqueda
          setAllGames(gamesData);
          setAllProducts(productsData);

          if (config && config.length > 0) {
            const mapped = config.map((item: any) => {
              const gId = item.gameId || item.categoryId;
              const game = gamesData.find((g: any) => g.id === gId);
              const productCount = productsData.filter((p: any) => p.game === gId).length;
              
              return {
                name: game?.name || 'Juego',
                subtitle: 'Items In-game',
                products: `${productCount} productos`,
                image: item.customImage ? (item.customImage.startsWith('http') ? item.customImage : `${SERVER_URL}${item.customImage}`) : (game?.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : ''),
                id: gId
              };
            });
            setGames(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching games:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Horizontal scroll with mouse wheel
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        const currentX = x.get();
        updateX(currentX - e.deltaY);
      }
    };
    
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [games]);

  const handleSearch = (item?: any) => {
    if (item) {
      if (item.type === 'game') {
        navigate(`/catalog?game=${item.id}`);
      } else if (item.type === 'product') {
        navigate(`/catalog?search=${encodeURIComponent(item.name)}`);
      } else if (item.type === 'robux') {
        navigate('/robux');
      }
      setSearchQuery('');
      setIsSearchDropdownOpen(false);
    } else if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const results: any[] = [];

      // Buscar en juegos
      allGames.forEach(game => {
        if (game.name.toLowerCase().includes(query)) {
          results.push({
            type: 'game',
            id: game.id,
            name: game.name,
            image: game.image,
            category: 'Juego'
          });
        }
      });

      // Buscar en productos
      allProducts.slice(0, 5).forEach(product => {
        if (product.name.toLowerCase().includes(query)) {
          results.push({
            type: 'product',
            id: product.id,
            name: product.name,
            image: product.image,
            category: 'Producto'
          });
        }
      });

      // Agregar Robux si coincide
      if ('robux'.includes(query)) {
        results.unshift({
          type: 'robux',
          id: 'robux',
          name: 'Robux',
          image: '/images/robux-logo.svg',
          category: 'Moneda'
        });
      }

      setSearchResults(results.slice(0, 6));
    } else {
      // Mostrar resultados por defecto (juegos populares + Robux)
      const defaultResults: any[] = [
        {
          type: 'robux',
          id: 'robux',
          name: 'Robux',
          image: '/images/robux-logo.svg',
          category: 'Moneda'
        },
        ...games.slice(0, 5).map(game => ({
          type: 'game',
          id: game.id,
          name: game.name,
          image: game.image,
          category: 'Juego'
        }))
      ];
      setSearchResults(defaultResults);
    }
  }, [searchQuery, allGames, allProducts, games]);

  return (
    <>
      {isLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
      {!isLoading && (
    <section className="relative min-h-screen flex flex-col overflow-x-hidden pb-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url('https://i.postimg.cc/wjNMvZfd/wallpaper-PC.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          filter: "blur(3px)"
        }}
      />
      {/* Purple-Blue Aura from Left Side */}
      <div className="absolute inset-y-0 -left-20 w-2/5 z-[1] opacity-100 blur-2xl bg-gradient-to-r from-[#090971]/40 via-[#000041]/30 via-50% to-transparent" />
      {/* Purple-Blue Aura from Right Side */}
      <div className="absolute inset-y-0 -right-20 w-2/5 z-[1] opacity-100 blur-2xl bg-gradient-to-l from-[#090971]/45 via-[#000041]/35 via-50% to-transparent" />
      {/* Corner Overlays - Bottom Left */}
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 z-[1] opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/60 via-[#000041]/45 via-40% to-transparent" />
      {/* Corner Overlays - Bottom Right */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 z-[1] opacity-100 blur-3xl bg-gradient-to-tl from-[#090971]/65 via-[#000041]/50 via-40% to-transparent" />
      {/* Overlay gradient */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-[#090971]/10 to-transparent" />
      
      {/* Bottom fade to background color - Smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] z-[3] pointer-events-none" style={{
        background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 10%, rgba(0, 0, 0, 0.3) 25%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0.7) 55%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 85%, rgb(0, 0, 0) 100%)'
      }} />

      {/* Animated Stars - Desktop only */}
      <div className="hidden md:block absolute inset-0 z-[3] pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-20">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-2 text-center text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          Compra Robux, Items
        </h1>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-center">
          <span className="bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent" style={{ textShadow: '0 2px 12px rgba(59,130,246,0.4)' }}>Fornite al Mejor Precio</span>
        </h2>

        {/* Subtitle */}
        <p className="text-white/90 text-sm md:text-base mb-6 max-w-xl mx-auto text-center leading-relaxed font-medium">
          Entrega rápida, precios bajos y atención 24/7. Paga con
          <br />
          Yape, BCP, Plin, Transferencia y Otros.
        </p>

        {/* Stats Box */}
        <div className="flex items-center gap-0 mb-6 px-8 py-4 bg-white/5 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.12)]">
          <div className="flex items-center gap-2 px-4">
            <CheckCircle className="w-5 h-5 text-[#00d4aa]" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">+100K</span>
              <span className="text-white/60 text-xs">Pedidos</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-2 px-4">
            <Star className="w-5 h-5 text-[#ffcc00] fill-[#ffcc00]" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">4.9</span>
              <span className="text-white/60 text-xs">1000 Reseñas</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-2 px-4">
            <Shield className="w-5 h-5 text-[#00d4aa]" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">100%</span>
              <span className="text-white/60 text-xs">Garantía</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-5 relative">
          <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.12)] overflow-hidden">
            <div className="flex items-center gap-3 flex-1 px-5 py-3.5">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Buscar Robux, Limites, Mm2, Items In-Game y Fornite ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 150)}
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm"
              />
            </div>
            <button 
              onClick={() => handleSearch()}
              className="px-6 py-3.5 bg-[#0099ff] text-white font-semibold hover:bg-[#0088ee] transition-colors text-sm rounded-xl m-1"
            >
              Buscar
            </button>
          </div>

          {/* Dropdown de resultados */}
          <div
            className={`absolute top-[calc(100%+8px)] left-0 right-0 z-50 backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden origin-top transition-all duration-[400ms] shadow-[0_0_15px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.12)] ${
              isSearchDropdownOpen && searchResults.length > 0
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
            }`}
            style={{
              background: 'rgba(0, 0, 0, 0.98)',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              backdropFilter: 'blur(12px)',
              animation: isSearchDropdownOpen ? 'containerVibrate 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none',
              animationDelay: '0.15s'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#090971]/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <Search size={13} className="text-white/60" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{searchQuery.trim() ? 'Resultados' : 'Sugerencias'}</span>
            </div>
            
            <div className="max-h-[280px] overflow-y-auto scrollbar-hide">
              {searchResults.map((result: any, idx: number) => (
                <React.Fragment key={result.id}>
                  <button
                    onClick={() => handleSearch(result)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition-all text-left group rounded-xl ${
                      isSearchDropdownOpen ? 'animate-[itemSlideIn_1.1s_cubic-bezier(0.22,1,0.36,1)_both]' : ''
                    }`}
                    style={{
                      animationDelay: '0.08s'
                    }}
                  >
                    <div className={`w-10 h-10 rounded-2xl overflow-hidden bg-blue-500/10 border border-blue-500/20 shrink-0 group-hover:border-blue-500/40 transition-all ${
                      isSearchDropdownOpen ? 'animate-[avatarAppear_1.1s_cubic-bezier(0.22,1,0.36,1)_forwards]' : ''
                    }`}
                    style={{
                      animationDelay: '0.08s'
                    }}>
                      <img
                        src={result.image ? (result.image.startsWith('http') ? result.image : `${SERVER_URL}${result.image}`) : '/images/robux-logo.svg'}
                        alt={result.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                          (e.target as HTMLImageElement).src = '/images/robux-logo.svg'; 
                        }}
                      />
                    </div>
                    <div className={`flex-1 min-w-0 flex flex-col gap-1.5 ${
                      isSearchDropdownOpen ? 'animate-[textTurbulence_1.1s_cubic-bezier(0.22,1,0.36,1)_forwards]' : ''
                    }`}
                    style={{
                      animationDelay: '0.08s'
                    }}>
                      <div className="bg-white px-2 py-1 rounded-lg w-fit max-w-full">
                        <p className="text-xs font-bold text-black truncate">{result.name}</p>
                      </div>
                      <div className="bg-white/80 px-2 py-0.5 rounded-md w-fit">
                        <p className="text-[10px] font-semibold text-black/70 truncate">{result.category}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-white/10 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                  {idx < searchResults.length - 1 && (
                    <div className="border-t border-white/[0.04]" />
                  )}
                </React.Fragment>
              ))}
            </div>
            </div>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            onClick={() => navigate('/catalog/robux')}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a3a2e]/30 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-semibold hover:bg-[#1a3a2e]/50 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <Gamepad2 className="w-5 h-5" />
            Robux
          </button>
          <button 
            onClick={() => navigate('/catalog/ingame')}
            className="flex items-center gap-2 px-5 py-3 bg-[#1e3a5f]/30 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-semibold hover:bg-[#1e3a5f]/50 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <Monitor className="w-5 h-5" />
            Items In-Game
          </button>
          <button 
            onClick={() => navigate('/catalog/ingame/mm2')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#dc2626]/40 to-[#991b1b]/40 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-semibold hover:from-[#dc2626]/60 hover:to-[#991b1b]/60 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <Sword className="w-5 h-5" />
            MM2
          </button>
          <button 
            onClick={() => navigate('/catalog/ingame/limiteds')}
            className="flex items-center gap-2 px-5 py-3 bg-[#4a4a2e]/30 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-semibold hover:bg-[#4a4a2e]/50 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <Crown className="w-5 h-5" />
            Limiteds
          </button>
          <button 
            onClick={() => navigate('/fortnite')}
            className="flex items-center justify-center px-6 py-3 bg-[#0d4a6e]/40 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-bold hover:bg-[#0d4a6e]/60 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <FortniteIcon className="w-16 h-5" />
          </button>
        </div>

        {/* Catalog Title */}
        <h3 className="text-xs font-semibold text-white/50 tracking-[0.2em] uppercase mb-4">
          Juegos Populares
        </h3>

        {/* Game Cards Carousel - Compact Row */}
        <div className="w-full max-w-5xl overflow-hidden">
          <motion.div 
            ref={carouselRef}
            drag="x"
            dragConstraints={{ left: -(carouselRef.current?.scrollWidth || 0) + (carouselRef.current?.clientWidth || 0), right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
            style={{ x: springX }}
            className="flex gap-3 pb-2 cursor-grab active:cursor-grabbing"
          >
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => navigate(`/catalog?game=${game.id}`)}
                className="min-w-[180px] sm:min-w-[220px] md:min-w-[260px] h-[120px] sm:h-[140px] md:h-[160px] relative rounded-xl md:rounded-2xl overflow-hidden group border border-white/10 flex-shrink-0 shadow-lg cursor-pointer"
              >
                <img src={game.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : 'https://via.placeholder.com/260x160'} alt={game.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 flex justify-between items-end gap-2 md:gap-3 pointer-events-none">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm md:text-base lg:text-lg leading-tight mb-0.5 md:mb-1 truncate" title={game.name}>{game.name}</h3>
                    <p className="text-gray-300 text-[10px] md:text-xs lg:text-sm truncate">Items In-game</p>
                  </div>
                  <div className="flex-shrink-0 bg-pixel-primaryStart/20 border border-pixel-primaryStart/30 text-white text-[9px] md:text-[10px] lg:text-xs font-bold px-2 md:px-2.5 py-1 md:py-1.5 rounded-full whitespace-nowrap backdrop-blur-md">
                    Ver productos
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
      )}
    </>
  );
}
