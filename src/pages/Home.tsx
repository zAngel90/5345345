import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle, 
  Star, 
  Shield, 
  Sword, 
  Crown, 
  ArrowRight, 
  Clock,
  Link2, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  MousePointerClick, 
  CreditCard, 
  Package,
  ChevronDown, 
  MessageCircleQuestion, 
  Truck, 
  ShieldCheck, 
  MessageSquare, 
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Gamepad2,
  Zap
} from 'lucide-react';
import { StoreAPI, ReviewsAPI, SERVER_URL, SiteStatusAPI } from '../services/api';

// ==========================================
// HELPERS & CONSTANTS
// ==========================================

const CATALOG_URL = 'https://54345345.vercel.app/';

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

const stars = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2
}));

const steps = [
  {
    num: "01",
    title: "Elige tu producto",
    desc: "Selecciona la cantidad de Robux o el ítem que necesitas desde nuestro catálogo verificado.",
    icon: MousePointerClick,
    active: true,
    color: "text-[#4D00FF]",
    borderColor: "border-[#4D00FF]/30"
  },
  {
    num: "02",
    title: "Realiza tu pago",
    desc: "Paga de forma segura con los métodos disponibles. Tu transacción está protegida en todo momento.",
    icon: CreditCard,
    active: false,
    color: "text-[#2B00E0]",
    borderColor: "border-[#2B00E0]/30"
  },
  {
    num: "03",
    title: "Recibe tu pedido",
    desc: "Tu entrega llega en minutos con seguimiento en tiempo real en tu cuenta.",
    icon: Package,
    active: false,
    color: "text-[#7B2FFF]",
    borderColor: "border-[#7B2FFF]/30"
  }
];

// ==========================================
// SUB-COMPONENTS
// ==========================================

