import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Copy,
  User,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { StoreAPI, socket } from '../../services/api';

interface MM2DeliveriesTabProps {
  orders: any[];
}

export default function MM2DeliveriesTab({ orders }: MM2DeliveriesTabProps) {
  const [mm2Orders, setMm2Orders] = useState<any[]>([]);
  const [permanentServerUrl, setPermanentServerUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [showServerConfigModal, setShowServerConfigModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Filter MM2 orders and ensure uniqueness
    const filtered = orders.filter(order => order.type === 'mm2');
    const uniqueOrders = Array.from(new Map(filtered.map(order => [order.id, order])).values());
    setMm2Orders(uniqueOrders);
  }, [orders]);

  // Load permanent server URL
  useEffect(() => {
    const loadServerConfig = async () => {
      try {
        const response = await StoreAPI.getMM2ServerConfig();
        if (response.success && response.data.mm2PrivateServerUrl) {
          setPermanentServerUrl(response.data.mm2PrivateServerUrl);
        }
      } catch (error) {
        console.error('Error loading MM2 server config:', error);
      }
    };
    loadServerConfig();
  }, []);

  // Real-time updates via socket
  useEffect(() => {
    // Join admin room for real-time updates
    socket.emit('join-admin');
    console.log('👨‍💼 Admin joined admin-room for MM2 updates');

    const handleOrderUpdate = (updatedOrder: any) => {
      console.log('🔄 Admin: Order updated via socket', updatedOrder);
      
      // Only update if it's an MM2 order
      if (updatedOrder.type === 'mm2') {
        setMm2Orders(prev => {
          const exists = prev.find(o => o.id === updatedOrder.id);
          if (exists) {
            // Update existing order
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          } else {
            // Add new order
            return [...prev, updatedOrder];
          }
        });
      }
    };

    socket.on('order-updated', handleOrderUpdate);

    return () => {
      socket.off('order-updated', handleOrderUpdate);
      socket.emit('leave-admin');
      console.log('👨‍💼 Admin left admin-room');
    };
  }, []);

  const handleApproveDelivery = async (orderId: string) => {
    if (!permanentServerUrl.trim()) {
      showToast('Por favor configura el servidor permanente primero', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await StoreAPI.updateMM2Delivery(orderId, {
        mm2DeliveryStatus: 'ready',
        mm2PrivateServer: permanentServerUrl
      });
      
      if (response.success) {
        setMm2Orders(prev => prev.map(o => o.id === orderId ? response.data : o));
        showToast('✅ Entrega aprobada correctamente', 'success');
      }
    } catch (error) {
      showToast('Error al aprobar la entrega', 'error');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    setConfirmModal({
      title: 'Confirmar Entrega Completada',
      message: '¿Estás seguro de que la entrega fue completada?',
      onConfirm: async () => {
        setIsUpdating(true);
        try {
          const response = await StoreAPI.updateMM2Delivery(orderId, {
            mm2DeliveryStatus: 'completed',
            status: 'completed'
          });
          
          if (response.success) {
            setMm2Orders(prev => prev.map(o => o.id === orderId ? response.data : o));
            showToast('✅ Entrega completada', 'success');
          }
        } catch (error) {
          showToast('Error al completar la entrega', 'error');
          console.error(error);
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const handleSavePermanentServer = async () => {
    try {
      await StoreAPI.updateMM2ServerConfig(permanentServerUrl);
      setShowServerConfigModal(false);
      showToast('✅ Servidor permanente guardado', 'success');
    } catch (error) {
      showToast('Error al guardar configuración', 'error');
      console.error(error);
    }
  };

  const copyToClipboard = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      'pending': { label: 'Pendiente', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      'requested': { label: 'Solicitado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      'ready': { label: 'Listo', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      'completed': { label: 'Completado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    };
    
    const badge = badges[status] || badges['pending'];
    return (
      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const requestedOrders = mm2Orders.filter(o => o.mm2DeliveryStatus === 'requested');
  const readyOrders = mm2Orders.filter(o => o.mm2DeliveryStatus === 'ready');
  const completedOrders = mm2Orders.filter(o => o.mm2DeliveryStatus === 'completed');
  const pendingOrders = mm2Orders.filter(o => !o.mm2DeliveryStatus || o.mm2DeliveryStatus === 'pending');

  return (
    <div className="space-y-6">
      {/* Header with Config Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-white">Entregas MM2</h2>
          <p className="text-xs text-white/40 mt-1">Gestiona las entregas de Murder Mystery 2</p>
        </div>
        <button
          onClick={() => setShowServerConfigModal(true)}
          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Servidor Permanente
        </button>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{requestedOrders.length}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Solicitados</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{readyOrders.length}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Listos</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{completedOrders.length}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Completados</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-500/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{mm2Orders.length}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total MM2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requested Orders - Priority */}
      {requestedOrders.length > 0 && (
        <div className="bg-white/[0.02] border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Solicitudes Pendientes</h3>
              <p className="text-xs text-white/40">Configura el servidor privado para estas entregas</p>
            </div>
          </div>

          <div className="space-y-3">
            {requestedOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-black text-white">{order.id}</span>
                      {getStatusBadge(order.mm2DeliveryStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <div className="flex items-center gap-1.5">
                        <User size={12} />
                        <span>{order.username}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{new Date(order.mm2RequestedAt).toLocaleString('es-PE')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApproveDelivery(order.id)}
                    disabled={isUpdating || !permanentServerUrl}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Aprobar Entrega
                  </button>
                </div>

                {/* Items Info - Lista Expandida */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Items ({order.cart?.length || 0})</p>
                    <p className="text-xs font-black text-white">{order.total} {order.currency}</p>
                  </div>
                  {order.cart && order.cart.length > 0 && order.cart.map((item: any, idx: number) => {
                    const itemColor = item?.color || '#ec4899';
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-2.5 rounded-lg"
                        style={{
                          backgroundColor: `${itemColor}15`,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: `${itemColor}40`
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${itemColor}20` }}>
                          <img src={item?.img || item?.image} alt="" className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white">{item?.name}</p>
                          <p className="text-[10px] font-bold uppercase" style={{ color: itemColor, opacity: 0.6 }}>{item?.game || 'Murder Mystery 2'}</p>
                        </div>
                      </div>
                    );
                  })}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Ready Orders */}
      {readyOrders.length > 0 && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Entregas en Progreso</h3>
              <p className="text-xs text-white/40">Esperando que el cliente complete la entrega</p>
            </div>
          </div>

          <div className="space-y-3">
            {readyOrders.map((order) => (
              <div key={order.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-black text-white">{order.id}</span>
                      {getStatusBadge(order.mm2DeliveryStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <div className="flex items-center gap-1.5">
                        <User size={12} />
                        <span>{order.username}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteDelivery(order.id)}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Marcar Completado'}
                  </button>
                </div>

                {/* Server URL */}
                <div className="flex items-center gap-2 p-3 bg-black/20 border border-white/10 rounded-lg">
                  <ExternalLink size={14} className="text-white/40" />
                  <input 
                    type="text" 
                    value={order.mm2PrivateServer} 
                    readOnly 
                    className="flex-1 bg-transparent text-xs text-white/60 font-mono outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(order.mm2PrivateServer, order.id)}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    {copiedOrderId === order.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Entregas Completadas</h3>
              <p className="text-xs text-white/40">Historial de entregas exitosas</p>
            </div>
          </div>

          <div className="space-y-2">
            {completedOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">{order.id}</p>
                    <p className="text-[10px] text-white/40">@{order.username}</p>
                  </div>
                </div>
                {getStatusBadge(order.mm2DeliveryStatus)}
              </div>
            ))}
          </div>
        </div>
      )}

      {mm2Orders.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 text-sm">No hay pedidos MM2 aún</p>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#1a1835] via-[#13102a] to-[#0f0d22] border border-white/10 rounded-3xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-black text-white mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-white/60 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white rounded-xl text-sm font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          } text-white font-bold text-sm`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Server Config Modal */}
      {showServerConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowServerConfigModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#1a1835] via-[#13102a] to-[#0f0d22] border border-blue-500/20 rounded-3xl p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-black text-white mb-4">Configurar Servidor Permanente</h3>
            <p className="text-sm text-white/60 mb-4">Este servidor se usará automáticamente para todas las entregas MM2</p>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
                URL del Servidor Privado
              </label>
              <input
                type="text"
                value={permanentServerUrl}
                onChange={(e) => setPermanentServerUrl(e.target.value)}
                placeholder="https://www.roblox.com/share?code=..."
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowServerConfigModal(false)}
                className="flex-1 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white rounded-xl text-sm font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePermanentServer}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
