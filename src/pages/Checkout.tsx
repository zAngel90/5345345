import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard, Smartphone, Wallet, DollarSign, X, ChevronDown, ChevronUp, ChevronLeft, Tag, CheckCircle2, Loader2, Copy, Check, ArrowRight, ArrowLeft, Users, Search, Search as SearchIcon, HelpCircle, Shield, Info, TrendingUp, Zap, Star, Clock, Lock, Globe, ExternalLink, AlertCircle, Package, FileText, ImageIcon, Gamepad2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RobloxAPI, StoreAPI, OrdersAPI, BASE_URL, SERVER_URL, CouponsAPI } from '../services/api';

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
        {/* New Branded Logo (Outside container) */}
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 1,
            ease: "circOut"
          }}
          className="relative mb-12 flex flex-col items-center"
        >
          {/* Layered Glow */}
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 animate-pulse" />

          <img
            src="https://i.postimg.cc/tgR7tPvJ/logo-checkout-4x-(2).png"
            alt="Pixel Store"
            className="w-64 md:w-[320px] h-auto object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] relative z-10"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20" />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.6em]">FINALIZAR COMPRA</p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20" />
          </motion.div>
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
  const isFortnite = state.type === 'fortnite';
  const amount: number = Number(state.amount) || (isTrade ? 0 : 1700);
  const username: string = state.username || '';
  const displayName: string = state.displayName || '';
  const userId: string = state.userId || '';
  const cart: any[] = state.cart || [];
  const fromWebview: boolean = state.fromWebview || !!state.action;
  const initialCurrency: string = state.currency || (isTrade ? 'PEN' : 'COP');

  const isMM2 = state.gameType === 'mm2' || cart.some(item => {
    const g = String(item.game || '').toLowerCase();
    return g.includes('mm2') || g.includes('murder mystery') || g.includes('murder');
  });
  const isLimiteds = cart.some(item => {
    const g = String(item.game || '').toLowerCase();
    return g.includes('limited') || g.includes('unique') || state.type === 'trade_limited';
  });
  const isIngame = !isMM2 && !isLimiteds && !isTrade && !isFortnite && (state.fromIngame || state.gameType === 'ingame');
  const isSpecialGame = true; // Always use special layout
  const isRobuxOnly = !isMM2 && !isLimiteds && !isTrade && !isFortnite && !isIngame; // Regular Robux purchase

  useEffect(() => {
    console.log('📦 Checkout State:', state);
    console.log('🎮 Is Special Game:', isSpecialGame, { isMM2, isLimiteds, isTrade });
  }, [state, isSpecialGame, isMM2, isLimiteds, isTrade]);

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [dynamicCurrencies, setDynamicCurrencies] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countries, setCountries] = useState<any[]>([]);



  const [selectedCountry, setSelectedCountry] = useState<string>('PE');
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDiscount, setShowDiscount] = useState(false);
  const [code, setCode] = useState('');
  const [statIndex, setStatIndex] = useState(0);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: username, displayName: displayName, id: userId });
  const [userAvatar, setUserAvatar] = useState('');

  // Estados para modal de cambio de usuario
  const [isChangeUserModalOpen, setIsChangeUserModalOpen] = useState(false);
  const [changeUserStep, setChangeUserStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [existingGamepasses, setExistingGamepasses] = useState<any[]>([]);
  const [selectedGamepass, setSelectedGamepass] = useState<any>(null);
  const [gamepassSearchQuery, setGamepassSearchQuery] = useState('');
  const [isLoadingGamepass, setIsLoadingGamepass] = useState(false);
  const [groupVerificationResults, setGroupVerificationResults] = useState<any>(null);
  const [isVerifyingGroups, setIsVerifyingGroups] = useState(false);
  const [requiredGroups, setRequiredGroups] = useState<any[]>([]);
  const [gamesConfig, setGamesConfig] = useState<any[]>([]);
  const deliveryMethod = state.method || 'gamepass'; // 'gamepass' o 'group'
  const gamepassRequiredPrice = Math.ceil(amount / 0.7); // Precio con comisión de Roblox (30%)

  // Helper: detect if cart has items from a delivery-enabled category
  const getDeliveryType = (cartItems: any[], games: any[]): string | null => {
    for (const item of cartItems) {
      const game = games.find(g => g.id === item.game || g.slug === item.game || g.name?.toLowerCase() === String(item.game).toLowerCase());
      if (game && game.categories) {
        for (const cat of game.categories) {
          const catName = typeof cat === 'string' ? cat : cat.name;
          const catDeliveryEnabled = typeof cat === 'string' ? false : cat.deliveryEnabled;
          if (catDeliveryEnabled && item.category === catName) {
            const gameSlug = game.slug || game.id;
            return `${gameSlug}:${catName}`;
          }
        }
      }
    }
    return null;
  };

  // Sync currentUser if username/userId changes
  useEffect(() => {
    setCurrentUser({ name: username, displayName: displayName, id: userId });
  }, [username, userId]);

  // Cargar usuarios recientes
  useEffect(() => {
    const saved = localStorage.getItem('roblox_recent_users');
    if (saved) {
      try {
        setRecentUsers(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent users:', e);
      }
    }
  }, []);

  // Cargar configuración de grupos
  useEffect(() => {
    const fetchGroupsConfig = async () => {
      try {
        const res = await RobloxAPI.getGroupsConfig();
        if (res.success) {
          setRequiredGroups(res.data);
        }
      } catch (error) {
        console.error('Error fetching groups config:', error);
      }
    };
    fetchGroupsConfig();
  }, []);

  // Cargar configuración de juegos para detectar categorías con delivery
  useEffect(() => {
    const fetchGamesConfig = async () => {
      try {
        const res = await StoreAPI.getGamesConfig();
        if (res.success) {
          setGamesConfig(res.data || []);
        }
      } catch (error) {
        console.error('Error fetching games config:', error);
      }
    };
    fetchGamesConfig();
  }, []);

  // Verificar grupos automáticamente al llegar al paso 2 (group)
  useEffect(() => {
    if (changeUserStep === 2 && deliveryMethod === 'group' && selectedUser && !groupVerificationResults) {
      const verifyGroups = async () => {
        setIsVerifyingGroups(true);
        setUserError(null);
        try {
          const res = await RobloxAPI.checkUserGroups(selectedUser.id);
          if (res.success) {
            setGroupVerificationResults(res.data);
            // NO avanzar automáticamente, dejar que el usuario vea la lista de grupos
          }
        } catch (error) {
          console.error('Error verificando grupos:', error);
          setUserError('Error al verificar grupos');
        } finally {
          setIsVerifyingGroups(false);
        }
      };
      verifyGroups();
    }
  }, [changeUserStep, deliveryMethod, selectedUser, groupVerificationResults]);

  // Cargar gamepasses automáticamente al llegar al paso 2 (gamepass)
  useEffect(() => {
    if (changeUserStep === 2 && deliveryMethod === 'gamepass' && selectedUser && existingGamepasses.length === 0) {
      const loadGamepasses = async () => {
        setIsLoadingGamepass(true);
        setUserError(null);
        try {
          const placesRes = await RobloxAPI.getUserPlaces(selectedUser.id);
          if (placesRes.data && placesRes.data.length > 0) {
            let allGp: any[] = [];
            for (const place of placesRes.data) {
              const gpRes = await RobloxAPI.getPlaceGamepasses(place.id, selectedUser.id);
              if (gpRes.data) {
                const passesWithUniverse = gpRes.data.map((gp: any) => ({
                  ...gp,
                  universeId: place.universeId,
                  placeId: place.id
                }));
                allGp = [...allGp, ...passesWithUniverse];
              }
            }
            setExistingGamepasses(allGp);
            
            // Selección automática del gamepass según el precio requerido
            const foundGamepass = allGp.find(gp => gp.price === gamepassRequiredPrice);
            
            if (foundGamepass) {
              setSelectedGamepass(foundGamepass);
              setChangeUserStep(3); // Avanzar automáticamente al paso 3
              console.log('✅ Gamepass encontrado automáticamente, avanzando al paso 3:', foundGamepass.name, foundGamepass.price);
            } else if (allGp.length === 0) {
              setUserError('No se encontraron gamepasses para este usuario');
            } else {
              console.log(`⚠️ No se encontró gamepass con precio ${gamepassRequiredPrice} R$. Gamepasses disponibles:`, allGp.map(g => `${g.name} (${g.price} R$)`));
            }
          } else {
            setUserError('Este usuario no tiene juegos con gamepasses');
          }
        } catch (error) {
          console.error('Error cargando gamepasses:', error);
          setUserError('Error al cargar gamepasses');
        } finally {
          setIsLoadingGamepass(false);
        }
      };
      loadGamepasses();
    }
  }, [changeUserStep, deliveryMethod, selectedUser, state]);

  const stats = [
    { value: '+50,000', label: 'entregas exitosas' },
    { value: '50M+', label: 'robux vendidos' },
    { value: '+15,000', label: 'clientes felices' }
  ];

  const [storeUser, setStoreUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setStoreUser(user);
      // Usar el avatar del usuario logueado
      if (user?.avatar) {
        setUserAvatar(user.avatar.startsWith('http') ? user.avatar : `${SERVER_URL}${user.avatar}`);
      } else if (user?.id) {
        setUserAvatar(`${SERVER_URL}/api/users/avatar/${user.id}`);
      }
    }

    const fetchAvatar = async () => {
      if (!userId) return;
      try {
        setUserAvatar(`${SERVER_URL}/api/users/avatar/${userId}`);
      } catch (error) {
        console.error('Error setting avatar:', error);
      }
    };
    if (!storeUser) fetchAvatar();

    const fetchMethods = async () => {
      try {
        const [methodsRes, currenciesRes, countriesRes] = await Promise.all([
          StoreAPI.getPaymentMethodsConfig(),
          StoreAPI.getCurrenciesConfig(),
          StoreAPI.getCountriesConfig()
        ]);

        if (methodsRes.success && Array.isArray(methodsRes.data)) {
          setPaymentMethods(methodsRes.data.filter((m: any) => m.active));
        }

        if (currenciesRes.success && Array.isArray(currenciesRes.data)) {
          setDynamicCurrencies(currenciesRes.data);
        }

        if (countriesRes.success && Array.isArray(countriesRes.data)) {
          setCountries(countriesRes.data);
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
      } finally {
        // Aumentado a 3.5 segundos para una mejor experiencia visual
        setTimeout(() => setIsFetching(false), 2500);
      }
    };
    fetchMethods();

    const timer = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getPrices = () => {
    if (state?.totalPrice !== undefined && state?.currency) {
      // Base price should always be the original (pre-discount) price
      const base = state.originalPrice || state.totalPrice;
      return {
        displayTotal: base,
        displayCurrency: state.currency
      };
    }
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

  const { displayTotal: baseTotal, displayCurrency } = isTrade ? { displayTotal: amount, displayCurrency: initialCurrency } : getPrices();

  // Coupon State & Utility Handlers
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Detectar cupón aplicado desde el modal de Robux
  useEffect(() => {
    if (state.coupon && state.coupon.code && !isMM2 && !isLimiteds) {
      console.log('🎫 Cupón detectado desde modal:', state.coupon);
      setAppliedCoupon(state.coupon);
      setCode(state.coupon.code);
      setShowDiscount(false); // No mostrar el input de cupón
    }
  }, [state.coupon]);

  const handleValidateCoupon = async () => {
    if (!code.trim()) return;
    try {
      setIsValidatingCoupon(true);
      setCouponError('');
      const res = await CouponsAPI.validateCoupon(code.toUpperCase(), baseTotal, storeUser?.id);
      if (res.success) {
        setAppliedCoupon(res.coupon);
        setCouponError('');
      } else {
        setCouponError(res.error || 'Cupón inválido');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Error al validar cupón');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCode('');
    setCouponError('');
  };

  const getDiscountAmount = () => {
    // Si el cupón fue removido, no aplicar descuento
    if (!appliedCoupon) return 0;
    
    // Calcular descuento basado en el cupón aplicado
    if (appliedCoupon.discountType === 'percentage') {
      return parseFloat(((baseTotal * appliedCoupon.discountValue) / 100).toFixed(2));
    } else {
      return Math.min(appliedCoupon.discountValue, baseTotal);
    }
  };

  const discountAmount = getDiscountAmount();
  const finalTotal = parseFloat((baseTotal - discountAmount).toFixed(2));

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

    // Check if delivery method is enabled
    const methodToUse = state.method || 'gamepass';
    try {
      const delRes = await StoreAPI.getDeliveryMethods();
      if (delRes.success) {
        const dm = delRes.data;
        if ((methodToUse === 'gamepass' && !dm.gamepass?.enabled) ||
            (methodToUse === 'group' && !dm.group?.enabled)) {
          alert(`El método "${methodToUse === 'gamepass' ? 'Gamepass' : 'Grupo'}" está desactivado actualmente.`);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Silently continue if check fails
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount.toString());
      formData.append('username', username);
      formData.append('userId', userId);
      formData.append('accountId', storeUser?.id || '');
      formData.append('method', state.method || 'gamepass');
      formData.append('paymentMethodId', selected || '');
      formData.append('total', finalTotal.toString());
      formData.append('currency', displayCurrency);
      if (appliedCoupon) {
        formData.append('couponId', appliedCoupon.id.toString());
        formData.append('discountAmount', discountAmount.toString());
      }
      if (state.gamepassId) {
        formData.append('gamepassId', state.gamepassId.toString());
      }
      if (isTrade) {
        formData.append('type', 'trade_limited');
        formData.append('tradeItem', JSON.stringify(state.tradeItem));
        formData.append('targetItem', JSON.stringify(state.targetItem));
        if (cart.length > 0) formData.append('cart', JSON.stringify(cart));
      } else if (isFortnite && cart.length > 0) {
        formData.append('type', 'fortnite');
        formData.append('cart', JSON.stringify(cart));
        if (state.fortniteData) {
          formData.append('fortniteData', JSON.stringify(state.fortniteData));
        }
      } else if (isMM2 && cart.length > 0) {
        // Check if this is a generic delivery category
        const deliveryType = getDeliveryType(cart, gamesConfig);
        if (deliveryType) {
          formData.append('type', deliveryType);
        } else {
          formData.append('type', 'mm2');
        }
        formData.append('cart', JSON.stringify(cart));
      } else if (fromWebview && cart.length > 0) {
        // Check if this is a generic delivery category
        const deliveryType = getDeliveryType(cart, gamesConfig);
        if (deliveryType) {
          formData.append('type', deliveryType);
        } else {
          formData.append('type', 'ingame');
        }
        formData.append('cart', JSON.stringify(cart));
      }
      formData.append('receipt', receipt);

      const response = await OrdersAPI.createOrder(formData);
      navigate(`/order/${response.data.id}`);
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
          <>
          <motion.div
            key="checkout-content"
            initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="min-h-screen lg:h-screen lg:flex lg:flex-col text-white relative lg:overflow-hidden"
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

            {/* Top Bar Premium (Solo para MM2/Limiteds) */}
            {isSpecialGame && (
              <div className="hidden lg:flex w-full shrink-0 items-center justify-between px-8 py-6 border-b border-white/[0.06] backdrop-blur-md relative z-50">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex flex-col">
                    <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none">PIXEL STORE</h1>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">FINALIZAR COMPRA</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">Pago Seguro</span>
                    </div>
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black mt-1">CIFRADO SSL DE 256 BITS</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    <Shield size={22} className="text-emerald-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Inner Content */}
            <div className={`lg:flex-1 w-full relative z-10 flex flex-col items-center ${isSpecialGame ? 'lg:justify-center' : 'px-4 sm:px-5 lg:px-12 py-6 lg:py-10 overflow-y-auto'}  `}>
              {/* Full-width backgrounds for special game */}
              {isSpecialGame && (
                <>
                  <div className="hidden lg:block absolute inset-y-0 left-0 bg-black/10 z-0" style={{ width: 'calc(50vw - 700px + 420px)', right: 'calc(50vw + 700px - 420px)' }} />
                  <div className="hidden lg:block absolute inset-y-0 bg-white/[0.04] backdrop-blur-md z-0" style={{ left: 'calc(50vw - 700px + 420px)', right: 0 }} />
                  {/* Footer background - will be positioned dynamically */}
                  <div id="footer-bg" className="hidden lg:block absolute bg-[#0B1120]/90 backdrop-blur-xl z-0" style={{ left: 'calc(50vw - 700px + 420px)', right: 0, height: 0 }} />
                  <div id="footer-border" className="hidden lg:block absolute w-[1px] bg-white/[0.06] z-10" style={{ left: 'calc(50vw - 700px + 420px)', height: 0 }} />
                </>
              )}
              
              <div className={`w-full ${isSpecialGame ? 'lg:flex-1 lg:h-full max-w-[1400px] flex flex-col relative z-10' : 'max-w-[950px] bg-white/[0.02] rounded-[32px] border border-white/[0.05] shadow-lg overflow-hidden flex flex-col'} transition-all duration-500`}>

                {/* Desktop header (Solo si no es special game) */}
                {!isSpecialGame && (
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
                )}

                {/* Grid */}
                <div className={`grid grid-cols-1 ${isSpecialGame ? 'lg:flex-1 lg:h-full lg:grid-cols-[420px_1fr] relative' : 'lg:grid-cols-[38%_62%] lg:divide-x lg:divide-white/[0.04]'} transition-all duration-500 pb-[140px] lg:pb-0`}>
                  {/* Border line for special game */}
                  {isSpecialGame && <div className="hidden lg:block absolute top-0 bottom-0 left-[420px] w-[1px] bg-white/[0.06] z-30" />}
                  
                  {/* LEFT col */}
                  <div className={isSpecialGame ? "lg:h-full lg:overflow-y-auto custom-scrollbar relative z-20 px-4 py-4 lg:py-10 lg:px-0" : "flex flex-col p-4 lg:p-6 border-b lg:border-b-0 border-white/[0.04]"}>
                    <div className={isSpecialGame ? "w-full max-w-[420px] mx-auto lg:px-6 lg:px-8" : ""}>
                      <motion.div
                        className="relative bg-gradient-to-br from-[#111827]/80 via-[#1a2332]/70 to-[#111827]/80 border border-white/[0.08] rounded-2xl lg:rounded-[32px] p-4 lg:p-6 mb-4 lg:mb-6 overflow-hidden cursor-default backdrop-blur-xl"
                        style={{
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                        }}
                      >
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Resumen del pedido</span>
                          </div>

                          {isMM2 && !isTrade ? (
                            <div className="space-y-3 mb-5">
                              {/* MM2 Compact Summary */}
                              <div className="bg-white/[0.03] border border-white/10 rounded-[24px] p-3">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-2xl bg-black border-2 border-white/20 flex items-center justify-center shrink-0 p-1.5">
                                    <img src="https://www.peekstore.com/_next/image?url=%2Fmm2-logo.webp&w=64&q=75" className="w-full h-full object-contain rounded-lg" alt="MM2" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-black text-white mb-1">{cart.length} {cart.length === 1 ? 'Artículo' : 'Artículos'} MM2</div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-white/[0.03]">
                                        <Zap className="w-2.5 h-2.5 text-white/60" />
                                        <span className="text-[9px] font-semibold text-white/60">Trade In-Game</span>
                                      </div>
                                      <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                        <Shield className="w-2.5 h-2.5 text-blue-400" />
                                        <span className="text-[9px] font-semibold text-blue-400">Pago protegido</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                  <div className="flex items-center gap-2 pl-[60px] pt-1">
                                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                      <img
                                        src={userAvatar || `https://ui-avatars.com/api/?name=${username}&background=random`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-white leading-tight">{displayName || username}</span>
                                      <span className="text-[8px] text-white/40">@{username}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Items to Receive - Lista Expandida */}
                              <div className="space-y-2">
                                {cart.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                      <img src={item?.img || item?.image} alt="" className="w-full h-full object-contain p-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">
                                        {item?.category || 'Item'}
                                      </p>
                                      <p className="text-xs font-bold text-white truncate">{item?.name}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : isFortnite ? (
                            <>
                              <div className="space-y-4 mb-5">
                                {/* Fortnite Summary Header */}
                                <div className="bg-white/[0.03] border border-white/10 rounded-[24px] p-4">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                      <Gamepad2 className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-black text-white uppercase tracking-tight mb-1">
                                        {cart.length} {cart.length === 1 ? 'Atuendo' : 'Atuendos'} Fortnite
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                          <Zap className="w-2.5 h-2.5 text-blue-400" />
                                          <span className="text-[9px] font-semibold text-blue-400">Entrega directa</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-emerald-500/[0.08]">
                                          <Shield className="w-2.5 h-2.5 text-emerald-400" />
                                          <span className="text-[9px] font-semibold text-emerald-400">Pago protegido</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-white/[0.06]">
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Cliente</div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                        <img
                                          src={
                                            storeUser?.avatar?.startsWith('http') 
                                              ? storeUser.avatar 
                                              : storeUser?.avatar 
                                                ? `${SERVER_URL}${storeUser.avatar}` 
                                                : `https://ui-avatars.com/api/?name=${state.fortniteData?.fortniteUsername || username}&background=random`
                                          }
                                          className="w-full h-full object-cover"
                                          alt=""
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white leading-tight">{state.fortniteData?.fortniteUsername || username}</span>
                                        <span className="text-[8px] text-white/40">@{state.fortniteData?.fortniteUsername || username}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Fortnite Items List */}
                                <div className="space-y-2">
                                  {cart.map((item, idx) => (
                                    <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-[20px] p-3">
                                      <div className="flex items-center gap-3">
                                         <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                          <img
                                            src={item?.image || item?.img}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = 'https://i.postimg.cc/5tSsMDgK/logo-4x.png';
                                            }}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-tight mb-0.5">
                                            Fortnite
                                          </p>
                                          <p className="text-[11px] font-black text-white truncate leading-tight mb-1">{item?.name}</p>
                                          <p className="text-[9px] text-blue-400 font-bold uppercase">Skin</p>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[10px] font-black text-white/40">S/ {((item?.price || 0) * (item?.quantity || 1)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : isLimiteds && !isTrade ? (
                            <>
                              <div className="space-y-4 mb-5">
                                {/* New Summary Header (Reference Style) */}
                                <div className="bg-white/[0.03] border border-white/10 rounded-[24px] p-4">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                                      <Gamepad2 className="w-6 h-6 text-pink-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-black text-white uppercase tracking-tight mb-1">
                                        {cart.length} {cart.length === 1 ? 'Item' : 'Items'} Limited
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                          <Zap className="w-2.5 h-2.5 text-blue-400" />
                                          <span className="text-[9px] font-semibold text-blue-400">Trade In-Game</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-emerald-500/[0.08]">
                                          <Shield className="w-2.5 h-2.5 text-emerald-400" />
                                          <span className="text-[9px] font-semibold text-emerald-400">Pago protegido</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-white/[0.06]">
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Cliente</div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                        <img
                                          src={userAvatar || `https://ui-avatars.com/api/?name=${username}&background=random`}
                                          className="w-full h-full object-cover"
                                          alt=""
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white leading-tight">{displayName || username}</span>
                                        <span className="text-[8px] text-white/40">@{username}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Items List - Todos Expandidos */}
                                <div className="space-y-2">
                                  {cart.map((item, idx) => (
                                    <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-[20px] p-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                          <img
                                            src={item?.img || item?.image}
                                            alt=""
                                            className="w-full h-full object-contain p-1"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = 'https://i.postimg.cc/5tSsMDgK/logo-4x.png';
                                            }}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-tight mb-0.5">
                                            {item?.game || 'Roblox Limitados'}
                                          </p>
                                          <p className="text-[11px] font-black text-white truncate leading-tight mb-1">{item?.name}</p>
                                          <p className="text-[9px] text-blue-400 font-bold uppercase">{item?.rarity || item?.category || 'In-Game'}</p>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[10px] font-black text-white/40">S/ {((item?.price || 0) * (item?.qty || 1)).toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Trustpilot-style Rating Card */}
                              <div className="hidden lg:block bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-4 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                      <div key={i} className="w-5 h-5 bg-[#00b67a] flex items-center justify-center rounded-sm">
                                        <Star size={12} className="text-white fill-white" />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="text-[11px] font-bold text-white">Excelente <span className="text-white/40">5,00 Estrellas</span></div>
                                </div>
                                <p className="text-[9px] text-white/30 leading-tight">
                                  Basado en <span className="text-white/60 font-bold">+50,000 entregas</span> y <span className="text-white/60 font-bold">5.775 reseñas</span> verificadas
                                </p>
                              </div>

                              {/* Average Rating Card */}
                              <div className="hidden lg:flex bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-5 items-center justify-center gap-3">
                                <span className="text-2xl font-black text-white">5.0</span>
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center leading-tight">de calificación<br />promedio</span>
                              </div>

                              <div className="mt-8 flex items-center gap-2 justify-center opacity-40">
                                <Lock size={12} className="text-white" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Tu información está segura</span>
                              </div>
                            </>
                          ) : isRobuxOnly ? (
                            <div className="space-y-2.5 mb-5">
                              {/* Robux Header */}
                              <div className="bg-white/[0.03] border border-white/10 rounded-[24px] p-2.5">
                                <div className="flex items-center gap-3 mb-1.5">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <img src="/images/robux-logo.svg" className="w-7 h-7 object-contain filter brightness-0 invert" alt="Robux" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-black text-white mb-1">{amount.toLocaleString('es-CO')} Robux</div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                        <Shield className="w-2.5 h-2.5 text-blue-400" />
                                        <span className="text-[9px] font-semibold text-blue-400">{deliveryMethod === 'group' ? 'Grupo' : 'Gamepass'}</span>
                                      </div>
                                      <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                        <Shield className="w-2.5 h-2.5 text-blue-400" />
                                        <span className="text-[9px] font-semibold text-blue-400">Pago protegido</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pl-[60px] pt-1">
                                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                    <img
                                      src={userAvatar || `https://ui-avatars.com/api/?name=${username}&background=random`}
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-white leading-tight">{displayName || username}</span>
                                    <span className="text-[8px] text-white/40">@{username}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Average Rating Card */}
                              <div className="bg-white/[0.02] border border-white/[0.06] rounded-[20px] px-4 py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-black text-white">5.0</span>
                                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                </div>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Calificación promedio</span>
                              </div>
                            </div>
                          ) : isTrade ? (
                            <div className="space-y-3 mb-5">
                              {/* Trade Header */}
                              <div className="bg-white/[0.03] border border-white/10 rounded-[24px] p-3">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-xl font-black text-blue-400">
                                    {cart.length}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-black text-white mb-1">{cart.length} {cart.length === 1 ? 'Artículo' : 'Artículos'} Limitados</div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                        <Zap className="w-2.5 h-2.5 text-blue-400" />
                                        <span className="text-[9px] font-semibold text-blue-400">Trade In-Game</span>
                                      </div>
                                      <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                        <Shield className="w-2.5 h-2.5 text-blue-400" />
                                        <span className="text-[9px] font-semibold text-blue-400">Pago protegido</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pl-[60px]">
                                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                    <img
                                      src={userAvatar || `https://ui-avatars.com/api/?name=${username}&background=random`}
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-white leading-tight">{displayName || username}</span>
                                    <span className="text-[8px] text-white/40">@{username}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Target Items (To Buy) - Lista Expandida */}
                              <div className="space-y-2">
                                {cart.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                      <img src={item?.img || item?.image} alt="" className="w-full h-full object-contain p-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-0.5">Item a recibir</p>
                                      <p className="text-xs font-bold text-white truncate">{item?.name}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Separator Line */}
                              <div className="border-t border-white/[0.08]"></div>

                              {/* Trade Item (To Give) */}
                              <div className="flex items-center gap-3 p-2.5 bg-white/[0.015] border border-dashed border-white/10 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                  <img src={state.tradeItem?.thumbnail} alt="" className="w-full h-full object-contain p-1 opacity-60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-0.5">Tu Item (Trade)</p>
                                  <p className="text-xs font-bold text-white/40 truncate">{state.tradeItem?.name}</p>
                                </div>
                              </div>
                            </div>
                          ) : isIngame && cart.length > 0 ? (
                            <div className="space-y-3 mb-5">
                              {/* Header Summary */}
                              <div className="bg-white/[0.03] border border-white/10 rounded-[24px] p-3">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-xl font-black text-blue-400">
                                    {cart.length}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-black text-white mb-1">{cart.length} {cart.length === 1 ? 'Artículo' : 'Artículos'} del Catálogo</div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex items-center gap-1 px-1 py-px rounded-lg bg-blue-500/[0.08]">
                                        <Shield className="w-2.5 h-2.5 text-blue-400" />
                                        <span className="text-[9px] font-semibold text-blue-400">Pago protegido</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pl-[60px]">
                                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                    <img
                                      src={userAvatar || `https://ui-avatars.com/api/?name=${username}&background=random`}
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-white leading-tight">{displayName || username}</span>
                                    <span className="text-[8px] text-white/40">@{username}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Items List Expandida */}
                              <div className="space-y-2">
                                {cart.map((item, idx) => (
                                  <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-[20px] p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                        <img
                                          src={item?.img || item?.image}
                                          alt=""
                                          className="w-full h-full object-contain p-1"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://i.postimg.cc/5tSsMDgK/logo-4x.png';
                                          }}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-tight mb-0.5">
{item?.category || 'Artículo'}
                                        </p>
                                        <p className="text-[11px] font-black text-white truncate leading-tight mb-1">{item?.name}</p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-[10px] font-black text-white/40">S/ {((item?.price || 0) * (item?.qty || 1)).toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                                <div className="flex items-start gap-3 mb-5">
                                  <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <img src="/images/robux-logo.svg" alt="Robux" className="w-7 h-7" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <span className="text-sm font-bold text-white">{amount.toLocaleString('es-CO')} Robux</span>
                                      <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <svg className="w-3 h-3 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>
                                      <span className="text-xs text-white/40">Cantidad: {amount.toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-white/80 leading-tight">{displayName || username}</span>
                                        <span className="text-[8px] text-white/40">@{username}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                          )}

                        </div>
                      </motion.div>


                      {/* Stats Carousel */}
                      <div className="hidden lg:block relative rounded-2xl px-5 py-5 mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
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
                      <button
                        onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] text-xs text-white/35 hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                          <span>¿No ves tu método de pago?</span>
                        </div>
                        <motion.svg
                          animate={{ rotate: isCountrySelectorOpen ? 180 : 0 }}
                          className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>

                      <AnimatePresence>
                        {isCountrySelectorOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-2"
                          >
                            <div
                              className="p-2 rounded-2xl overflow-hidden max-h-[210px] overflow-y-auto custom-scrollbar border z-10"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <div className="flex flex-col gap-2 relative z-10">
                                {/* Global Sticker Button */}
                                <motion.button
                                  onClick={() => setSelectedCountry('')}
                                  whileHover={{ y: -1.2, x: -0.5 }}
                                  whileTap={{ y: 0.8, x: 0.4 }}
                                  className={`group relative h-[44px] flex items-center px-3 rounded-xl border overflow-hidden transition-all duration-200 outline-none cursor-pointer ${selectedCountry === ''
                                    ? 'bg-blue-600/10 border-blue-500/80 shadow-[2px_2px_0px_0px_rgba(59,130,246,0.25)] text-white'
                                    : 'bg-[#1e293b]/40 border-white/10 text-white/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:border-white/20 hover:text-white hover:bg-[#1e293b]/60'
                                    }`}
                                >
                                  {selectedCountry === '' && (
                                    <motion.div
                                      layoutId="activeCountrySticker"
                                      className="absolute inset-0 bg-blue-500/[0.04] rounded-[11px]"
                                      transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                                    />
                                  )}
                                  <div className="relative z-10 flex items-center gap-3 w-full">
                                    <div className={`w-7 h-5 rounded flex items-center justify-center border ${selectedCountry === '' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/30'} transition-all duration-200`}>
                                      <Globe className="w-3 h-3" />
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] text-left transition-colors duration-200`}>Global (Todos)</span>
                                  </div>

                                  {/* Adidas-style decorative lines (Commented out per request)
                                <div className="absolute right-[20px] top-0 bottom-0 flex gap-[12px] pointer-events-none select-none">
                                  <div className={`w-[8px] h-full skew-x-[-25deg] transition-colors duration-300 ${selectedCountry === '' ? 'bg-blue-400/30' : 'bg-white/[0.03] group-hover:bg-white/10'}`} />
                                  <div className={`w-[8px] h-full skew-x-[-25deg] transition-colors duration-300 ${selectedCountry === '' ? 'bg-blue-400/30' : 'bg-white/[0.03] group-hover:bg-white/10'}`} />
                                </div>
                                */}
                                </motion.button>

                                {/* Country Sticker Buttons */}
                                {(countries || []).map((c) => (
                                  <motion.button
                                    key={c.code}
                                    onClick={() => setSelectedCountry(c.code)}
                                    whileHover={{ y: -1.2, x: -0.5 }}
                                    whileTap={{ y: 0.8, x: 0.4 }}
                                    className={`group relative h-[44px] flex items-center px-3 rounded-xl border overflow-hidden transition-all duration-200 outline-none cursor-pointer ${selectedCountry === c.code
                                      ? 'bg-blue-600/10 border-blue-500/80 shadow-[2px_2px_0px_0px_rgba(59,130,246,0.25)] text-white'
                                      : 'bg-[#1e293b]/40 border-white/10 text-white/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:border-white/20 hover:text-white hover:bg-[#1e293b]/60'
                                      }`}
                                  >
                                    {selectedCountry === c.code && (
                                      <motion.div
                                        layoutId="activeCountrySticker"
                                        className="absolute inset-0 bg-blue-500/[0.04] rounded-[9px]"
                                        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                                      />
                                    )}
                                    <div className="relative z-10 flex items-center gap-3 w-full">
                                      <img
                                        src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                                        className="w-7 h-5 object-cover rounded shadow-md border border-white/10 shrink-0"
                                        alt=""
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                      <span className={`text-[9px] font-black uppercase tracking-[0.15em] text-left transition-colors duration-200 ${selectedCountry === c.code ? 'text-blue-300 font-extrabold' : ''}`}>{c.name}</span>
                                    </div>

                                    {selectedCountry === c.code && (
                                      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                                        <img
                                          src={`https://flagcdn.com/w80/${c.code.toLowerCase()}.png`}
                                          className="absolute inset-0 w-full h-full object-cover blur-[16px] scale-150 opacity-[0.22] saturate-[1.4]"
                                          alt=""
                                        />
                                      </div>
                                    )}

                                    {/* Adidas-style decorative lines (Commented out per request)
                                  <div className="absolute right-[20px] top-0 bottom-0 flex gap-[12px] pointer-events-none select-none">
                                    <div className={`w-[8px] h-full skew-x-[-25deg] transition-colors duration-300 ${selectedCountry === c.code ? 'bg-blue-400/30' : 'bg-white/[0.03] group-hover:bg-white/10'}`} />
                                    <div className={`w-[8px] h-full skew-x-[-25deg] transition-colors duration-300 ${selectedCountry === c.code ? 'bg-blue-400/30' : 'bg-white/[0.03] group-hover:bg-white/10'}`} />
                                  </div>
                                  */}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* RIGHT col */}
                  <div className={isSpecialGame ? "lg:h-full lg:grid lg:grid-rows-[1fr_auto] relative z-20 px-4 py-4 lg:py-0 lg:px-0" : "flex flex-col px-4 lg:px-6 py-4 lg:py-6 overflow-y-auto custom-scrollbar"}>
                    <div className={isSpecialGame ? "lg:h-0 lg:min-h-full lg:overflow-y-auto scrollbar-hide" : ""}>
                      <div className={isSpecialGame ? "w-full max-w-[892px] lg:px-6 lg:px-8 lg:pt-10 lg:pb-6 mx-0" : ""}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.35)' }}>
                          <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-white/[0.10] overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={
                                isFortnite 
                                  ? (storeUser?.avatar?.startsWith('http') 
                                      ? storeUser.avatar 
                                      : storeUser?.avatar 
                                        ? `${SERVER_URL}${storeUser.avatar}` 
                                        : `https://ui-avatars.com/api/?name=${state.fortniteData?.fortniteUsername || username}&background=random`)
                                  : (userAvatar || `${SERVER_URL}/api/users/avatar/${userId}`)
                              }
                              alt={isFortnite ? state.fortniteData?.fortniteUsername || username : username} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=random';
                              }}
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-bold text-white leading-tight truncate">{isFortnite ? (state.fortniteData?.fortniteUsername || username) : (displayName || username)}</span>
                            <span className="text-[9px] text-white/40 truncate">@{isFortnite ? state.fortniteData?.fortniteUsername || username : username}</span>
                          </div>
                        {/* Solo mostrar botón de cambiar usuario para Robux normales (no in-game, MM2 o limiteds) */}
                        {!isIngame && !isMM2 && !isLimiteds && !isTrade && !isFortnite && (
                          <button
                            onClick={() => {
                              setIsChangeUserModalOpen(true);
                              setChangeUserStep(1);
                              setSelectedUser(null);
                              setSearchQuery('');
                              setExistingGamepasses([]);
                              setSelectedGamepass(null);
                              setGroupVerificationResults(null);
                            }}
                            className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                          >
                            Cambiar
                          </button>
                        )}
                      </div>

                      {(!isMM2 && !isLimiteds) && (
                        <>
                          {!showDiscount ? (
                            <button
                              onClick={() => setShowDiscount(true)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl mb-4 transition-all bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                            >
                              <Tag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="text-xs text-white/90 font-bold uppercase tracking-wider">¿Tienes un código?</span>
                              <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Aplícalo aquí</span>
                            </button>
                          ) : (
                            <div className="mb-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl p-3 shadow-lg relative overflow-hidden">
                              <div className="absolute top-[-30px] right-[-30px] size-20 bg-blue-500/10 rounded-full blur-xl"></div>
                              {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3.5 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                                    <div>
                                      <span className="block text-[10px] font-black text-white tracking-wider uppercase">{appliedCoupon.code}</span>
                                      <span className="block text-[9px] text-emerald-400 font-black uppercase mt-0.5 tracking-widest">
                                        -{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `S/${appliedCoupon.discountValue}`} DTO
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={handleRemoveCoupon}
                                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Aplicar Cupón</span>
                                    <button 
                                      type="button"
                                      onClick={(e) => { 
                                        e.preventDefault();
                                        e.stopPropagation(); 
                                        setShowDiscount(false); 
                                        setCode(''); 
                                        setCouponError(''); 
                                      }} 
                                      className="relative z-10 p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all font-black cursor-pointer shrink-0"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                                      <input
                                        type="text"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                        placeholder="CÓDIGO"
                                        className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-white bg-black/30 border border-white/5 placeholder:text-white/20 focus:border-blue-500/50 focus:outline-none transition-all font-black font-mono tracking-wider"
                                      />
                                    </div>
                                    <button
                                      onClick={handleValidateCoupon}
                                      disabled={isValidatingCoupon || !code.trim()}
                                      className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white disabled:opacity-50 transition-all flex items-center justify-center min-w-[80px] shadow-md"
                                    >
                                      {isValidatingCoupon ? <Loader2 className="animate-spin" size={12} /> : 'Validar'}
                                    </button>
                                  </div>
                                  {couponError && (
                                    <p className="text-[8px] font-black text-red-400 uppercase tracking-widest px-1 mt-1">{couponError}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </>
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
                            className={`rounded-2xl border p-3 ${isSpecialGame ? 'border-transparent border-b-0 mb-0 rounded-b-none' : 'border-transparent mb-4'}`}
                          >
                            <div className="space-y-2">
                              {paymentMethods
                                .filter((m) => !selectedCountry || m.country === selectedCountry)
                                .map((m) => (
                                  <motion.button
                                    key={m.id}
                                    onClick={() => setSelected(m.id)}
                                    whileHover={{ scale: 1.005, x: 2 }}
                                    whileTap={{ scale: 0.995 }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#262E40] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#2a3447] transition-all group relative overflow-hidden"
                                    style={{
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)'
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/[0.02] to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="w-11 h-11 rounded-xl bg-[#28364B] border border-white/[0.1] flex items-center justify-center overflow-hidden p-2 shrink-0 relative z-10 shadow-inner">
                                      <img src={m.image.startsWith('http') ? m.image : `${SERVER_URL}${m.image}`} className="w-full h-full object-contain" alt={m.name} />
                                    </div>

                                    <div className="flex-1 text-left relative z-10">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{m.name}</span>
                                        {m.isManual && (
                                          <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 uppercase tracking-wider border border-amber-500/30">Manual</span>
                                        )}
                                        {m.recommended && (
                                          <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 uppercase tracking-wider border border-blue-500/30">Recomendado</span>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-white/40 line-clamp-1">{m.description || 'Transferencia inmediata y segura'}</p>
                                    </div>

                                    <div className="flex items-center gap-2 relative z-10">
                                      <div className="w-5 h-5 rounded-full border-2 border-white/[0.15] flex items-center justify-center group-hover:border-blue-400/50 transition-all">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  </motion.button>
                                ))}
                            </div>
                            {paymentMethods.filter((m) => !selectedCountry || m.country === selectedCountry).length === 0 && (
                              <div className="text-center py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                No hay métodos de pago disponibles para este país.
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${isSpecialGame ? 'gap-0' : 'gap-4'}`}
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

                            <div className={`border p-6 shadow-lg ${isSpecialGame ? 'bg-white/[0.02] border-x border-t border-white/[0.06] border-b-0 rounded-t-3xl rounded-b-none mt-4' : 'bg-[#0F172A]/80 rounded-3xl border-white/[0.06]'}`}>
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
                                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copiedField === field.label
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

                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </div>
                    </div>

                    {/* Footer desktop */}
                    {isSpecialGame && (
                      <div className="hidden lg:block relative z-30">
                        <div className="w-full max-w-[892px] px-6 lg:px-8 py-6 mx-0 relative z-10">
                          <div className="rounded-3xl border border-white/[0.06] bg-[#111827]/60 px-5 py-4">
                            {appliedCoupon && (
                              <div className="space-y-2 pb-3 mb-3 border-b border-white/[0.04]">
                                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
                                  <span>Subtotal</span>
                                  <span>S/ {baseTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                  <span className="flex items-center gap-1"><Tag size={10} /> Descuento ({appliedCoupon.code})</span>
                                  <span>-S/ {discountAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Total a pagar</span>
                              <div className="text-right">
                                <div className="flex items-baseline justify-end gap-1">
                                  <span className="text-2xl font-black text-white">S/ {finalTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={handleSubmitOrder}
                              disabled={isLoading || !receipt || !selected}
                              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${isLoading || !receipt || !selected
                                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                : 'bg-[#0a1035] text-white border border-cyan-400/30 hover:bg-[#0f1545] active:scale-[0.98]'
                                }`}
                            >
                              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                              {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {isSpecialGame && (
            <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden border-t border-white/10 bg-[#0F172A]">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Total a pagar</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-white">S/ {finalTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-2">
                    <span className="flex items-center gap-1"><Tag size={10} /> Descuento ({appliedCoupon.code})</span>
                    <span>-S/ {discountAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <button
                  onClick={handleSubmitOrder}
                  disabled={isLoading || !receipt || !selected}
                  className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${isLoading || !receipt || !selected
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-[#0a1035] text-white border border-cyan-400/30 hover:bg-[#0f1545] active:scale-[0.98]'
                    }`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>
          )}
          </>
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
                            <h4 className="text-sm font-bold text-white leading-tight">{user.displayName || user.name}</h4>
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

      {/* Modal de Cambio de Usuario */}
      <AnimatePresence>
        {isChangeUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChangeUserModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[560px] bg-[#0d0c22] border border-blue-500/20 rounded-[24px] overflow-visible shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.15), transparent 60%)'
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      {deliveryMethod === 'gamepass' ? 'Cambiar Gamepass' : 'Cambiar Grupo'}
                    </h2>
                    <p className="text-white/40 text-[11px] font-medium">
                      {changeUserStep === 1 && 'Busca tu cuenta de Roblox'}
                      {changeUserStep === 2 && deliveryMethod === 'gamepass' && 'Verifica tu gamepass'}
                      {changeUserStep === 2 && deliveryMethod === 'group' && 'Verifica tus grupos'}
                      {changeUserStep === 3 && '¡Verificado exitosamente!'}
                    </p>
                  </div>
                  <button onClick={() => setIsChangeUserModalOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>
                
                {/* PASO 1: Buscar Usuario */}
                {changeUserStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6"
                  >
                    {/* Progress Bar */}
                    <div className="flex items-center justify-center gap-0 my-8 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                          <Search size={14} className="text-white" />
                        </div>
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">BUSCAR</span>
                      </div>
                      <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                          {deliveryMethod === 'gamepass' ? (
                            <Tag size={14} className="text-white/20" />
                          ) : (
                            <Users size={14} className="text-white/20" />
                          )}
                        </div>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                          {deliveryMethod === 'gamepass' ? 'GAMEPASS' : 'GRUPO'}
                        </span>
                      </div>
                      <div className="flex-1 h-[1px] bg-white/10 mx-2 mt-[-18px]"></div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 bg-[#1a1835] border border-white/5 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-white/20" />
                        </div>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">VERIFICADO</span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="relative mt-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 z-10">
                      <Search size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Usuario de Roblox..." 
                      value={searchQuery}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (selectedUser) {
                          setSelectedUser(null);
                          setGroupVerificationResults(null);
                        }
                        setUserError(null);
                        setIsDropdownOpen(true);
                      }}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/5 transition-all shadow-inner relative z-0"
                    />
                    
                    {/* Dropdown de usuarios recientes con animaciones */}
                    <div
                      className={`absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-gradient-to-b from-[#0d0c22] to-[#0a0919] border border-blue-500/20 rounded-2xl overflow-hidden origin-top transition-all duration-[400ms] shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${
                        isDropdownOpen && recentUsers.length > 0 && !selectedUser
                          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                          : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
                      }`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        backdropFilter: 'blur(12px)',
                        animation: isDropdownOpen ? 'containerVibrate 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none',
                        animationDelay: '0.15s'
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-500/10 bg-blue-500/5">
                        <Clock size={13} className="text-blue-400/60" />
                        <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider">Recientes</span>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto scrollbar-hide">
                        {recentUsers.map((user, idx) => (
                          <React.Fragment key={user.id}>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setSearchQuery(user.name);
                                setUserError(null);
                                setIsDropdownOpen(false);
                                setGroupVerificationResults(null);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition-all text-left group rounded-xl ${
                                isDropdownOpen ? 'animate-[itemSlideIn_1.1s_cubic-bezier(0.22,1,0.36,1)_both]' : ''
                              }`}
                              style={{
                                animationDelay: '0.08s'
                              }}
                            >
                              <div className={`w-10 h-10 rounded-2xl overflow-hidden bg-blue-500/10 border border-blue-500/20 shrink-0 group-hover:border-blue-500/40 transition-all ${
                                isDropdownOpen ? 'animate-[avatarAppear_1.1s_cubic-bezier(0.22,1,0.36,1)_forwards]' : ''
                              }`}
                              style={{
                                animationDelay: '0.08s'
                              }}>
                                <img 
                                  src={`${BASE_URL}/users/avatar/${user.id || user.userId}`}
                                  className="w-full h-full object-cover" 
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=0D8ABC&color=fff`;
                                  }}
                                />
                              </div>
                              <div className={`flex-1 min-w-0 ${
                                isDropdownOpen ? 'animate-[textTurbulence_1.1s_cubic-bezier(0.22,1,0.36,1)_forwards]' : ''
                              }`}
                              style={{
                                animationDelay: '0.08s'
                              }}>
                                <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{user.displayName || user.name}</p>
                                <p className="text-xs text-white/40 truncate group-hover:text-white/60 transition-colors">@{user.name}</p>
                              </div>
                              <ArrowRight size={14} className="text-white/10 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                            {idx < recentUsers.length - 1 && (
                              <div className="border-t border-white/[0.04]" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  {userError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-xs font-bold text-red-400">{userError}</p>
                    </div>
                  )}

                  {selectedUser && (
                    <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                        <img 
                          src={`${BASE_URL}/users/avatar/${selectedUser.id || selectedUser.userId}`}
                          className="w-full h-full object-cover" 
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedUser.name || 'User'}&background=0D8ABC&color=fff`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{selectedUser.displayName || selectedUser.name}</p>
                        <p className="text-xs text-white/40">@{selectedUser.name}</p>
                      </div>
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                  )}

                  <button 
                    onClick={async () => {
                      if (isLoadingUser) return;
                      
                      if (!searchQuery.trim()) {
                        setUserError('Ingresa un nombre de usuario');
                        return;
                      }

                      // Si ya hay un usuario seleccionado, avanzar al paso 2
                      if (selectedUser) {
                        const updated = [selectedUser, ...recentUsers.filter(u => u.id !== selectedUser.id)].slice(0, 5);
                        setRecentUsers(updated);
                        localStorage.setItem('roblox_recent_users', JSON.stringify(updated));
                        setChangeUserStep(2);
                        return;
                      }

                      setIsLoadingUser(true);
                      setUserError(null);

                      try {
                        const result = await RobloxAPI.searchUser(searchQuery.trim());
                        if (result && result.data && result.data.length > 0) {
                          const user = result.data[0];
                          setSelectedUser(user);
                          setGroupVerificationResults(null);
                          // Guardar en recientes
                          const updated = [user, ...recentUsers.filter(u => u.id !== user.id)].slice(0, 5);
                          setRecentUsers(updated);
                          localStorage.setItem('roblox_recent_users', JSON.stringify(updated));
                        } else {
                          setUserError('Usuario no encontrado. Verifica el nombre exacto de Roblox.');
                        }
                      } catch (error) {
                        console.error('Error buscando usuario:', error);
                        setUserError('Error al buscar el usuario. Intenta de nuevo más tarde.');
                      } finally {
                        setIsLoadingUser(false);
                      }
                    }}
                    disabled={isLoadingUser}
                    className="w-full p-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-2xl font-black text-sm transition-all shadow-[0_12px_24px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 tracking-wider"
                  >
                    {isLoadingUser ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Buscando...</span>
                      </>
                    ) : selectedUser ? (
                      <>
                        <ArrowRight size={18} />
                        <span>Continuar</span>
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        <span>Buscar Usuario</span>
                      </>
                    )}
                  </button>
                    </div>
                  </motion.div>
                )}

                {/* PASO 2: Verificar Gamepass - AUTOMÁTICO */}
                {changeUserStep === 2 && deliveryMethod === 'gamepass' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6"
                  >
                    {isLoadingGamepass && existingGamepasses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                        <p className="text-white font-bold text-sm">Verificando gamepasses...</p>
                        <p className="text-white/40 text-xs mt-1">Buscando gamepass con precio {gamepassRequiredPrice.toLocaleString()} R$</p>
                      </div>
                    ) : (
                    <div className="space-y-4">
                      {/* Precio requerido */}
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                            <div className="relative w-5 h-5">
                              <Tag size={20} />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Precio requerido</h4>
                            <p className="text-lg font-black text-white">{gamepassRequiredPrice.toLocaleString()} R$</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(gamepassRequiredPrice.toString())}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-[11px] font-bold transition-colors border border-white/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          Copiar
                        </button>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                        <HelpCircle size={14} className="text-amber-500 flex-shrink-0" />
                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wide">Desactiva "Precios Regionales" en tu gamepass</span>
                      </div>

                      {/* Instrucciones */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { num: 1, text: "Abre Roblox Create" },
                          { num: 2, text: "Crea un Gamepass en tu juego" },
                          { num: 3, text: "Desactiva precios regionales" },
                          { num: 4, text: `Pon el precio exacto: ${gamepassRequiredPrice.toLocaleString()} R$` }
                        ].map(step => (
                          <div key={step.num} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400">
                              {step.num}
                            </div>
                            <span className="text-xs font-bold text-white/80">{step.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Botones de editar/crear */}
                      <div className="pt-2 flex flex-col gap-3 items-center w-full">
                        {existingGamepasses.length > 0 && !selectedGamepass && (
                          <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-1 flex items-center gap-2.5">
                            <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 shrink-0">
                              <HelpCircle size={12} />
                            </div>
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight">
                              El precio es incorrecto. Cámbialo aquí:
                            </p>
                          </div>
                        )}

                        {existingGamepasses.length > 0 && existingGamepasses[0].universeId && (
                          <button 
                            onClick={() => window.open(`https://create.roblox.com/dashboard/creations/experiences/${existingGamepasses[0].universeId}/passes/${existingGamepasses[0].id}/sales`, '_blank')}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl text-white/80 text-xs font-bold transition-all shadow-sm">
                            <Edit2 size={14} className="text-white/40" />
                            Editar gamepass existente ({existingGamepasses[0].price} R$) <Globe size={12} className="text-white/40 ml-1" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => {
                            if (existingGamepasses.length > 0 && existingGamepasses[0].universeId) {
                              window.open(`https://create.roblox.com/dashboard/creations/experiences/${existingGamepasses[0].universeId}/passes`, '_blank');
                            } else {
                              window.open('https://create.roblox.com/dashboard/creations', '_blank');
                            }
                          }}
                          className="text-[11px] font-bold text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                          O crear uno nuevo <Globe size={10} />
                        </button>
                      </div>

                      {/* Botón verificar de nuevo */}
                      <button 
                        onClick={async () => {
                          setIsLoadingGamepass(true);
                          setUserError(null);
                          try {
                            const placesRes = await RobloxAPI.getUserPlaces(selectedUser.id);
                            if (placesRes.data && placesRes.data.length > 0) {
                              let allGp: any[] = [];
                              for (const place of placesRes.data) {
                                const gpRes = await RobloxAPI.getPlaceGamepasses(place.id, selectedUser.id);
                                if (gpRes.data) {
                                  allGp = [...allGp, ...gpRes.data.map((gp: any) => ({
                                    ...gp,
                                    universeId: place.universeId,
                                    placeId: place.id
                                  }))];
                                }
                              }
                              setExistingGamepasses(allGp);
                              
                              const found = allGp.find(gp => gp.price === gamepassRequiredPrice);
                              
                              if (found) {
                                setSelectedGamepass(found);
                                setChangeUserStep(3);
                              } else {
                                setUserError('No se encontró el gamepass con el precio correcto');
                              }
                            }
                          } catch (error) {
                            setUserError('Error al verificar gamepass');
                          } finally {
                            setIsLoadingGamepass(false);
                          }
                        }}
                        disabled={isLoadingGamepass}
                        className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 uppercase tracking-wider"
                      >
                        {isLoadingGamepass ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Verificando...</span>
                          </>
                        ) : (
                          <>
                            Verificar de nuevo <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" className="animate-spin-custom"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.72 2.78L21 8"/><path d="M21 3v5h-5"/></svg>
                          </>
                        )}
                      </button>

                      {userError && (
                        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                          <HelpCircle size={14} className="text-red-400 flex-shrink-0" />
                          <span>{userError}</span>
                        </div>
                      )}
                    </div>
                    )}
                  </motion.div>
                )}

                {/* PASO 2: Verificar Grupo - AUTOMÁTICO */}
                {changeUserStep === 2 && deliveryMethod === 'group' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6"
                  >
                    {isVerifyingGroups || !groupVerificationResults ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                        <p className="text-white font-bold text-sm">Verificando grupos...</p>
                        <p className="text-white/40 text-xs mt-1">Comprobando membresía en grupos</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Alerta importante */}
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex-shrink-0 flex items-center justify-center text-amber-500">
                              <HelpCircle size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm text-white font-bold mb-1">Importante: 14 días de espera</h4>
                              <p className="text-xs text-white/70 leading-relaxed">
                                Debes permanecer al menos <span className="font-bold text-amber-500">14 días</span> en los grupos para que Roblox permita la transferencia.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Lista de grupos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {groupVerificationResults?.details
                            ?.sort((a: any, b: any) => {
                              const isAMandatory = requiredGroups.find(rg => rg.id === a.groupId)?.isMandatory;
                              const isBMandatory = requiredGroups.find(rg => rg.id === b.groupId)?.isMandatory;
                              if (isAMandatory && !isBMandatory) return -1;
                              if (!isAMandatory && isBMandatory) return 1;
                              return 0;
                            })
                            .map((group: any) => (
                            <div key={group.groupId} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-[24px] flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-xs font-bold text-white leading-tight truncate">{group.groupName}</h4>
                                    {requiredGroups.find(rg => rg.id === group.groupId)?.isMandatory && (
                                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[6px] font-black uppercase tracking-widest rounded border border-blue-500/30">OBLIGATORIO</span>
                                    )}
                                  </div>
                                  {group.isMember ? (
                                    <div className="flex flex-col gap-1.5 mt-1">
                                      <div className="flex items-center gap-1.5">
                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Ya eres miembro</span>
                                      </div>
                                      {group.remainingDays > 0 && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[7px] font-black text-amber-500 w-fit uppercase tracking-wider">
                                          <Clock size={8} />
                                          <span>Faltan {group.remainingDays} días</span>
                                        </div>
                                      )}
                                      {group.remainingDays <= 0 && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[7px] font-black text-emerald-500 w-fit uppercase tracking-wider">
                                          <CheckCircle2 size={8} />
                                          <span>Listo para retiro</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-white/30 text-[9px] mt-1 truncate">Debes unirte a este grupo</p>
                                  )}
                                </div>
                              </div>
                              {!group.isMember && (
                                <a 
                                  href={`https://www.roblox.com/groups/${group.groupId}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-4 py-1.5 bg-white text-[#0d0c22] rounded-xl font-bold text-[10px] hover:scale-105 transition-all shrink-0"
                                >
                                  Unirse
                                </a>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Botón verificar de nuevo / continuar */}
                        <button
                          onClick={async () => {
                            const mandatoryJoined = groupVerificationResults?.details
                              ?.filter((g: any) => requiredGroups.find(rg => rg.id === g.groupId)?.isMandatory)
                              .every((g: any) => g.isMember);

                            if (mandatoryJoined) {
                              setChangeUserStep(3);
                            } else {
                              setIsVerifyingGroups(true);
                              setUserError(null);
                              try {
                                const res = await RobloxAPI.checkUserGroups(selectedUser.id);
                                if (res.success) {
                                  setGroupVerificationResults(res.data);
                                  // Verificar si todos los grupos obligatorios están unidos
                                  const allMandatoryJoined = res.data?.details
                                    ?.filter((g: any) => requiredGroups.find(rg => rg.id === g.groupId)?.isMandatory)
                                    .every((g: any) => g.isMember);
                                  if (allMandatoryJoined) {
                                    setChangeUserStep(3);
                                  }
                                }
                              } catch (error) {
                                setUserError('Error al verificar grupos');
                              } finally {
                                setIsVerifyingGroups(false);
                              }
                            }
                          }}
                          disabled={isVerifyingGroups}
                          className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 uppercase tracking-wider"
                        >
                          {isVerifyingGroups ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Verificando...</span>
                            </>
                          ) : (
                            <>
                              {(() => {
                                const mandatoryJoined = groupVerificationResults?.details
                                  ?.filter((g: any) => requiredGroups.find(rg => rg.id === g.groupId)?.isMandatory)
                                  .every((g: any) => g.isMember);
                                return mandatoryJoined ? 'Continuar' : 'Verificar nuevamente';
                              })()}
                              <ArrowRight size={16} strokeWidth={3} />
                            </>
                          )}
                        </button>

                        {userError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400">
                            {userError}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* PASO 3: Verificado */}
                {changeUserStep === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6"
                  >
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-black/40 rounded-xl overflow-hidden border border-emerald-500/30 shrink-0 flex items-center justify-center">
                          {deliveryMethod === 'gamepass' ? (
                            selectedGamepass?.thumbnail ? (
                              <img src={selectedGamepass.thumbnail} className="w-full h-full object-cover" alt="Gamepass" />
                            ) : (
                              <Tag size={20} className="text-emerald-500/50" />
                            )
                          ) : (
                            <Users size={20} className="text-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0 truncate">
                          <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                            {deliveryMethod === 'group' ? '¡Grupos Verificados!' : '¡Encontrado!'}
                          </h4>
                          {deliveryMethod === 'gamepass' ? (
                            <>
                              <p className="text-sm font-black text-white truncate">{selectedGamepass?.name}</p>
                              <p className="text-xs text-white/50">{selectedGamepass?.price} R$</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-black text-white truncate">{selectedUser?.displayName || selectedUser?.name}</p>
                              <p className="text-xs text-white/40">@{selectedUser?.name}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      </div>
                    </div>

                    <button 
                      onClick={async () => {
                        // Actualizar el checkout con el nuevo usuario
                        const newState = {
                          ...state,
                          username: selectedUser.name,
                          displayName: selectedUser.displayName || selectedUser.name,
                          userId: selectedUser.id,
                        };
                        
                        // Solo agregar datos de gamepass si es método gamepass
                        if (deliveryMethod === 'gamepass' && selectedGamepass) {
                          newState.gamepassId = selectedGamepass.id;
                          newState.gamepassName = selectedGamepass.name;
                          newState.gamepassPrice = selectedGamepass.price;
                          newState.universeId = selectedGamepass.universeId;
                          newState.placeId = selectedGamepass.placeId;
                        }
                        
                        // Actualizar usuario actual
                        setCurrentUser({ name: selectedUser.name, id: selectedUser.id });
                        
                        // Actualizar avatar
                        try {
                          const avatarUrl = `${BASE_URL}/users/avatar/${selectedUser.id || selectedUser.userId}`;
                          setUserAvatar(avatarUrl);
                        } catch (error) {
                          console.error('Error actualizando avatar:', error);
                        }
                        
                        // Cerrar modal
                        setIsChangeUserModalOpen(false);
                        
                        // Navegar con el nuevo state
                        navigate('/checkout', { 
                          state: newState,
                          replace: true 
                        });
                      }}
                      className="w-full p-4 bg-[#0a1035] hover:bg-[#0f1545] text-white rounded-2xl font-black text-sm transition-all border border-cyan-400/30 flex items-center justify-center gap-3 tracking-wider active:scale-[0.98]"
                    >
                      <CheckCircle2 size={18} />
                      <span>Confirmar y Continuar</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