function Hero() {
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

  const scrollCarousel = (direction: 'left' | 'right') => {
    const step = 340;
    const currentX = x.get();
    updateX(currentX + (direction === 'right' ? -step : step));
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
        navigate(`/catalog/ingame/${item.id}`);
      } else if (item.type === 'product') {
        navigate(`/catalog?search=${encodeURIComponent(item.name)}`);
      } else if (item.type === 'robux') {
        navigate('/catalog/robux');
      } else if (item.type === 'mm2') {
        navigate('/catalog/ingame/mm2');
      } else if (item.type === 'ingame') {
        navigate('/catalog/ingame');
      } else if (item.type === 'fortnite') {
        navigate('/fortnite');
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

      if ('robux'.includes(query)) {
        results.unshift({
          type: 'robux',
          id: 'robux',
          name: 'Robux',
          image: '/images/robux-logo.svg',
          category: 'Moneda'
        });
      }

      if ('mm2'.includes(query) || 'murder mystery'.includes(query)) {
        results.push({
          type: 'mm2',
          id: 'mm2',
          name: 'Murder Mystery 2',
          category: 'Juego'
        });
      }

      if ('ingame'.includes(query) || 'in-game'.includes(query) || 'items in-game'.includes(query)) {
        results.push({
          type: 'ingame',
          id: 'ingame',
          name: 'Items In-Game',
          category: 'Categoría'
        });
      }

      if ('fortnite'.includes(query)) {
        results.push({
          type: 'fortnite',
          id: 'fortnite',
          name: 'Fortnite',
          category: 'Juego'
        });
      }

      setSearchResults(results.slice(0, 6));
    } else {
      const defaultResults: any[] = [
        {
          type: 'robux',
          id: 'robux',
          name: 'Robux',
          image: '/images/robux-logo.svg',
          category: 'Moneda'
        },
        {
          type: 'mm2',
          id: 'mm2',
          name: 'Murder Mystery 2',
          category: 'Juego'
        },
        {
          type: 'ingame',
          id: 'ingame',
          name: 'Items In-Game',
          category: 'Categoría'
        },
        {
          type: 'fortnite',
          id: 'fortnite',
          name: 'Fortnite',
          category: 'Juego'
        },
        ...games.slice(0, 3).map(game => ({
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
          <div className="absolute inset-y-0 -left-20 w-2/5 z-[1] opacity-100 blur-2xl bg-gradient-to-r from-[#090971]/40 via-[#000041]/30 via-50% to-transparent" />
          <div className="absolute inset-y-0 -right-20 w-2/5 z-[1] opacity-100 blur-2xl bg-gradient-to-l from-[#090971]/45 via-[#000041]/35 via-50% to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 z-[1] opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/60 via-[#000041]/45 via-40% to-transparent" />
          <div className="absolute bottom-0 right-0 w-1/3 h-1/2 z-[1] opacity-100 blur-3xl bg-gradient-to-tl from-[#090971]/65 via-[#000041]/50 via-40% to-transparent" />
          <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-[#090971]/10 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 h-[500px] z-[3] pointer-events-none" style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 10%, rgba(0, 0, 0, 0.3) 25%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0.7) 55%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 85%, rgb(0, 0, 0) 100%)'
          }} />

          <div className="hidden md:block absolute inset-0 z-[3] pointer-events-none overflow-hidden">
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

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-32">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-2 text-center text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              Compra Robux, Items
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5 text-center">
              <span className="bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent" style={{ textShadow: '0 2px 12px rgba(59,130,246,0.4)' }}>Fornite al Mejor Precio</span>
            </h2>

            <p className="text-white/90 text-sm md:text-base mb-5 max-w-xl mx-auto text-center leading-relaxed font-medium">
              Entrega rápida, precios bajos y atención 24/7. Paga con
              <br />
              Yape, BCP, Plin, Transferencia y Otros.
            </p>

            <div className="flex items-center gap-0 mb-5 px-8 py-4 bg-white/5 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.12)]">
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

            <div className="w-full max-w-2xl mb-4 relative">
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

              <div
                className={`absolute top-[calc(100%+8px)] left-0 right-0 z-50 backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.12)] transition-all duration-200 ease-out ${
                  isSearchDropdownOpen && searchResults.length > 0
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
                }`}
                style={{
                  background: 'rgb(0, 0, 0)',
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#090971]/10 via-transparent to-transparent pointer-events-none"></div>
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
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition-all text-left group rounded-xl"
                        >
                          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white/5 border border-white/[0.08] shrink-0 group-hover:border-white/20 transition-all flex items-center justify-center">
                            {result.type === 'mm2' && <Sword size={18} className="text-white/60" />}
                            {result.type === 'ingame' && <Gamepad2 size={18} className="text-white/60" />}
                            {result.type === 'fortnite' && <Zap size={18} className="text-white/60" />}
                            {result.type !== 'mm2' && result.type !== 'ingame' && result.type !== 'fortnite' && (
                              <img
                                src={result.image ? (result.image.startsWith('http') ? result.image : `${SERVER_URL}${result.image}`) : '/images/robux-logo.svg'}
                                alt={result.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { 
                                  (e.target as HTMLImageElement).src = '/images/robux-logo.svg'; 
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <p className="text-sm font-bold text-white truncate">{result.name}</p>
                            <p className="text-[11px] font-medium text-white/50 truncate">{result.category}</p>
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

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button 
                onClick={() => navigate('/catalog/robux')}
                className="flex items-center gap-2 px-5 py-3 bg-[#1a3a2e]/30 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-semibold hover:bg-[#1a3a2e]/50 transition-colors shadow-[0_0_10px rgba(255,255,255,0.05),inset_0_1px_1px rgba(255,255,255,0.1)]"
              >
                <img src="/images/robux-logo.svg" className="w-5 h-5 object-contain brightness-0 invert" alt="" />
                Robux
              </button>
              <button 
                onClick={() => navigate('/catalog/ingame')}
                className="flex items-center gap-2 px-5 py-3 bg-[#1e3a5f]/30 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-semibold hover:bg-[#1e3a5f]/50 transition-colors shadow-[0_0_10px rgba(255,255,255,0.05),inset_0_1px_1px rgba(255,255,255,0.1)]"
              >
                <img src="/images/ingame.svg" className="w-5 h-5 brightness-0 invert" alt="" />
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
                Limitados
              </button>
              <button 
                onClick={() => navigate('/fortnite')}
                className="flex items-center justify-center px-6 py-3 bg-[#0d4a6e]/40 backdrop-blur-md border border-white/[0.08] rounded-2xl text-white text-sm font-bold hover:bg-[#0d4a6e]/60 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <FortniteIcon className="w-16 h-5" />
              </button>
            </div>

            <h3 className="text-xs font-semibold text-white/50 tracking-[0.2em] uppercase mb-6">
              Juegos Populares
            </h3>

            <div className="relative w-full max-w-6xl">
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all shadow-lg -ml-4"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="overflow-hidden mx-2">
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
                    onClick={() => navigate(`/catalog/ingame/${game.id}`)}
                    className="min-w-[220px] sm:min-w-[280px] md:min-w-[320px] h-[140px] sm:h-[170px] md:h-[200px] relative rounded-xl md:rounded-2xl overflow-hidden group border border-white/10 flex-shrink-0 shadow-lg cursor-pointer"
                  >
                    <img src={game.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : 'https://via.placeholder.com/260x160'} alt={game.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex justify-between items-end gap-2 md:gap-3 pointer-events-none">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base md:text-lg lg:text-xl leading-tight mb-0.5 md:mb-1 truncate" title={game.name}>{game.name}</h3>
                        <p className="text-gray-300 text-xs md:text-sm lg:text-base truncate">Items In-game</p>
                      </div>
                      <div className="flex-shrink-0 bg-pixel-primaryStart/20 border border-pixel-primaryStart/30 text-white text-[10px] md:text-xs lg:text-sm font-bold px-3 md:px-3 py-1.5 md:py-2 rounded-full whitespace-nowrap backdrop-blur-md">
                        Ver productos
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              </div>
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all shadow-lg -mr-4"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-0 pb-8 md:py-24 -mt-20 relative">
      <div className="absolute top-1/2 -bottom-60 left-0 w-1/3 z-[1] opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/90 via-[#000041]/75 via-35% to-transparent pointer-events-none" />
      <div className="absolute top-1/2 -bottom-60 right-0 w-1/3 z-[1] opacity-100 blur-3xl bg-gradient-to-tl from-[#090971]/95 via-[#000041]/80 via-35% to-transparent pointer-events-none" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
        <div className="flex flex-col mb-6 md:mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-[1.1] tracking-tight">
            <span className="text-[#F3E8D6]">Tu guía para comprar</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primaryEnd to-pixel-accent">de forma segura.</span>
          </h2>
        </div>

        <div className="overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 pb-4 md:pb-0 w-full md:ml-20">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                whileHover={window.innerWidth >= 768 ? { y: -12, scale: 1.02 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="rounded-xl md:rounded-[3rem] p-4 md:p-8 lg:p-10 flex flex-col relative overflow-hidden select-none group/card cursor-pointer w-[75vw] max-w-[280px] md:w-full md:min-w-[400px] min-h-[180px] md:min-h-[280px] border md:transition-all duration-500 bg-gradient-to-br from-[#090971]/70 to-[#000041]/60 backdrop-blur-sm md:backdrop-blur-2xl border-[#090971]/40 md:hover:border-[#090971]/60 flex-shrink-0"
              >
                <div className="hidden md:block absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                <div className="flex justify-between items-start mb-auto relative z-10">
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center text-[10px] md:text-xs font-black tracking-tighter md:transition-all duration-500 md:group-hover/card:scale-110 bg-white text-black">
                    {step.num}
                  </div>
                  <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 md:transition-all duration-500 md:group-hover/card:bg-[#00d4ff]/20 md:group-hover/card:scale-110">
                    <step.icon 
                      size={18}
                      strokeWidth={2} 
                      className="text-white md:w-[22px] md:h-[22px]"
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-4 md:mt-8">
                  <h3 className="text-base md:text-xl font-bold text-white mb-2 md:mb-3 group-hover/card:text-pixel-accent transition-colors duration-300 tracking-tight">{step.title}</h3>
                  <p className="text-[11px] md:text-[13px] leading-relaxed transition-colors duration-300 text-blue-100/70">
                    {step.desc}
                  </p>
                </div>

                <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover/card:opacity-[0.08] transition-all duration-700 group-hover/card:scale-110">
                  <step.icon 
                    className="text-white w-40 h-40" 
                    strokeWidth={1} 
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const TestimonialCard = ({ item }: { item: any }) => (
  <div className="bg-[#0D0B1E]/40 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] w-[320px] md:w-[380px] shrink-0 flex flex-col gap-4 group hover:bg-white/5 hover:border-pixel-accent/30 transition-all duration-300 relative z-[50]">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={item.userAvatar ? (item.userAvatar.startsWith('http') ? item.userAvatar : `${SERVER_URL}${item.userAvatar}`) : `https://ui-avatars.com/api/?name=${item.username}&background=random`}
            alt={item.username}
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-[#0D0B1E]">
            <CheckCircle2 size={10} className="text-white" fill="currentColor" />
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-white text-sm truncate">{item.username}</h4>
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] mt-0.5">
            <Package size={10} className="text-gray-600" />
            <span className="truncate">{item.item || 'Compra de Robux'}</span>
          </div>
        </div>
      </div>
      <div className="flex text-yellow-500 gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={10} fill={i < item.rating ? "currentColor" : "none"} className={i < item.rating ? "" : "text-gray-700"} />
        ))}
      </div>
    </div>

    <p className="text-gray-400 text-sm leading-relaxed whitespace-normal break-words line-clamp-3">
      {item.text}
    </p>
  </div>
);

function Testimonials() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await ReviewsAPI.getReviews();
        if (res.success) {
          setReviews(res.data);
          const total = res.data.length;
          const avg = total > 0 ? res.data.reduce((acc: number, r: any) => acc + r.rating, 0) / total : 5;
          setStats({ average: parseFloat(avg.toFixed(1)), total });
        }
      } catch (err) {
        console.error('Error loading testimonials:', err);
      }
    };
    fetchReviews();
  }, []);

  const half = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, half);
  const row2 = reviews.slice(half);

  const displayRow1 = row1.length > 0 ? [...row1, ...row1, ...row1] : [];
  const displayRow2 = row2.length > 0 ? [...row2, ...row2, ...row2] : [];

  if (reviews.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 relative z-10">
      <div className="absolute inset-0 z-[-1]">
        <div className="absolute -top-40 -bottom-40 left-0 w-1/3 opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/95 via-[#000041]/85 via-30% to-transparent pointer-events-none" />
        <div className="absolute -top-40 -bottom-40 right-0 w-1/3 opacity-100 blur-3xl bg-gradient-to-tl from-[#090971] via-[#000041]/95 via-25% to-transparent pointer-events-none" />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-display font-black mb-4 text-white">
          Miles confían en <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primaryEnd to-pixel-accent">Pixel Store</span>
        </h2>

        <div className="flex flex-col items-center gap-2">
          <div className="flex text-yellow-500 gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < Math.floor(stats.average) ? "currentColor" : "none"} className={i < Math.floor(stats.average) ? "" : "text-gray-700"} />
            ))}
          </div>
          <p className="text-gray-400 text-sm font-medium">
            <span className="text-white font-bold">{stats.average}</span> — {stats.total} reseñas
          </p>
        </div>
      </div>

      <div className="relative flex flex-col gap-8 py-4 overflow-hidden z-[30] isolate">
        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex gap-6 px-6 cursor-grab active:cursor-grabbing"
            animate={{ x: [0, -1000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 50,
                ease: "linear",
              },
            }}
            whileHover={{ animationPlayState: 'paused' }}
            style={{ width: "fit-content" }}
          >
            {displayRow1.map((item, index) => (
              <div key={`r1-${index}`} className="shrink-0">
                <TestimonialCard item={item} />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex gap-6 px-6 cursor-grab active:cursor-grabbing"
            initial={{ x: -1000 }}
            animate={{ x: [-1000, 0] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 55,
                ease: "linear",
              },
            }}
            whileHover={{ animationPlayState: 'paused' }}
            style={{ width: "fit-content" }}
          >
            {displayRow2.map((item, index) => (
              <div key={`r2-${index}`} className="shrink-0">
                <TestimonialCard item={item} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link
          to="/reviews"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pixel-accent transition-colors text-sm font-medium group"
        >
          Lo que dicen de nosotros ({stats.total})
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    Promise.all([
      StoreAPI.getFaqs(),
      StoreAPI.getSocialLinks()
    ]).then(([faqsRes, linksRes]) => {
      if (faqsRes.success && faqsRes.data.length > 0) setFaqs(faqsRes.data);
      if (linksRes.success && linksRes.data?.whatsapp?.url) setWhatsappUrl(linksRes.data.whatsapp.url);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="faq" className="pt-0 pb-24 md:pt-10 md:pb-40 relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-80 h-[70%] left-0 w-1/3 opacity-100 blur-3xl bg-gradient-to-br from-[#090971] via-[#000041]/90 via-30% to-transparent" />
        <div className="absolute -top-80 h-[70%] right-0 w-1/3 opacity-100 blur-3xl bg-gradient-to-bl from-[#090971] via-[#000041]/95 via-30% to-transparent" />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#0D0B1E]/40 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 lg:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-pixel-accent/20 blur-[80px] rounded-full pointer-events-none z-0" />
          <div className="absolute inset-0 pattern-gaming opacity-20 pointer-events-none blur-[1.5px]"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pixel-panel border border-white/5 text-[10px] font-black tracking-widest text-pixel-accent mb-6 uppercase w-max">
                <span>Tus dudas, resueltas</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-4 leading-tight relative">
                Preguntas<br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primaryEnd to-pixel-accent drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">frecuentes</span>
                  <svg className="absolute -bottom-4 left-0 w-full h-4 text-pixel-accent/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              
              <p className="text-gray-400 text-base mb-8 max-w-md">
                ¿Más dudas? Escríbenos por WhatsApp y te ayudamos al instante.
              </p>

              <div className="bg-pixel-panel/40 border border-white/10 rounded-[2rem] p-5 max-w-[320px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">¿Dudas?</h3>
                    <p className="text-gray-400 text-[10px]">Escríbenos ahora mismo</p>
                  </div>
                </div>
                
                <a 
                  href={whatsappUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  WhatsApp
                </a>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60&h=60" className="w-9 h-9 rounded-full border-2 border-pixel-bg object-cover" alt="User" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60&h=60" className="w-9 h-9 rounded-full border-2 border-pixel-bg object-cover" alt="User" />
                  <div className="w-9 h-9 rounded-full border-2 border-pixel-bg bg-pixel-panel flex items-center justify-center text-[10px] font-bold text-white">AN</div>
                </div>
                <p className="text-xs text-gray-400">
                  <span className="text-white font-black">+100.000</span> pedidos entregados
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-white/30" size={24} />
                </div>
              ) : faqs.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-12">No hay preguntas frecuentes disponibles.</p>
              ) : (
                faqs.map((faq, index) => (
                  <div 
                    key={faq.id || index}
                    className={`rounded-[2rem] transition-all duration-500 border ${
                      openIndex === index 
                        ? 'bg-pixel-primaryStart/10 border-pixel-primaryEnd/40 shadow-[0_20px_50px_rgba(20,0,172,0.15)]' 
                        : 'bg-pixel-panel/30 border-white/5 hover:bg-pixel-panel/50 hover:border-white/10'
                    }`}
                  >
                    <button 
                      className="w-full px-6 py-5 flex items-center gap-4 text-left focus:outline-none"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
                        openIndex === index ? 'bg-pixel-primaryEnd text-white' : 'bg-white/5 text-gray-500'
                      }`}>
                        <ChevronDown size={20} />
                      </div>
                      <span className={`flex-1 font-bold text-base sm:text-lg transition-colors duration-500 ${openIndex === index ? 'text-white' : 'text-gray-300'}`}>
                        {faq.question}
                      </span>
                      <ChevronDown 
                        className={`transition-all duration-500 shrink-0 ${openIndex === index ? 'rotate-180 text-pixel-accent' : 'text-gray-600'}`} 
                        size={20} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-8 pb-8 pt-0 ml-14">
                            <div 
                              className="text-gray-400 text-sm sm:text-base leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// MAIN HOME EXPORT
// ==========================================

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [siteStatus, setSiteStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    const loadSiteStatus = async () => {
      try {
        const res = await SiteStatusAPI.getSiteStatus();
        if (res.success) {
          setSiteStatus(res.data.siteStatus || 'online');
        }
      } catch (error) {
        setSiteStatus('online');
      }
    };
    loadSiteStatus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-hidden"
    >
      <Hero />
      
      {heroLoaded && (
        <div className="flex flex-col gap-0">
          <div>
            <HowItWorks />
          </div>

          <div>
            <Testimonials />
          </div>

          <div>
            <FAQ />
          </div>
        </div>
      )}

      {/* Site Status LED Indicator - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md" style={{
        backgroundColor: siteStatus === 'online' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderColor: siteStatus === 'online' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
      }}>
        <div className="relative w-2 h-2">
          <div className="absolute inset-0 rounded-full" style={{
            backgroundColor: siteStatus === 'online' ? '#22c55e' : '#ef4444',
            boxShadow: `0 0 8px ${siteStatus === 'online' ? '#22c55e' : '#ef4444'}`
          }} />
          {siteStatus === 'online' && (
            <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: '#22c55e' }} />
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{
          color: siteStatus === 'online' ? '#22c55e' : '#ef4444'
        }}>
          {siteStatus === 'online' ? 'En línea' : 'Desconectado'}
        </span>
      </div>
    </motion.div>
  );
}
