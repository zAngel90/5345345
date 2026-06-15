import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink,
  ShieldCheck,
  LayoutDashboard,
  ShoppingBag,
  History,
  Gamepad2,
  Loader2,
  Image as ImageIcon,
  LayoutGrid,
  Globe,
  X,
  MessageSquare,
  CreditCard,
  Crown,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Zap,
  User,
  CheckCircle2,
  XCircle,
  Ticket,
  Package,
  Filter
} from 'lucide-react';
import { RobloxAPI, StoreAPI, ChatAPI, AuthAPI, SERVER_URL } from '../services/api';

// Sub-components
import GroupsTab from '../components/admin/GroupsTab';
import RobuxTab from '../components/admin/RobuxTab';
import GamesTab from '../components/admin/GamesTab';
import LimitedsTab from '../components/admin/LimitedsTab';
import Mm2Tab from '../components/admin/Mm2Tab';
import CurrenciesTab from '../components/admin/CurrenciesTab';
import ChatsTab from '../components/admin/ChatsTab';
import OrdersTab from '../components/admin/OrdersTab';
import MM2DeliveriesTab from '../components/admin/MM2DeliveriesTab';
import PaymentMethodsTab from '../components/admin/PaymentMethodsTab';
import HomeTab from '../components/admin/HomeTab';
import CategoryIconsTab from '../components/admin/CategoryIconsTab';
import CouponsTab from '../components/admin/CouponsTab';
import FortniteTab from '../components/admin/FortniteTab';

