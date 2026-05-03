import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { StoreAPI, SERVER_URL } from '../services/api';
import { Link } from 'react-router-dom';

export default function PopularGames() {
  const [featuredGames, setFeaturedGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const springX = useSpring(x, {
    stiffness: 400,
    damping: 40,
    mass: 0.5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popRes, prodRes, gamesRes] = await Promise.all([
          StoreAPI.getHomePopularCategories(),
          StoreAPI.getProducts(),
          StoreAPI.getGamesConfig()
        ]);

        const productsData = Array.isArray(prodRes) ? prodRes : (prodRes.success ? prodRes.data : []);

        if (popRes.success && gamesRes.success) {
          const config = popRes.data;
          const allProducts = productsData;
          const allGames = gamesRes.data || [];

          if (config && config.length > 0) {
            const mapped = config.map((item: any) => {
              const gId = item.gameId || item.categoryId;
              const game = allGames.find((g: any) => g.id === gId);
              const productCount = allProducts.filter((p: any) => p.game === gId).length;
              
              return {
                title: game?.name || 'Juego',
                subtitle: 'Items In-game',
                products: `${productCount} productos`,
                image: item.customImage ? (item.customImage.startsWith('http') ? item.customImage : `${SERVER_URL}${item.customImage}`) : (game?.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : ''),
                id: gId
              };
            });
            setFeaturedGames(mapped);
          } else {
            // Use first 6 games as fallback instead of mock data
            const fallback = allGames.slice(0, 6).map((game: any) => {
              const productCount = allProducts.filter((p: any) => p.game === game.id).length;
              return {
                title: game.name,
                subtitle: 'Items In-game',
                products: `${productCount} productos`,
                image: game.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : '',
                id: game.id
              };
            });
            setFeaturedGames(fallback);
          }
        }
      } catch (err) {
        console.error('Error loading popular games:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateX = (delta: number) => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const contentWidth = contentRef.current?.offsetWidth || 0;
    const maxScroll = Math.max(0, contentWidth - containerWidth + 40);
    const newX = Math.max(-maxScroll, Math.min(0, x.get() - delta));
    x.set(newX);
  };

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        updateX(e.deltaY * 1.5);
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [featuredGames]);

  const scrollLeft = () => updateX(-400);
  const scrollRight = () => updateX(400);

  if (isLoading) return null;

  return (
    <section id="games" className="py-24 section-glow bg-pixel-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-pixel-primaryStart/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-pixel-panel/60 rounded-[3rem] p-6 sm:p-10 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-7 bg-pixel-primary rounded-full mt-1.5 shadow-[0_0_12px_rgba(20,0,172,0.6)]"></div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-0.5 tracking-tight uppercase">Juegos populares</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Items, frutas y gamepasses</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={scrollLeft} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"><ChevronLeft size={18} /></button>
              <button onClick={scrollRight} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"><ChevronRight size={18} /></button>
              <Link to="/robux" className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-pixel-accent/50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg group">
                Ver todos <span className="text-lg leading-none text-pixel-accent group-hover:translate-x-0.5 transition-transform">&rsaquo;</span>
              </Link>
            </div>
          </div>

          <div className="relative cursor-grab active:cursor-grabbing select-none" ref={containerRef}>
            <motion.div ref={contentRef} className="flex gap-4 w-max pb-2" style={{ x: springX }} drag="x" dragConstraints={containerRef}>
              {featuredGames.map((game, index) => (
                <Link 
                  key={index} 
                  to={`/catalog/ingame/${game.id}`}
                  className="min-w-[220px] sm:min-w-[260px] h-[140px] sm:h-[160px] relative rounded-2xl overflow-hidden group border border-white/10 flex-shrink-0 shadow-lg block"
                >
                  <img src={game.image} alt={game.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end gap-3 pointer-events-none">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base sm:text-lg leading-tight mb-1 truncate" title={game.title}>{game.title}</h3>
                      <p className="text-gray-300 text-xs sm:text-sm truncate">{game.subtitle}</p>
                    </div>
                    <div className="flex-shrink-0 bg-pixel-primaryStart/20 border border-pixel-primaryStart/30 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap backdrop-blur-md">
                      {game.products}
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
