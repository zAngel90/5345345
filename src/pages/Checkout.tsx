import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Shield, Clock, Zap, CheckCircle2, Tag, ArrowRight, Lock, Edit2, X, Search, Users, HelpCircle, ShoppingBag, ShoppingCart, Loader2, ImageIcon, FileText, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StoreAPI, OrdersAPI, SERVER_URL } from '../services/api';
import Logo from '../components/Logo';

const PAYMENT_METHODS = [
  { id: 'nequi', name: 'Nequi', emoji: '💜' },
  { id: 'pse', name: 'PSE', emoji: '🏦' },
  { id: 'bancolombia', name: 'Bancolombia', emoji: '🏛️' },
  { id: 'mercadopago', name: 'Mercado Pago', emoji: '🔵' },
  { id: 'card', name: 'Tarjeta', emoji: '💳' },
  { id: 'paypal', name: 'PayPal', emoji: '🅿️' },
  { id: 'cryptomus', name: 'Crypto', emoji: '₿' },
  { id: 'binance', name: 'Binance', emoji: '🔶' },
];

const CheckoutLoader = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="fixed inset-0 z-[200] bg-[#0d0c22] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Ovals (Animated) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.04, 0.08, 0.04],
          rotate: [0, 8, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] right-[-10%] w-[70%] h-[60%] bg-blue-500/20 rounded-[100%] rotate-[-15deg] blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.03, 0.07, 0.03],
          rotate: [0, -10, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[50%] bg-blue-600/20 rounded-[100%] rotate-[15deg] blur-[120px] pointer-events-none" 
      />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container with subtle pulse */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [1, 1.03, 1],
            opacity: 1
          }}
          transition={{ 
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5, delay: 0.2 }
          }}
          className="relative mb-10"
        >
          {/* Layered Glow */}
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150" />
          <div className="absolute inset-0 bg-blue-400/10 blur-xl rounded-full scale-110" />
          
          <div className="relative w-28 h-28 bg-white/[0.03] border border-white/10 rounded-[32px] flex items-center justify-center backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-4">
            <img 
              src="https://i.postimg.cc/5tSsMDgK/logo-4x.png" 
              alt="Pixel Store" 
              className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
            />
          </div>
        </motion.div>

        {/* Branded Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-black text-white tracking-[0.25em] mb-2 drop-shadow-lg">PIXEL STORE</h2>
          <div className="flex items-center justify-center gap-4">
             <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20" />
             <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">CHECKOUT</p>
             <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </motion.div>

        {/* Premium Dots Animation */}
        <div className="flex gap-3 mt-16">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                opacity: [0.1, 1, 0.1],
                scale: [0.7, 1.3, 0.7],
                y: [0, -4, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.25,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-blue-500/50 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  const isTrade = state.type === 'trade_limited';
  const amount: number = Number(state.amount) || (isTrade ? 0 : 1700);
  const username: string = state.username || '';
  const userId: string = state.userId || '';
  const cart: any[] = state.cart || [];
  const fromWebview: boolean = state.fromWebview || !!state.action;
  const initialCurrency: string = state.currency || (isTrade ? 'PEN' : 'COP');

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [dynamicCurrencies, setDynamicCurrencies] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDiscount, setShowDiscount] = useState(false);
  const [code, setCode] = useState('');
  const [statIndex, setStatIndex] = useState(0);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: username, id: userId });
  const [userAvatar, setUserAvatar] = useState('');

  // Sync currentUser if username/userId changes
  useEffect(() => {
    setCurrentUser({ name: username, id: userId });
  }, [username, userId]);

  const stats = [
    { value: '+50,000', label: 'entregas exitosas' },
    { value: '50M+', label: 'robux vendidos' },
    { value: '+15,000', label: 'clientes felices' }
  ];

  const [storeUser, setStoreUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) setStoreUser(JSON.parse(savedUser));
    
    const fetchAvatar = async () => {
      if (!userId) return;
      try {
        setUserAvatar(`${SERVER_URL}/api/users/avatar/${userId}`);
      } catch (error) {
        console.error('Error setting avatar:', error);
      }
    };
    fetchAvatar();

    const fetchMethods = async () => {
      try {
        const [methodsRes, currenciesRes] = await Promise.all([
          StoreAPI.getPaymentMethodsConfig(),
          StoreAPI.getCurrenciesConfig()
        ]);

        if (methodsRes.success && Array.isArray(methodsRes.data)) {
          setPaymentMethods(methodsRes.data.filter((m: any) => m.active));
        }

        if (currenciesRes.success && Array.isArray(currenciesRes.data)) {
          setDynamicCurrencies(currenciesRes.data);
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
      } finally {
        // Aumentado a 3.5 segundos para una mejor experiencia visual
        setTimeout(() => setIsFetching(false), 3500);
      }
    };
    fetchMethods();

    const timer = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getPrices = () => {
    if (!fromWebview) {
      const base = Math.round(amount * 27); 
      const fee = Math.round(base * 0.07);
      return { 
        displayTotal: base + fee, 
        displayCurrency: 'PEN' 
      };
    }
    return { 
      displayTotal: amount, 
      displayCurrency: initialCurrency
    };
  };

  const { displayTotal, displayCurrency } = isTrade ? { displayTotal: amount, displayCurrency: initialCurrency } : getPrices();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitOrder = async () => {
    if (!selected || !receipt) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount.toString());
      formData.append('username', username);
      formData.append('userId', userId);
      formData.append('accountId', storeUser?.id || '');
      formData.append('method', state.method || 'gamepass');
      formData.append('paymentMethodId', selected || '');
      formData.append('total', displayTotal.toString());
      formData.append('currency', displayCurrency);
      if (state.gamepassId) {
        formData.append('gamepassId', state.gamepassId.toString());
      }
      if (isTrade) {
        formData.append('type', 'trade_limited');
        formData.append('tradeItem', JSON.stringify(state.tradeItem));
        formData.append('targetItem', JSON.stringify(state.targetItem));
        if (cart.length > 0) formData.append('cart', JSON.stringify(cart));
      } else if (fromWebview && cart.length > 0) {
        formData.append('cart', JSON.stringify(cart));
      }
      formData.append('receipt', receipt);
      
      const response = await OrdersAPI.createOrder(formData);
      navigate('/account', { state: { orderId: response.data.id } });
    } catch (error) {
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c22] font-sans">
      <AnimatePresence mode="wait">
        {isFetching ? (
          <CheckoutLoader key="loader" />
        ) : (
          <motion.div 
            key="checkout-content"
            initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="min-h-screen lg:h-screen text-white relative lg:overflow-hidden overflow-x-hidden"
          >
            {/* Background — exact from reference HTML */}
            <div className="absolute inset-0 bg-[#0F172A]" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59, 130, 246, 0.10) 0%, transparent 65%), ' +
                  'radial-gradient(ellipse 60% 40% at 85% 15%, rgba(96, 165, 250, 0.06) 0%, transparent 55%), ' +
                  'radial-gradient(ellipse 90% 80% at 50% 50%, #0F172A 0%, #0B1120 100%)',
              }}
            />

            {/* Mobile header */}
            <div className="relative z-10 border-b border-white/[0.06] lg:hidden">
              <div className="bg-[#0F172A]/90 backdrop-blur-2xl">
                <div className="px-4 sm:px-6 py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
                      >
                        <ChevronLeft className="w-5 h-5 text-white/60" />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white/90 leading-none">Checkout seguro</div>
                          <div className="text-[10px] text-white/30 font-medium uppercase tracking-widest mt-0.5">Protección 100%</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">En línea</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inner Content */}
            <div className="lg:h-screen px-4 sm:px-5 lg:px-6 py-4 lg:py-5 relative z-10 flex flex-col items-center">
              <div className="w-full max-w-[950px] lg:h-full bg-white/[0.02] rounded-2xl border border-white/[0.05] lg:overflow-hidden flex flex-col">
                {/* Desktop header */}
                <div className="hidden lg:block shrink-0 border-b border-white/[0.04] px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.07] transition-all group"
                      >
                        <ChevronLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="w-[30px] h-[30px] rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-white/90 leading-none">Finalizar Compra</div>
                          <div className="text-[10px] text-white/30 font-medium uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            Transacción segura y encriptada
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400/90 uppercase tracking-wider">Sistema Activo</span>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="lg:flex-1 lg:min-h-0 grid grid-cols-1 lg:grid-cols-[38%_62%] lg:divide-x lg:divide-white/[0.04] lg:overflow-hidden">
                  {/* LEFT col */}
                  <div className="hidden lg:flex flex-col p-6">
                    <motion.div
                      whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.12)' }}
                      transition={{ duration: 0.3 }}
                      className="relative bg-[#111827]/40 border border-white/[0.07] rounded-3xl p-6 mb-4 overflow-hidden group cursor-default"
                    >
                      <div className="absolute top-[-10%] right-[-15%] w-[70%] h-[60%] bg-white/[0.03] rounded-[100%] rotate-[-25deg] pointer-events-none group-hover:bg-white/[0.05] transition-colors duration-500" />
                      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[50%] bg-white/[0.02] rounded-[100%] rotate-[15deg] pointer-events-none group-hover:bg-white/[0.04] transition-colors duration-500" />
                      <div className="absolute top-[20%] left-[-20%] w-[50%] h-[40%] bg-white/[0.015] rounded-[100%] rotate-[-10deg] pointer-events-none group-hover:bg-white/[0.03] transition-colors duration-500" />

                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Resumen del pedido</span>
                        </div>

                        {isTrade ? (
                          <div className="space-y-4 mb-5">
                            {/* Target Item (To Buy) */}
                            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                                <img src={state.targetItem?.img || cart[0]?.img} alt="" className="w-full h-full object-contain p-1" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-0.5">Item a recibir</p>
                                <p className="text-xs font-bold text-white truncate">{state.targetItem?.name || cart[0]?.name}</p>
                              </div>
                            </div>

                            {/* Arrow Divider */}
                            <div className="flex justify-center -my-2 relative z-20">
                              <div className="w-6 h-6 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-white/20 rotate-90" />
                              </div>
                            </div>

                            {/* Trade Item (To Give) */}
                            <div className="flex items-center gap-3 p-3 bg-white/[0.015] border border-dashed border-white/10 rounded-2xl">
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                <img src={state.tradeItem?.thumbnail} alt="" className="w-full h-full object-contain p-1 opacity-60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-0.5">Tu Item (Trade)</p>
                                <p className="text-xs font-bold text-white/40 truncate">{state.tradeItem?.name}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] border border-blue-500/20 flex items-center justify-center shrink-0">
                              {fromWebview && cart.length > 0 ? (
                                <div className="relative w-full h-full p-2">
                                   <ShoppingCart className="w-full h-full text-blue-400" />
                                   <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111827]">
                                     {cart.length}
                                   </span>
                                </div>
                              ) : (
                                <img src="/images/robux-logo.svg" alt="Robux" className="w-7 h-7" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {fromWebview && cart.length > 0 ? (
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-white truncate">
                                    {cart.length === 1 ? cart[0].name : `${cart.length} Ítems del Catálogo`}
                                  </div>
                                  <div className="text-[10px] text-white/40 font-medium">Pedido Especial</div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-sm font-bold text-white">{amount.toLocaleString('es-CO')} Robux</span>
                                    <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                  </div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <svg className="w-3 h-3 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>
                                    <span className="text-xs text-white/40">Cantidad: {amount.toLocaleString('es-CO')}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex items-center gap-1.5 mt-2">
                                <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span className="text-xs text-emerald-400 font-semibold">@{username}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="border-t border-white/[0.06] pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">Subtotal</span>
                            <span className="text-white/60">{displayTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })} {displayCurrency}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-white">Total</span>
                            <div className="text-right">
                              <div className="flex items-baseline justify-end gap-1">
                                <span className="text-xl font-black text-white">{displayTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                <span className="text-xs text-white/50 font-bold">{displayCurrency}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-[9px] text-white/20 uppercase tracking-widest text-right">precio no final ⓘ</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Stats Carousel */}
                    <div className="relative rounded-2xl px-5 py-5 mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-white/[0.02] rounded-[100%] rotate-[-15deg] pointer-events-none" />
                      <div className="absolute bottom-[-30%] left-[-5%] w-[40%] h-[70%] bg-white/[0.015] rounded-[100%] rotate-[10deg] pointer-events-none" />
                      
                      <div className="relative z-10 flex items-center justify-center gap-3 h-full">
                        <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse shrink-0" />
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={statIndex}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-base font-black text-white tracking-tight">{stats[statIndex].value}</span>
                            <span className="text-sm text-white/40 font-medium">{stats[statIndex].label}</span>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.03]">
                        <motion.div 
                          key={statIndex}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4, ease: "linear" }}
                          className="h-full bg-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-3.5 h-3.5 text-white/25 shrink-0" />
                      <span className="text-xs text-white/30">Tu información está segura</span>
                    </div>
                    <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] text-xs text-white/35 hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                        <span>¿No ves tu método de pago?</span>
                      </div>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  {/* RIGHT col */}
                  <div className="flex flex-col px-5 lg:px-6 py-5 lg:py-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.35)' }}>
                      <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-white/[0.10] overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={userAvatar || `${SERVER_URL}/api/users/avatar/${userId}`}
                          alt={username} className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${username}&background=random`;
                          }}
                        />
                      </div>
                      <span className="flex-1 text-xs font-medium text-white/90">@{username}</span>
                      <button 
                        onClick={() => setIsUserModalOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-white/35" />
                      </button>
                    </div>

                    {!showDiscount ? (
                      <button
                        onClick={() => setShowDiscount(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full mb-3 hover:brightness-110 transition-all"
                        style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.13)' }}
                      >
                        <Tag className="w-3 h-3 text-white/40 shrink-0" />
                        <span className="text-xs text-white/90">¿Tienes un código?</span>
                        <span className="text-xs text-white/40 font-medium">Aplícalo aquí</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                          <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO"
                            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                          />
                        </div>
                        <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/80"
                          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.22)' }}>
                          Aplicar
                        </button>
                        <button onClick={() => { setShowDiscount(false); setCode(''); }} className="px-3 py-2.5 rounded-xl text-xs text-white/30 hover:text-white/50 transition-colors border border-white/[0.06]">✕</button>
                      </div>
                    )}

                    {!selected && (
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-3">Método de pago</div>
                    )}

                    <AnimatePresence mode="wait">
                      {!selected ? (
                        <motion.div
                          key="selection"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 mb-4"
                        >
                          <div className="grid grid-cols-5 gap-2">
                            {paymentMethods.map((m) => (
                              <motion.button
                                key={m.id}
                                onClick={() => setSelected(m.id)}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center justify-center gap-2 py-3.5 px-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                              >
                                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden p-1">
                                  <img src={m.image.startsWith('http') ? m.image : `${SERVER_URL}${m.image}`} className="w-full h-full object-contain" alt={m.name} />
                                </div>
                                <span className="text-[10px] font-semibold text-white/45 truncate w-full text-center">{m.name}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-4"
                        >
                          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1.5">
                                <img src={paymentMethods.find(m => m.id === selected)?.image.startsWith('http') ? paymentMethods.find(m => m.id === selected)?.image : `${SERVER_URL}${paymentMethods.find(m => m.id === selected)?.image}`} className="w-full h-full object-contain" alt="" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">
                                  {paymentMethods.find(m => m.id === selected)?.name}
                                </div>
                                <div className="text-[10px] text-white/30">
                                  Transferencia Directa
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelected(null)}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-[10px] font-bold text-blue-400 uppercase tracking-wider hover:bg-white/[0.1] transition-all"
                            >
                              ← Cambiar
                            </button>
                          </div>

                          <div className="rounded-3xl bg-[#0F172A]/80 border border-white/[0.06] p-6 shadow-2xl">
                            <div className="text-center mb-6">
                              <div className="text-lg font-black text-white mb-1">Pagar con {paymentMethods.find(m => m.id === selected)?.name}</div>
                              <div className="text-xs text-white/40">Sigue las instrucciones de abajo y sube tu comprobante.</div>
                            </div>

                            {paymentMethods.find(m => m.id === selected) && (
                              <div className="mb-6 space-y-4">
                                <div className="grid grid-cols-1 gap-2.5">
                                  {paymentMethods.find(m => m.id === selected)?.fields?.map((field: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group/field hover:bg-white/[0.05] transition-all">
                                      <div>
                                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{field.label}</div>
                                        <div className="text-sm font-bold text-white tracking-tight">{field.value}</div>
                                      </div>
                                      <button 
                                        onClick={() => copyToClipboard(field.value, field.label)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                          copiedField === field.label 
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                          : 'bg-white/5 text-blue-400 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30'
                                        }`}
                                      >
                                        {copiedField === field.label ? '¡Copiado!' : 'Copiar'}
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {paymentMethods.find(m => m.id === selected)?.instructions && (
                                  <div className="p-5 bg-blue-600/[0.03] border border-blue-500/10 rounded-2xl relative overflow-hidden group/instr">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/instr:opacity-[0.07] transition-opacity">
                                      <HelpCircle size={40} className="text-blue-500" />
                                    </div>
                                    <div className="text-[9px] font-black text-blue-400/60 uppercase tracking-[0.2em] mb-2.5 flex items-center gap-2">
                                      <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                                      Instrucciones adicionales
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium whitespace-pre-wrap">
                                      {paymentMethods.find(m => m.id === selected)?.instructions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="space-y-4">
                              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                              
                              {!receipt ? (
                                <div 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full py-8 border-2 border-dashed border-white/10 bg-white/[0.02] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                >
                                  <ImageIcon size={32} className="text-white/20 group-hover:text-blue-500 transition-colors" />
                                  <div className="text-center">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Subir comprobante</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/20">
                                  <img src={receiptPreview || ''} className="w-full h-full object-contain" alt="Receipt" />
                                  <button 
                                    onClick={() => { setReceipt(null); setReceiptPreview(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}

                              <button 
                                onClick={handleSubmitOrder}
                                disabled={isLoading || !receipt}
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                                  isLoading || !receipt 
                                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                                }`}
                              >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
                              </button>
                            </div>
                            <div className="mt-4 text-center text-[9px] text-white/20 uppercase tracking-widest flex items-center justify-center gap-1.5">
                              <Lock className="w-3 h-3" /> Pago seguro procesado por Stripe
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-auto pt-4">
                      <div className="rounded-3xl border border-white/[0.06] bg-[#111827]/60 px-5 py-4">
                        <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Total a pagar</span>
                          <div className="text-right">
                            <div className="flex items-baseline justify-end gap-1">
                               <span className="text-2xl font-black text-white">{displayTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                               <span className="text-[10px] text-white/40 font-bold uppercase">{displayCurrency}</span>
                            </div>
                          </div>
                        </div>

                        {!selected ? (
                          <div className="text-center">
                            <div className="text-[11px] text-white/30 font-medium">Selecciona un método de pago para continuar</div>
                            <div className="flex items-center justify-center gap-1.5 mt-2 text-white/10">
                              <Lock className="w-3 h-3" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Tu información está segura</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-blue-400/60">
                              <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Completa el pago con {paymentMethods.find(m => m.id === selected)?.name}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-white/10">
                              <Lock className="w-3 h-3" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Tu información está segura</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[420px] bg-[#0d0c22] border border-blue-500/20 rounded-[24px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)] p-6"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.15), transparent 60%)'
              }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Elegir Usuario</h2>
                  <p className="text-white/40 text-[11px] font-medium">Selecciona tu cuenta de Roblox</p>
                </div>
                <button onClick={() => setIsUserModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Busca tu usuario..." 
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <HelpCircle size={14} className="text-white/20" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Usuarios recientes</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'zAngel90_yt', id: '456' },
                      { name: 'devdokiplop', id: '123' },
                      { name: 'zangel90', id: '789' }
                    ].map(user => (
                      <div 
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setIsUserModalOpen(false);
                        }}
                        className={`flex items-center justify-between p-3 border transition-all cursor-pointer rounded-xl bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                            <img src={`https://tr.rbxcdn.com/30DAY-AvatarHeadshot-7CD8F7C85B3C840748F735B16F6D2687-Png/150/150/AvatarHeadshot/Webp/noFilter`} alt="" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white leading-tight">{user.name}</h4>
                            <p className="text-white/30 text-[10px]">@{user.name}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