const TABS = [
  { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard, category: 'Main' },
  { id: 'orders', label: 'Pedidos', icon: History, category: 'Operaciones' },
  { id: 'mm2-deliveries', label: 'Entregas MM2', icon: Package, category: 'Operaciones' },
  { id: 'fortnite', label: 'Fortnite', icon: Zap, category: 'Operaciones' },
  { id: 'chats', label: 'Soporte Chat', icon: MessageSquare, category: 'Operaciones' },
  { id: 'products', label: 'Paquetes Robux', icon: ShoppingBag, category: 'Tienda' },
  { id: 'limiteds', label: 'Limiteds / Trade', icon: Crown, category: 'Tienda' },
  { id: 'mm2', label: 'Murder Mystery 2', icon: Zap, category: 'Tienda' },
  { id: 'coupons', label: 'Cupones Descuento', icon: Ticket, category: 'Tienda' },
  { id: 'games', label: 'Juegos & Items', icon: Gamepad2, category: 'Tienda' },
  { id: 'groups', label: 'Grupos Roblox', icon: Users, category: 'Configuración' },
  { id: 'currencies', label: 'Tasas y Monedas', icon: Globe, category: 'Configuración' },
  { id: 'payment-methods', label: 'Métodos de Pago', icon: CreditCard, category: 'Configuración' },
  { id: 'category-icons', label: 'Iconos Categorías', icon: LayoutGrid, category: 'Visual' },
  { id: 'home', label: 'Página Inicio', icon: ImageIcon, category: 'Visual' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin_active_tab') || 'dashboard';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [requiredGroups, setRequiredGroups] = useState<any[]>([]);
  const [robuxPackages, setRobuxPackages] = useState<any[]>([]);
  const [pricePer1000, setPricePer1000] = useState(8.00);
  const [customTiers, setCustomTiers] = useState<any[]>([
    { minAmount: 0, pricePerUnit: 0.030 },
    { minAmount: 500, pricePerUnit: 0.028 }
  ]);
  const [games, setGames] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [limiteds, setLimiteds] = useState<any[]>([]);
  const [mm2Items, setMm2Items] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(() => {
    return localStorage.getItem('admin_selected_game_id');
  });

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedGameId) {
      localStorage.setItem('admin_selected_game_id', selectedGameId);
    } else {
      localStorage.removeItem('admin_selected_game_id');
    }
  }, [selectedGameId]);

  useEffect(() => {
    const token = localStorage.getItem('pixel_token');
    const user = JSON.parse(localStorage.getItem('pixel_user') || '{}');
    if (token && user.role === 'admin') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await AuthAPI.login(loginData);
      if (res.success && res.user.role === 'admin') {
        localStorage.setItem('pixel_token', res.token);
        localStorage.setItem('pixel_user', JSON.stringify(res.user));
        setIsAuthenticated(true);
        fetchData();
      } else {
        showToast('Acceso denegado: Se requieren permisos de administrador', 'error');
      }
    } catch (err) {
      showToast('Error al iniciar sesión', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pixel_token');
    localStorage.removeItem('pixel_user');
    setIsAuthenticated(false);
  };
  
  // Función para iniciar chat desde pedidos
  const handleContactClient = async (orderId: string, userId: string, username: string) => {
    try {
      // Enviamos un mensaje inicial para crear el chat si no existe
      await ChatAPI.sendMessage(`Hola ${username}, te contacto respecto a tu pedido #${orderId}.`, undefined, orderId);
      setActiveTab('chats');
    } catch (err) {
      console.error('Error contacting client:', err);
      showToast('Error al iniciar el chat', 'error');
    }
  };
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{type: 'game' | 'product' | 'paymentMethod' | 'limited' | 'mm2', id: any} | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, robuxRes, gamesRes, productsRes, currenciesRes, ordersRes, paymentsRes, limitedsRes, mm2Res, countriesRes] = await Promise.all([
        RobloxAPI.getGroupsConfig(),
        StoreAPI.getRobuxConfig(),
        StoreAPI.getGamesConfig(),
        StoreAPI.getProducts(),
        StoreAPI.getCurrenciesConfig(),
        StoreAPI.getOrders(),
        StoreAPI.getPaymentMethodsConfig(),
        StoreAPI.getLimitedsConfig(),
        StoreAPI.getMm2Config(),
        StoreAPI.getCountriesConfig()
      ]);

      if (groupsRes.success) setRequiredGroups(groupsRes.data || []);
      if (robuxRes.success) {
        if (Array.isArray(robuxRes.data)) {
          setRobuxPackages(robuxRes.data);
        } else if (robuxRes.data && typeof robuxRes.data === 'object') {
          setRobuxPackages(robuxRes.data.packages || []);
          setPricePer1000(robuxRes.data.pricePer1000 || 8.00);
          if (robuxRes.data.customTiers) {
            setCustomTiers(robuxRes.data.customTiers);
          }
        }
      }
      if (gamesRes.success) setGames(gamesRes.data || []);
      if (currenciesRes.success) setCurrencies(currenciesRes.data || []);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (paymentsRes.success) setPaymentMethods(paymentsRes.data || []);
      if (countriesRes.success) setCountries(countriesRes.data || []);
      if (limitedsRes.success) setLimiteds(limitedsRes.data || []);
      if (mm2Res.success) setMm2Items(mm2Res.data || []);
      setProducts(productsRes || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsSaving(true);
      const res = await fetch(`${SERVER_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pixel_token')}`
        },
        body: formData
      });
      const data = await res.json();
      
      if (data.success && data.url) {
        const imageUrl = data.url;
        
        if (uploadTarget.type === 'game') {
          setGames(games.map(g => g.id === uploadTarget.id ? { ...g, image: imageUrl } : g));
        } else if (uploadTarget.type === 'product') {
          setEditingProduct({ ...editingProduct, image: imageUrl });
        } else if (uploadTarget.type === 'paymentMethod') {
          setPaymentMethods(paymentMethods.map(m => m.id === uploadTarget.id ? { ...m, image: imageUrl } : m));
        } else if (uploadTarget.type === 'limited') {
          setLimiteds(limiteds.map(l => l.id === uploadTarget.id ? { ...l, image: imageUrl } : l));
        } else if (uploadTarget.type === 'mm2') {
          setMm2Items(mm2Items.map(m => m.id === uploadTarget.id ? { ...m, image: imageUrl } : m));
        }
      }
    } catch (err) {
      showToast('Error al subir imagen', 'error');
    } finally {
      setIsSaving(false);
      setUploadTarget(null);
    }
  };

  const triggerUpload = (type: 'game' | 'product' | 'paymentMethod' | 'limited' | 'mm2', id: any) => {
    setUploadTarget({ type, id });
    fileInputRef.current?.click();
  };

  const handleSaveAll = async (type: string) => {
    setIsSaving(true);
    try {
      let res;
      if (type === 'groups') res = await RobloxAPI.updateGroupsConfig(requiredGroups);
      else if (type === 'robux') res = await StoreAPI.updateRobuxConfig({ packages: robuxPackages, pricePer1000, customTiers });
      else if (type === 'games') res = await StoreAPI.updateGamesConfig(games);
      else if (type === 'products') res = await StoreAPI.updateProductsConfig(products);
      else if (type === 'limiteds') res = await StoreAPI.updateLimitedsConfig(limiteds);
      else if (type === 'mm2') res = await StoreAPI.updateMm2Config(mm2Items);
      else if (type === 'currencies') res = await StoreAPI.updateCurrenciesConfig(currencies);
      else if (type === 'payment-methods') {
        res = await StoreAPI.updatePaymentMethodsConfig(paymentMethods);
        await StoreAPI.updateCountriesConfig(countries);
      }

      if (res?.success) showToast('Cambios guardados correctamente', 'success');
      else showToast('Error al guardar: ' + (res?.error || 'Unknown error'), 'error');
    } catch (err) {
      showToast('Error al guardar cambios', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Login Screen Redesign
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative w-full max-w-md bg-[#0a0a16]/80 border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl z-10"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/10 rounded-[32px] mb-6 relative group border border-blue-500/20">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ShieldCheck className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" size={48} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Command Center</h2>
            <p className="text-blue-400 text-xs mt-2 font-bold uppercase tracking-widest">Acceso Restringido</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Usuario de Administrador</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-white/20" />
                </div>
                <input 
                  type="text" 
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all outline-none" 
                  placeholder="admin" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Clave de Seguridad</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-4 h-4 rounded-full border-[3px] border-white/20"></div>
                </div>
                <input 
                  type="password" 
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all outline-none tracking-widest" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <button 
              disabled={isLoggingIn}
              className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] disabled:opacity-50 text-sm uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {isLoggingIn ? (
                <><Loader2 size={18} className="animate-spin" /> Verificando...</>
              ) : (
                <>Autorizar Acceso <ChevronRight size={18} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Grupos de categorías para el sidebar
  const categories = Array.from(new Set(TABS.map(t => t.category)));

  return (
    <div className="h-screen bg-[#03030a] text-white flex overflow-hidden selection:bg-blue-500/30 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

      {/* Ambient glow globally */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[150px] pointer-events-none"></div>

      {/* Modern Sidebar */}
      <aside className="w-[280px] fixed inset-y-0 left-0 bg-[#070712]/95 border-r border-white/5 backdrop-blur-2xl z-50 flex flex-col shadow-2xl">
        <div className="h-24 flex items-center px-8 border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 border border-white/10">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-white">Pixel Admin</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Sistema Online</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 px-4">{category}</h3>
              <div className="space-y-1">
                {TABS.filter(t => t.category === category).map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSelectedGameId(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all relative overflow-hidden group ${
                        isActive 
                          ? 'text-white bg-blue-600/10' 
                          : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                      )}
                      <item.icon size={18} className={isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white transition-colors'} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/[0.05] bg-black/20">
           <div className="flex items-center gap-3 mb-4 px-4">
             <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Users size={18} className="text-white/60" />
             </div>
             <div>
               <p className="text-xs font-bold text-white">Administrador</p>
               <p className="text-[10px] text-white/40">admin@pixel.com</p>
             </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest">
             <LogOut size={16} /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] relative h-screen flex flex-col">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-40 bg-[#03030a]/80 backdrop-blur-2xl border-b border-white/[0.05] px-10 h-24 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-md">
              {TABS.find(t=>t.id===activeTab)?.label}
            </h2>
            <p className="text-white/40 text-[11px] font-bold mt-1 uppercase tracking-widest">Panel de Control &gt; {TABS.find(t=>t.id===activeTab)?.category}</p>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[1400px] mx-auto"
              >
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-[50vh]">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                      <Loader2 className="text-blue-500 animate-spin relative z-10" size={48} />
                    </div>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-6">Sincronizando datos...</p>
                  </div>
                )}

                {!isLoading && (
                  <div className="bg-[#0a0a16] border border-white/[0.05] rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                    {/* Subtle card glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    {activeTab === 'dashboard' && (
                      <div className="py-24 text-center relative z-10">
                        <div className="inline-flex items-center justify-center p-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[40px] mb-8 shadow-xl shadow-blue-500/5">
                          <LayoutDashboard className="text-blue-400" size={64} />
                        </div>
                        <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter drop-shadow-xl">Bienvenido, Admin</h2>
                        <p className="text-white/40 text-sm max-w-lg mx-auto font-medium leading-relaxed">
                          Estás en el centro de control principal de Pixel Store. Desde aquí puedes gestionar pedidos, configurar la tienda, revisar estadísticas y dar soporte a los clientes.
                        </p>
                      </div>
                    )}

                    {activeTab === 'groups' && (
                      <GroupsTab 
                        groups={requiredGroups} 
                        setGroups={setRequiredGroups} 
                        onSave={() => handleSaveAll('groups')} 
                        isSaving={isSaving}
                        isLoading={isLoading}
                      />
                    )}

                    {activeTab === 'products' && (
                      <RobuxTab 
                        packages={robuxPackages} 
                        setPackages={setRobuxPackages} 
                        pricePer1000={pricePer1000}
                        setPricePer1000={setPricePer1000}
                        customTiers={customTiers}
                        setCustomTiers={setCustomTiers}
                        onSave={() => handleSaveAll('robux')} 
                        isSaving={isSaving}
                      />
                    )}

                    {activeTab === 'currencies' && (
                      <CurrenciesTab 
                        currencies={currencies}
                        setCurrencies={setCurrencies}
                        onSave={() => handleSaveAll('currencies')}
                        isSaving={isSaving}
                      />
                    )}

                    {activeTab === 'payment-methods' && (
                      <div className="lg:col-span-3">
                        <PaymentMethodsTab 
                          paymentMethods={paymentMethods} 
                          setPaymentMethods={setPaymentMethods}
                          countries={countries}
                          setCountries={setCountries}
                          onSave={() => handleSaveAll('payment-methods')}
                          isSaving={isSaving}
                          onTriggerUpload={(id) => triggerUpload('paymentMethod', id)}
                          SERVER_URL={SERVER_URL}
                        />
                      </div>
                    )}

                    {activeTab === 'coupons' && (
                      <CouponsTab />
                    )}

                    {activeTab === 'chats' && (
                      <div className="bg-[#05050f]/50 -mx-8 -my-8 h-[calc(100vh-160px)]">
                        <ChatsTab />
                      </div>
                    )}

                    {activeTab === 'games' && (
                      <GamesTab 
                        games={games} 
                        setGames={setGames} 
                        products={products}
                        onSave={() => handleSaveAll('games')} 
                        onTriggerUpload={(id) => triggerUpload('game', id)}
                        onManageItems={(id) => setSelectedGameId(id)}
                        isSaving={isSaving}
                        SERVER_URL={SERVER_URL}
                      />
                    )}

                    {activeTab === 'limiteds' && (
                      <LimitedsTab 
                        limiteds={limiteds}
                        setLimiteds={setLimiteds}
                        onSave={() => handleSaveAll('limiteds')}
                        onTriggerUpload={(id) => triggerUpload('limited', id)}
                        isSaving={isSaving}
                        SERVER_URL={SERVER_URL}
                      />
                    )}
   
                    {activeTab === 'mm2' && (
                      <Mm2Tab 
                        items={mm2Items}
                        setItems={setMm2Items}
                        onSave={() => handleSaveAll('mm2')}
                        onTriggerUpload={(id) => triggerUpload('mm2', id)}
                        isSaving={isSaving}
                        SERVER_URL={SERVER_URL}
                      />
                    )}


                    {activeTab === 'category-icons' && (
                      <CategoryIconsTab 
                        products={products} 
                        mm2Items={mm2Items}
                        limiteds={limiteds}
                      />
                    )}

                    {activeTab === 'orders' && (
                      <OrdersTab orders={orders} onContactClient={handleContactClient} />
                    )}

                    {activeTab === 'mm2-deliveries' && (
                      <MM2DeliveriesTab orders={orders} />
                    )}

                    {activeTab === 'fortnite' && (
                      <FortniteTab showToast={showToast} />
                    )}

                    {activeTab === 'home' && (
                      <HomeTab 
                        SERVER_URL={SERVER_URL}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
        </div>
      </main>

{/* Modal de Producto Rediseñado */}
      <AnimatePresence>
        {showProductModal && editingProduct && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#03030a]/90 backdrop-blur-md" onClick={() => setShowProductModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-[#0a0a16] border border-white/10 rounded-[40px] p-10 overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Editar Producto</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Configuración de Item</p>
                </div>
                <button onClick={() => setShowProductModal(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><X size={20} /></button>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex justify-center">
                  <div onClick={() => triggerUpload('product', editingProduct.id)} className="w-40 h-40 rounded-[32px] border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center cursor-pointer hover:border-blue-500/50 group relative overflow-hidden shadow-inner transition-colors">
                    {editingProduct.image ? <img src={editingProduct.image.startsWith('http') ? editingProduct.image : `${SERVER_URL}${editingProduct.image}`} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-white/10 group-hover:text-blue-500 transition-colors" size={40} />}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                       <span className="text-xs font-bold text-white flex items-center gap-2"><Plus size={16}/> Cambiar Imagen</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Nombre del Item</label>
                     <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Ej: Dragon Fruit" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Precio (PEN)</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">S/</span>
                         <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-5 py-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Precio en Robux</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">R$</span>
                         <input type="number" value={editingProduct.robuxPrice || ''} onChange={(e) => setEditingProduct({ ...editingProduct, robuxPrice: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Asignar a Juego</label>
                       <select value={editingProduct.game} onChange={(e) => setEditingProduct({ ...editingProduct, game: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors appearance-none">
                         {games.map(game => <option key={game.id} value={game.id} className="bg-[#0d0c22] text-white">{game.name}</option>)}
                       </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Categoría</label>
                    <input type="text" value={editingProduct.category || ''} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="Ej: Fruits" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Fondo Card:</span>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                          <input type="color" value={editingProduct.color || '#1a1c20'} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                        </div>
                        <span className="text-white text-[10px] font-mono">{editingProduct.color || '#1a1c20'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Fondo Badge:</span>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                          <input type="color" value={editingProduct.badgeColor || editingProduct.color || '#1a1c20'} onChange={(e) => setEditingProduct({ ...editingProduct, badgeColor: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                        </div>
                        <span className="text-white text-[10px] font-mono">{editingProduct.badgeColor || editingProduct.color || '#1a1c20'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Color Texto Badge:</span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                        <input type="color" value={editingProduct.badgeTextColor || '#ffffff'} onChange={(e) => setEditingProduct({ ...editingProduct, badgeTextColor: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                      </div>
                      <span className="text-white text-[10px] font-mono">{editingProduct.badgeTextColor || '#ffffff'}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] space-y-4">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <Package size={14} /> Distintivo de Estado (Esquina Superior)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/20 uppercase ml-1">Texto (NUEVO, TOP, etc)</label>
                        <input 
                          type="text" 
                          value={editingProduct.badge || ''} 
                          onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value.toUpperCase() })} 
                          placeholder="Ej: TOP"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/20 uppercase ml-1">Icono (Lucide ID)</label>
                        <select 
                          value={editingProduct.badgeIcon || ''} 
                          onChange={(e) => setEditingProduct({ ...editingProduct, badgeIcon: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none"
                        >
                          <option value="" className="bg-[#0d0c22] text-white">Sin Icono</option>
                          <option value="trending-up" className="bg-[#0d0c22] text-white">Tendencia (TOP)</option>
                          <option value="flame" className="bg-[#0d0c22] text-white">Fuego (HOT)</option>
                          <option value="sparkles" className="bg-[#0d0c22] text-white">Destellos (NEW)</option>
                          <option value="star" className="bg-[#0d0c22] text-white">Estrella</option>
                          <option value="zap" className="bg-[#0d0c22] text-white">Rayo</option>
                          <option value="crown" className="bg-[#0d0c22] text-white">Corona</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => { const exists = products.find(p => p.id === editingProduct.id); if (exists) setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p)); else setProducts([...products, editingProduct]); setShowProductModal(false); }} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Catalog Modal */}
      <AnimatePresence>
        {selectedGameId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedGameId(null)}>
            <motion.div 
              initial={{opacity:0, scale:0.95, y:20}} 
              animate={{opacity:1, scale:1, y:0}} 
              exit={{opacity:0, scale:0.95, y:20}}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a16] border border-white/10 rounded-3xl w-full max-w-7xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-6">
                  {(() => {
                    const game = games.find(g => g.id === selectedGameId);
                    const gameImg = game?.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : '';
                    return (
                      <div 
                        onClick={() => triggerUpload('game', selectedGameId)}
                        className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 overflow-hidden bg-black/40 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group relative shrink-0"
                      >
                        {gameImg ? (
                          <img src={gameImg} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" alt="" />
                        ) : (
                          <ImageIcon className="text-white/20 group-hover:text-blue-500 transition-colors" size={24} />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <Plus className="text-white" size={20} />
                        </div>
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Catálogo del Juego</p>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{games.find(g => g.id === selectedGameId)?.name}</h3>
                    <p className="text-white/40 text-sm mt-1">Añade o edita los productos de este juego.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedGameId(null)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs transition-colors">
                    Cerrar
                  </button>
                  <button 
                    onClick={() => { setEditingProduct({ id: Date.now(), name: '', price: 0, game: selectedGameId, image: '', description: '' }); setShowProductModal(true); }} 
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <Plus size={16}/> Nuevo Producto
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.filter(p => p.game === selectedGameId).map(product => (
                    <div key={product.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl group relative hover:border-white/10 hover:bg-white/[0.04] transition-all">
                      <div className="aspect-square bg-black/40 rounded-2xl mb-4 overflow-hidden relative border border-white/5">
                        <img src={product.image?.startsWith('http') ? product.image : `${SERVER_URL}${product.image}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                      </div>
                      <h4 className="text-white font-bold text-sm truncate mb-1">{product.name}</h4>
                      <p className="text-emerald-400 font-black text-[11px] bg-emerald-500/10 inline-block px-2 py-0.5 rounded-md">S/ {product.price} PEN</p>
                      
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                        <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-500 transition-colors">
                          <Settings size={14} />
                        </button>
                        <button onClick={() => setProducts(products.filter(p => p.id !== product.id))} className="p-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 p-4 sm:p-6 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  onClick={() => setSelectedGameId(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => handleSaveAll('products')} 
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'Guardando...' : 'Guardar Catálogo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Toast Notification for Admin */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{y:50, opacity:0, scale:0.9}} 
            animate={{y:0, opacity:1, scale:1}} 
            exit={{y:50, opacity:0, scale:0.9}} 
            className={`fixed bottom-10 right-10 z-[300] px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl ${toast.type === 'success' ? 'bg-[#0a0a16]/90 border-emerald-500/20 text-emerald-400' : 'bg-[#0a0a16]/90 border-red-500/20 text-red-400'}`}
          >
             {toast.type === 'success' ? <CheckCircle2 size={20} className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> : <XCircle size={20} className="drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />}
             <span className="font-bold text-xs uppercase tracking-widest text-white">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
