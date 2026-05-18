import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, ChevronLeft, ChevronRight, UserPlus, MousePointerClick, CreditCard, Package } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Crea tu cuenta",
    desc: "Regístrate en segundos y accede a todos los productos disponibles de inmediato.",
    icon: UserPlus,
    active: true,
    color: "text-[#4D00FF]",
    borderColor: "border-[#4D00FF]/30"
  },
  {
    num: "02",
    title: "Elige tu producto",
    desc: "Selecciona la cantidad de Robux o el ítem que necesitas desde nuestro catálogo verificado.",
    icon: MousePointerClick,
    active: false,
    color: "text-[#2B00E0]",
    borderColor: "border-[#2B00E0]/30"
  },
  {
    num: "03",
    title: "Realiza tu pago",
    desc: "Paga de forma segura con los métodos disponibles. Tu transacción está protegida en todo momento.",
    icon: CreditCard,
    active: false,
    color: "text-[#7B2FFF]",
    borderColor: "border-[#7B2FFF]/30"
  },
  {
    num: "04",
    title: "Recibe tu pedido",
    desc: "Tu entrega llega en minutos con seguimiento en tiempo real en tu cuenta.",
    icon: Package,
    active: false,
    color: "text-[#1400AC]",
    borderColor: "border-[#1400AC]/30"
  }
];

export default function HowItWorks() {
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <section id="how-it-works" className="py-24 section-glow bg-pixel-bg">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-pixel-primaryEnd/5 blur-[140px] rounded-full pointer-events-none z-0"></div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col mb-12">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D0B1E]/80 border border-pixel-primary/40 mb-6 w-max">
            <Link2 size={14} className="text-pixel-accent" />
            <span className="text-[10px] font-bold tracking-widest text-pixel-accent uppercase">
              Descubre cómo funciona
            </span>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-[1.1] tracking-tight">
            <span className="text-[#F3E8D6]">Tu guía para comprar</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primaryEnd to-pixel-accent">de forma segura.</span>
          </h2>
        </div>

        {/* Static Grid Layout with Premium Hover Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              whileHover={{ y: -12, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-[3rem] p-8 flex flex-col relative overflow-hidden select-none group/card cursor-pointer min-h-[320px] border transition-all duration-500 bg-gradient-to-b from-[#1400AC]/40 to-[#0D0B1E]/90 backdrop-blur-2xl border-[#4D00FF]/40 shadow-[0_30px_60px_-20px_rgba(20,0,172,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(77,0,255,0.4)] hover:border-[#4D00FF]/60"
            >
              {/* Animated Light Streak on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out"></div>

              {/* Top Row: Number & Icon */}
              <div className="flex justify-between items-start mb-auto relative z-10">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black tracking-tighter transition-all duration-500 group-hover/card:scale-110 bg-gradient-to-r from-pixel-primary to-pixel-primaryEnd text-white shadow-[0_0_15px_rgba(77,0,255,0.4)]">
                  {step.num}
                </div>
                <div className="p-3 rounded-2xl bg-white/5 transition-all duration-500 group-hover/card:bg-pixel-primaryEnd/20 group-hover/card:scale-110">
                  <step.icon 
                    size={22} 
                    strokeWidth={2} 
                    className="text-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 mt-8">
                <h3 className="text-xl font-bold text-white mb-3 group-hover/card:text-pixel-accent transition-colors duration-300 tracking-tight">{step.title}</h3>
                <p className="text-[13px] leading-relaxed transition-colors duration-300 text-blue-100/70">
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
    </section>
  );
}
