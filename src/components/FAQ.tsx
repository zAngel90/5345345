import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ArrowUpRight,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreAPI } from '../services/api';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    Promise.all([
      StoreAPI.getFaqs(),
      StoreAPI.getSocialLinks()
    ]).then(([faqsRes, linksRes]) => {
      if (faqsRes.success && faqsRes.data.length > 0) {
        setFaqs(faqsRes.data);
      }
      if (linksRes.success && linksRes.data?.whatsapp?.url) {
        setWhatsappUrl(linksRes.data.whatsapp.url);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="faq" className="pt-0 pb-24 md:pt-10 md:pb-40 relative overflow-hidden">
      {/* Background layer for overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Corner Overlays - Top Left (extended downwards) */}
        <div className="absolute -top-80 h-[70%] left-0 w-1/3 opacity-100 blur-3xl bg-gradient-to-br from-[#090971] via-[#000041]/90 via-30% to-transparent" />
        {/* Corner Overlays - Top Right (extended downwards) */}
        <div className="absolute -top-80 h-[70%] right-0 w-1/3 opacity-100 blur-3xl bg-gradient-to-bl from-[#090971] via-[#000041]/95 via-30% to-transparent" />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main FAQ Container */}
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
                        <HelpCircle size={20} />
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

