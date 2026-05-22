import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, ChevronLeft, ChevronRight, UserPlus, MousePointerClick, CreditCard, Package } from 'lucide-react';

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

export default function HowItWorks() {
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <section id="how-it-works" className="pt-0 pb-8 md:py-24 -mt-20 relative overflow-hidden">
      {/* Side Overlays - Left (diagonal towards top) */}
      <div className="absolute top-1/2 bottom-0 left-0 w-1/3 z-[1] opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/90 via-[#000041]/75 via-35% to-transparent pointer-events-none" />
      {/* Side Overlays - Right (diagonal towards top) */}
      <div className="absolute top-1/2 bottom-0 right-0 w-1/3 z-[1] opacity-100 blur-3xl bg-gradient-to-tl from-[#090971]/95 via-[#000041]/80 via-35% to-transparent pointer-events-none" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col mb-6 md:mb-12 text-center">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-[1.1] tracking-tight">
            <span className="text-[#F3E8D6]">Tu guía para comprar</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primaryEnd to-pixel-accent">de forma segura.</span>
          </h2>
        </div>

        {/* Carrusel horizontal en móviles, Grid en desktop */}
        <div className="overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 pb-4 md:pb-0 w-full md:ml-20">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                whileHover={window.innerWidth >= 768 ? { y: -12, scale: 1.02 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="rounded-xl md:rounded-[3rem] p-4 md:p-8 lg:p-10 flex flex-col relative overflow-hidden select-none group/card cursor-pointer w-[75vw] max-w-[280px] md:w-full md:min-w-[400px] min-h-[180px] md:min-h-[280px] border md:transition-all duration-500 bg-gradient-to-br from-[#090971]/70 to-[#000041]/60 backdrop-blur-sm md:backdrop-blur-2xl border-[#090971]/40 md:hover:border-[#090971]/60 flex-shrink-0"
              >
              {/* Animated Light Streak on Hover */}
              <div className="hidden md:block absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out"></div>

              {/* Top Row: Number & Icon */}
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

              {/* Content */}
              <div className="relative z-10 mt-4 md:mt-8">
                <h3 className="text-base md:text-xl font-bold text-white mb-2 md:mb-3 group-hover/card:text-pixel-accent transition-colors duration-300 tracking-tight">{step.title}</h3>
                <p className="text-[11px] md:text-[13px] leading-relaxed transition-colors duration-300 text-blue-100/70">
                  {step.desc}
                </p>
              </div>

              {/* Background Watermark Icon (Animated) */}
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
