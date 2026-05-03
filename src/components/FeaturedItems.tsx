import React from 'react';
import { Star, ShoppingCart, Sparkles } from 'lucide-react';

const items = [
  { name: "Dominus Aureus", price: "150,000 R$", image: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=400&h=400", rarity: "Legendario", color: "text-yellow-400" },
  { name: "Valkyrie Helm", price: "85,000 R$", image: "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?auto=format&fit=crop&q=80&w=400&h=400", rarity: "Épico", color: "text-pixel-primaryStart" },
  { name: "Korblox Deathspeaker", price: "17,000 R$", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400&h=400", rarity: "Raro", color: "text-green-400" },
];

export default function FeaturedItems() {
  return (
    <section id="items" className="py-24 section-glow bg-pixel-bg">
      {/* Enhanced background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-pixel-primaryStart/5 blur-[160px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pixel-panel border border-pixel-border text-sm font-medium text-pixel-primaryStart mb-4">
              <Sparkles size={16} />
              <span>Catálogo Exclusivo</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black mb-2 tracking-tight">
              OBJETOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primaryEnd to-pixel-accent drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">DESTACADOS</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl">Limitados exclusivos disponibles para compra directa. Entrega segura e instantánea.</p>
          </div>
          <button className="text-xs font-bold text-white hover:text-pixel-primaryStart transition-all flex items-center gap-2 group glass-card px-5 py-2.5 rounded-full border border-white/5 hover:border-pixel-primaryStart/30">
            Ver Todo el Catálogo 
            <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="group relative glass-card rounded-[2rem] overflow-hidden transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(59,91,255,0.2)] border-white/5 hover:border-pixel-primaryStart/40 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden bg-pixel-bg">
                <div className="absolute inset-0 bg-gradient-to-t from-pixel-panel via-transparent to-transparent z-10"></div>
                
                {/* Subtle overlay color that appears on hover */}
                <div className="absolute inset-0 bg-pixel-primaryStart/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay"></div>
                
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                />
                
                {/* Rarity Badge */}
                <div className="absolute top-5 right-5 z-20 bg-pixel-bg/80 backdrop-blur-md border border-pixel-border px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
                  <Star size={14} className={item.color} fill="currentColor" />
                  <span className="text-white">{item.rarity}</span>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="p-8 relative z-20 flex-grow flex flex-col -mt-6">
                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-100 transition-colors">{item.name}</h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-sm transform rotate-12 flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 border-[1.5px] border-white rounded-[2px] transform -rotate-12"></div>
                  </div>
                  <span className="font-black text-xl text-pixel-primaryStart drop-shadow-md">{item.price}</span>
                </div>

                {/* Buy Button */}
                <button className="mt-auto w-full py-4 rounded-xl font-bold transition-all duration-300 bg-pixel-bg text-white border border-pixel-border flex items-center justify-center gap-2 group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(59,91,255,0.4)] overflow-hidden relative">
                  <span className="relative z-10 flex items-center gap-2">
                    <ShoppingCart size={18} className="transform group-hover:-rotate-12 transition-transform" />
                    Comprar Ahora
                  </span>
                  {/* Button hover gradient effect using the new electric blue to violet */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pixel-primaryStart to-pixel-primaryEnd opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
