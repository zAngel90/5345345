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
  Crown
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
import PaymentMethodsTab from '../components/admin/PaymentMethodsTab';
import HomeTab from '../components/admin/HomeTab';
import CategoryIconsTab from '../components/admin/CategoryIconsTab';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
        alert('Acceso denegado: Se requieren permisos de administrador');
      }
    } catch (err) {
      alert('Error al iniciar sesión');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Función para iniciar chat desde pedidos
  const handleContactClient = async (orderId: string, userId: string, username: string) => {
    try {
      // Enviamos un mensaje inicial para crear el chat si no existe
      await ChatAPI.sendMessage(`Hola ${username}, te contacto respecto a tu pedido #${orderId}.`, undefined, orderId);
      setActiveTab('chats');
    } catch (err) {
      console.error('Error contacting client:', err);
      alert('Error al iniciar el chat');
    }
  };
  const [requiredGroups, setRequiredGroups] = useState<any[]>([]);
  const [robuxPackages, setRobuxPackages] = useState<any[]>([]);
  const [pricePer1000, setPricePer1000] = useState(8.00);
  const [games, setGames] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [limiteds, setLimiteds] = useState<any[]>([]);
  const [mm2Items, setMm2Items] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{type: 'game' | 'product' | 'paymentMethod' | 'limited' | 'mm2', id: any} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, robuxRes, gamesRes, productsRes, currenciesRes, ordersRes, paymentsRes, limitedsRes, mm2Res] = await Promise.all([
        RobloxAPI.getGroupsConfig(),
        StoreAPI.getRobuxConfig(),
        StoreAPI.getGamesConfig(),
        StoreAPI.getProducts(),
        StoreAPI.getCurrenciesConfig(),
        StoreAPI.getOrders(),
        StoreAPI.getPaymentMethodsConfig(),
        StoreAPI.getLimitedsConfig(),
        StoreAPI.getMm2Config()
      ]);

      if (groupsRes.success) setRequiredGroups(groupsRes.data || []);
      if (robuxRes.success) {
        console.log('📦 Robux Config Raw:', robuxRes.data);
        if (Array.isArray(robuxRes.data)) {
          setRobuxPackages(robuxRes.data);
        } else if (robuxRes.data && typeof robuxRes.data === 'object') {
          const packs = robuxRes.data.packages || [];
          console.log('✅ Setting packages:', packs);
          setRobuxPackages(packs);
          setPricePer1000(robuxRes.data.pricePer1000 || 8.00);
        } else {
          console.warn('⚠️ Unexpected robux data format:', robuxRes.data);
          setRobuxPackages([]);
        }
      }
      if (gamesRes.success) setGames(gamesRes.data || []);
      if (currenciesRes.success) setCurrencies(currenciesRes.data || []);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (paymentsRes.success) setPaymentMethods(paymentsRes.data || []);
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
      alert('Error al subir imagen');
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
      else if (type === 'robux') res = await StoreAPI.updateRobuxConfig({ packages: robuxPackages, pricePer1000 });
      else if (type === 'games') res = await StoreAPI.updateGamesConfig(games);
      else if (type === 'products') res = await StoreAPI.updateProductsConfig(products);
      else if (type === 'limiteds') res = await StoreAPI.updateLimitedsConfig(limiteds);
      else if (type === 'mm2') res = await StoreAPI.updateMm2Config(mm2Items);
      else if (type === 'currencies') res = await StoreAPI.updateCurrenciesConfig(currencies);
      else if (type === 'payment-methods') res = await StoreAPI.updatePaymentMethodsConfig(paymentMethods);

      if (res?.success) alert('Cambios guardados correctamente');
      else alert('Error al guardar: ' + (res?.error || 'Unknown error'));
    } catch (err) {
      alert('Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d0c22] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white/[0.02] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-2xl mb-4">
              <ShieldCheck className="text-blue-500" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Acceso Admin</h2>
            <p className="text-white/30 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase ml-4">Usuario</label>
              <input 
                type="text" 
                required
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-blue-500/50 transition-all outline-none" 
                placeholder="admin" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase ml-4">Contraseña</label>
              <input 
                type="password" 
                required
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-blue-500/50 transition-all outline-none" 
                placeholder="••••••••" 
              />
            </div>
            <button 
              disabled={isLoggingIn}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 mt-4"
            >
              {isLoggingIn ? 'VERIFICANDO...' : 'ENTRAR AL PANEL'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0c22] pt-24 pb-20 px-4 md:px-8 selection:bg-blue-500/30">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          <aside className="w-full md:w-64 space-y-2">
            <div className="p-4 mb-4">
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-blue-500" /> Admin Panel
              </h1>
            </div>
            
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'groups', label: 'Grupos Roblox', icon: Users },
              { id: 'products', label: 'Paquetes Robux', icon: ShoppingBag },
              { id: 'currencies', label: 'Tasas / Monedas', icon: Globe },
              { id: 'payment-methods', label: 'Métodos de Pago', icon: CreditCard },
              { id: 'limiteds', label: 'Limiteds / Trade', icon: Crown },
              { id: 'mm2', label: 'Murder Mystery 2', icon: ShieldCheck },
              { id: 'games', label: 'Juegos / Catálogo', icon: LayoutGrid },
              { id: 'category-icons', label: 'Iconos Categorías', icon: LayoutGrid },
              { id: 'chats', label: 'Mensajería', icon: MessageSquare },
              { id: 'orders', label: 'Pedidos', icon: History },
              { id: 'home', label: 'Inicio / Home', icon: LayoutDashboard },
              { id: 'settings', label: 'Ajustes', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedGameId(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </aside>

          <main className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 min-h-[600px]"
            >
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-40">
                  <Loader2 className="text-blue-500 animate-spin mb-4" size={40} />
                  <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Cargando datos...</p>
                </div>
              )}

              {!isLoading && (
                <>
                  {activeTab === 'dashboard' && (
                    <div className="py-20 text-center">
                      <div className="inline-flex items-center justify-center p-6 bg-blue-500/10 rounded-3xl mb-6">
                        <LayoutDashboard className="text-blue-500" size={48} />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2 uppercase">Bienvenido, Admin</h2>
                      <p className="text-white/30 text-sm max-w-md mx-auto">Gestiona los Juegos y sus Items. Los Juegos aparecerán como categorías en la tienda.</p>
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
                    <PaymentMethodsTab 
                      paymentMethods={paymentMethods}
                      setPaymentMethods={setPaymentMethods}
                      onSave={() => handleSaveAll('payment-methods')}
                      onTriggerUpload={(id) => triggerUpload('paymentMethod', id)}
                      isSaving={isSaving}
                      SERVER_URL={SERVER_URL}
                    />
                  )}

                  {activeTab === 'chats' && (
                    <ChatsTab />
                  )}

                  {activeTab === 'games' && (
                    <GamesTab 
                      games={games} 
                      setGames={setGames} 
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

                  {selectedGameId && (
                    <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                      <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-6">
                          {(() => {
                            const game = games.find(g => g.id === selectedGameId);
                            const gameImg = game?.image ? (game.image.startsWith('http') ? game.image : `${SERVER_URL}${game.image}`) : '';
                            return (
                              <div 
                                onClick={() => triggerUpload('game', selectedGameId)}
                                className="w-16 h-16 rounded-xl border border-dashed border-white/10 overflow-hidden bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group relative shrink-0"
                              >
                                {gameImg ? (
                                  <img src={gameImg} className="w-full h-full object-cover group-hover:opacity-40" alt="" />
                                ) : (
                                  <ImageIcon className="text-white/10 group-hover:text-blue-500" size={20} />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Plus className="text-white" size={16} />
                                </div>
                              </div>
                            );
                          })()}
                          <div>
                            <h3 className="text-lg font-black text-white uppercase">Items de {games.find(g => g.id === selectedGameId)?.name}</h3>
                            <p className="text-white/40 text-xs">Gestión directa de productos para este juego.</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedGameId(null)} className="px-4 py-2 bg-white/5 text-white/40 rounded-xl font-bold text-xs">Cerrar</button>
                          <button onClick={() => { setEditingProduct({ id: Date.now(), name: '', price: 0, game: selectedGameId, image: '', description: '' }); setShowProductModal(true); }} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">+ Nuevo Producto</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products.filter(p => p.game === selectedGameId).map(product => (
                          <div key={product.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl group relative">
                            <div className="aspect-square bg-white/5 rounded-xl mb-3 overflow-hidden">
                              <img src={product.image?.startsWith('http') ? product.image : `${SERVER_URL}${product.image}`} className="w-full h-full object-cover" alt="" />
                            </div>
                            <h4 className="text-white font-bold text-xs truncate">{product.name}</h4>
                            <p className="text-emerald-400 font-bold text-[10px]">${product.price} USD</p>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="p-1.5 bg-blue-600 text-white rounded-lg"><Settings size={12} /></button>
                              <button onClick={() => setProducts(products.filter(p => p.id !== product.id))} className="p-1.5 bg-red-600 text-white rounded-lg"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <button onClick={() => handleSaveAll('products')} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase">Guardar Items</button>
                      </div>
                    </div>
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

                  {activeTab === 'home' && (
                    <HomeTab 
                      SERVER_URL={SERVER_URL}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <div className="py-40 text-center">
                      <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-2xl mb-4">
                        <Settings className="text-blue-500" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Próximamente</h3>
                      <p className="text-white/40 text-sm">Esta sección aún no está implementada.</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Modal de Producto */}
      <AnimatePresence>
        {showProductModal && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0d0c22]/80 backdrop-blur-md" onClick={() => setShowProductModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#161530] border border-white/10 rounded-[32px] p-8 overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white uppercase">Detalles del Producto</h3>
                <button onClick={() => setShowProductModal(false)} className="text-white/20 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div onClick={() => triggerUpload('product', editingProduct.id)} className="w-32 h-32 rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500/50 group relative overflow-hidden">
                    {editingProduct.image ? <img src={editingProduct.image.startsWith('http') ? editingProduct.image : `${SERVER_URL}${editingProduct.image}`} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-white/10 group-hover:text-blue-500" size={32} />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Plus className="text-white" /></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Nombre del Item" className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} placeholder="Precio USD" className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white" />
                    <select value={editingProduct.game} onChange={(e) => setEditingProduct({ ...editingProduct, game: e.target.value })} className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white">
                      {games.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={editingProduct.category || ''} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="Categoría (ej: Fruits)" className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white" />
                    <input type="text" value={editingProduct.rarity || ''} onChange={(e) => setEditingProduct({ ...editingProduct, rarity: e.target.value })} placeholder="Rareza (ej: Mythic)" className="w-full bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div className="flex items-center gap-4 bg-[#0d0c22] border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-white/40 text-sm">Color de fondo:</span>
                    <input type="color" value={editingProduct.color || '#1a1c20'} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="bg-transparent border-none w-10 h-8 cursor-pointer" />
                    <span className="text-white text-xs font-mono">{editingProduct.color || '#1a1c20'}</span>
                  </div>
                </div>
                <button onClick={() => { const exists = products.find(p => p.id === editingProduct.id); if (exists) setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p)); else setProducts([...products, editingProduct]); setShowProductModal(false); }} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20">ACEPTAR Y CERRAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
