import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Shield,
  ShoppingBag,
  LogOut,
  Mail,
  Phone,
  MessageSquare,
  Camera,
  Link as LinkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RobloxAPI, StoreAPI, AuthAPI, SERVER_URL, OrdersAPI } from '../services/api';

const SIDEBAR_SECTIONS = [
  {
    title: 'CUENTA',
    items: [
      { id: 'perfil', label: 'Perfil', icon: User },
      { id: 'privacidad', label: 'Privacidad', icon: Lock },
      { id: 'seguridad', label: 'Seguridad', icon: Shield },
    ]
  },
  {
    title: 'ACTIVIDAD',
    items: [
      { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag }
    ]
  }
];

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (!savedUser) {
      navigate('/');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchOrders(parsedUser.id, parsedUser.username);
    }
  }, [navigate]);

  const fetchOrders = async (userId: string, username: string) => {
    setIsLoadingOrders(true);
    try {
      // Intentamos buscar por ID de cuenta y por nombre de usuario (por si el pedido es antiguo)
      const [resById, resByUsername] = await Promise.all([
        OrdersAPI.getUserOrders(userId),
        OrdersAPI.getUserOrders(username)
      ]);

      let allOrders = [];
      if (resById.success) allOrders = [...resById.data];
      if (resByUsername.success) {
        // Evitamos duplicados
        const existingIds = new Set(allOrders.map(o => o.id));
        const extraOrders = resByUsername.data.filter((o: any) => !existingIds.has(o.id));
        allOrders = [...allOrders, ...extraOrders];
      }

      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pixel_token');
    localStorage.removeItem('pixel_user');
    navigate('/');
    window.location.reload();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUpdating(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pixel_token')}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Error al subir la imagen al servidor');
      }

      const data = await res.json();

      if (data.success) {
        const updatedUser = { ...user, avatar: data.url };
        const updateRes = await AuthAPI.updateProfile({ avatar: data.url });

        if (updateRes.success) {
          setUser(updatedUser);
          localStorage.setItem('pixel_user', JSON.stringify(updatedUser));
          alert('¡Foto de perfil actualizada correctamente!');
        }
      }
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0d0c22] pt-28 pb-20 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#0d0c22] pt-28 pb-20 px-4 md:px-8 lg:px-12"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Mi Cuenta</h1>
          <p className="text-white/20 text-sm mt-1">Gestión de perfil y pedidos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                <img src={user.avatar?.startsWith('http') ? user.avatar : `${SERVER_URL}${user?.avatar || '/avatar.png'}`} alt="Avatar" className="size-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{user.username}</h4>
                <p className="text-[11px] text-white/20 truncate">{user.email}</p>
              </div>
            </div>

            {/* Navigation Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-3 space-y-6">
              {SIDEBAR_SECTIONS.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h5 className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{section.title}</h5>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all group ${activeTab === item.id
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
                          }`}
                      >
                        <item.icon size={18} className={activeTab === item.id ? 'text-blue-400' : 'group-hover:text-white transition-colors'} />
                        <span className="text-sm font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-3xl bg-white/[0.03] border border-white/5 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all group"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold">Cerrar Sesión</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'perfil' && (
                  <>
                    {/* Large Banner Card */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                  <div className="relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="size-28 md:size-32 rounded-[2rem] bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center overflow-hidden">
                      <img src={user.avatar?.startsWith('http') ? user.avatar : `${SERVER_URL}${user?.avatar || '/avatar.png'}`} alt="Avatar" className="size-full object-cover" />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUpdating}
                      className="absolute -bottom-2 -right-2 size-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-[#0d0c22] group-hover:scale-110 transition-transform shadow-xl disabled:opacity-50"
                    >
                      <Camera size={18} />
                    </button>
                  </div>

                  <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{user.username}</h2>
                    <p className="text-white/30 font-medium">{user.email}</p>
                  </div>

                  {/* Decorative Background Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">INFORMACIÓN PERSONAL</h3>
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                      <div className="p-6 flex items-start gap-4">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          <User size={18} className="text-white/20" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Nombre de Usuario</p>
                          <p className="text-sm font-bold text-white">{user.username}</p>
                        </div>
                      </div>

                      <div className="p-6 flex items-start gap-4">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          <Mail size={18} className="text-white/20" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Correo Electrónico</p>
                          <p className="text-sm font-bold text-white">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connected Accounts */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">CUENTAS CONECTADAS</h3>
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center">
                          <MessageSquare size={20} className="text-[#5865F2]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white mb-0.5">DISCORD</p>
                          <p className="text-[11px] text-white/20 font-medium">No vinculado</p>
                        </div>
                      </div>
                      <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-500/20">
                        <LinkIcon size={14} />
                        Vincular
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'privacidad' && (
              <div className="space-y-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                  <h3 className="text-2xl font-black text-white mb-6">Ajustes de Notificaciones</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <h4 className="text-sm font-bold text-white">Notificaciones Push</h4>
                        <p className="text-xs text-white/40">Recibe avisos sobre el estado de tus pedidos y mensajes de soporte.</p>
                      </div>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 size-4 bg-white rounded-full"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguridad' && (
              <div className="space-y-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                  <h3 className="text-2xl font-black text-white mb-6">Seguridad de la Cuenta</h3>
                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2">Contraseña Actual</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2">Nueva Contraseña</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <button className="mt-4 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 transition-all">Actualizar Seguridad</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div className="space-y-6">
                {isLoadingOrders ? (
                  <div className="grid grid-cols-1 gap-4">
                    <Skeleton className="h-28 w-full rounded-3xl" />
                    <Skeleton className="h-28 w-full rounded-3xl" />
                    <Skeleton className="h-28 w-full rounded-3xl" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-6">
                          <div className="size-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-black text-white">{order.id}</h4>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                  order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-white/5 text-white/40'
                                }`}>
                                {order.status === 'completed' ? 'Completado' : order.status === 'pending' ? 'Pendiente' : order.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                              {order.amount} Robux • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="text-right flex-grow md:flex-grow-0">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Pagado</p>
                            <p className="text-lg font-black text-white">${order.total} {order.currency}</p>
                          </div>
                          <button
                            onClick={() => navigate('/chat', { state: { orderId: order.id } })}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black transition-all"
                          >
                            Chat Soporte
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-12 text-center">
                    <div className="size-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-400">
                      <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">No tienes pedidos aún</h3>
                    <p className="text-sm text-white/30 max-w-xs mx-auto mb-8">Cuando realices tu primera compra, aparecerá aquí para que puedas seguir su estado.</p>
                    <button onClick={() => navigate('/catalog')} className="px-8 py-3 bg-white text-black rounded-xl font-black text-sm hover:scale-105 transition-all">Explorar Catálogo</button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-80" />
    </motion.div>
  );
}
