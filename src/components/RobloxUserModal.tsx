import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Gamepad2, CheckCircle2, ChevronRight, User } from 'lucide-react';

interface RobloxUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: string) => void;
}

const recentUsers = [
  { id: 1, username: 'devdokiplop', handle: '@devdokiplop', avatar: 'https://i.pravatar.cc/100?u=1' },
  { id: 2, username: 'zAngel90_yt', handle: '@zAngel90_yt', avatar: 'https://i.pravatar.cc/100?u=2' },
  { id: 3, username: 'zangel90', handle: '@zangel90', avatar: 'https://i.pravatar.cc/100?u=3' },
];

const steps = [
  { id: 'search', label: 'BUSCAR', icon: Search },
  { id: 'gamepass', label: 'CREAR GAMEPASS', icon: Gamepad2 },
  { id: 'verified', label: 'VERIFICADO', icon: CheckCircle2 },
];

export default function RobloxUserModal({ isOpen, onClose, onSelect }: RobloxUserModalProps) {
  const [activeStep, setActiveStep] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[151] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-[440px] bg-[#0D0B1E]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="mb-10">
                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2">Verificación</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest opacity-60">Confirma tu cuenta de Roblox</p>
              </div>

              {/* Stepper */}
              <div className="flex items-center justify-between relative mb-12 px-2">
                 {/* Stepper Line */}
                 <div className="absolute top-4 left-0 w-full h-[1px] bg-white/5 -z-10" />
                 
                 {steps.map((step, i) => (
                   <div key={step.id} className="flex flex-col items-center gap-2">
                     <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                       activeStep === step.id 
                       ? 'bg-pixel-accent text-white shadow-[0_0_20px_rgba(96,165,250,0.4)]' 
                       : 'bg-white/5 text-gray-500'
                     }`}>
                       <step.icon size={16} />
                     </div>
                     <span className={`text-[8px] font-black tracking-[0.2em] transition-colors ${
                       activeStep === step.id ? 'text-pixel-accent' : 'text-gray-500'
                     }`}>
                       {step.label}
                     </span>
                   </div>
                 ))}
              </div>

              {/* Step Content: Search */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-pixel-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Usuarios recientes</span>
                  </div>
                  <div className="space-y-2">
                    {recentUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => onSelect(user.username)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-pixel-accent/50 hover:bg-pixel-accent/10 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-white group-hover:text-pixel-accent transition-colors">{user.username}</span>
                            <span className="text-[10px] text-gray-500 font-medium group-hover:text-gray-300 transition-colors">{user.handle}</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-500 group-hover:text-pixel-accent translate-x-0 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 flex items-center">
                     <div className="w-full h-px bg-white/5" />
                   </div>
                   <div className="relative flex justify-center">
                     <span className="bg-[#0D0B1E] px-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">O ingresa manualmente</span>
                   </div>
                </div>

                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pixel-accent transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Usuario de Roblox..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-pixel-accent/50 focus:bg-white/[0.07] transition-all text-sm font-medium"
                  />
                </div>

                <div className="flex flex-col items-center gap-4 pt-4">
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                     <Search size={24} className="text-gray-500" />
                   </div>
                   <p className="text-[10px] font-bold text-gray-400 italic">Ingresa tu nombre de usuario para continuar</p>
                </div>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
