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
  Loader2,
  Gamepad2,
  Filter
} from 'lucide-react';
import { StoreAPI, socket } from '../../services/api';

interface DeliveryOrder {
  id: string;
  username: string;
  userId: string;
  accountId?: string;
  total: number;
  currency: string;
  cart?: any[];
  type: string;
  status: string;
  deliveryStatus?: 'pending' | 'requested' | 'ready' | 'completed';
  deliveryServerUrl?: string;
  deliveryRequestedAt?: string;
  // Legacy MM2 fields
  mm2DeliveryStatus?: 'pending' | 'requested' | 'ready' | 'completed';
  mm2PrivateServer?: string;
  mm2RequestedAt?: string;
  createdAt: string;
}

interface DeliveriesTabProps {
  orders: any[];
  games: any[];
}

// Helper: check if order type requires delivery
const hasDeliveryType = (type: string) => {
  if (!type) return false;
  if (type === 'mm2' || type === 'murder-mystery-2') return true;
  if (type.includes(':')) return true;
  return false;
};

// Helper: get delivery status (generic or legacy MM2)
const getDeliveryStatus = (order: DeliveryOrder): 'pending' | 'requested' | 'ready' | 'completed' | null => {
  return order.deliveryStatus || order.mm2DeliveryStatus || null;
};

// Helper: get delivery server URL (generic or legacy MM2)
const getDeliveryServerUrl = (order: DeliveryOrder): string => {
  return order.deliveryServerUrl || order.mm2PrivateServer || '';
};

// Helper: get configured delivery server URL from game category
const getCategoryDeliveryUrl = (order: DeliveryOrder, games: any[], mm2GlobalUrl?: string): string => {
  // If order already has a URL, return it
  const orderUrl = order.deliveryServerUrl || order.mm2PrivateServer;
  if (orderUrl) return orderUrl;

  // For MM2 orders, use global MM2 server URL if available
  if ((order.type === 'mm2' || order.type === 'murder-mystery-2') && mm2GlobalUrl) {
    return mm2GlobalUrl;
  }

  // Otherwise, try to get it from the game category config
  if (order.type && order.type.includes(':')) {
    const [gameSlug, ...catParts] = order.type.split(':');
    const categoryName = catParts.join(':');
    const game = games.find(g => g.slug === gameSlug || g.id === gameSlug);
    if (game && game.categories) {
      const cat = game.categories.find((c: any) => {
        const catName = typeof c === 'string' ? c : c.name;
        return catName === categoryName;
      });
      if (cat && typeof cat !== 'string' && cat.deliveryServerUrl) {
        return cat.deliveryServerUrl;
      }
    }
  }

  return '';
};

// Helper: get game and category from type string
const parseOrderType = (type: string, games: any[]) => {
  if (type === 'mm2' || type === 'murder-mystery-2') {
    return { gameName: 'Murder Mystery 2', categoryName: 'Items', gameSlug: 'murder-mystery-2' };
  }
  if (type.includes(':')) {
    const [gameSlug, ...catParts] = type.split(':');
    const categoryName = catParts.join(':');
    const game = games.find(g => g.slug === gameSlug || g.id === gameSlug);
    return { gameName: game?.name || gameSlug, categoryName, gameSlug };
  }
  return { gameName: type, categoryName: '', gameSlug: type };
};

// Helper: get game color
const getGameColor = (type: string, games: any[]): string => {
  if (type === 'mm2' || type === 'murder-mystery-2') return '#ef4444';
  if (type.includes(':')) {
    const [gameSlug] = type.split(':');
    const game = games.find(g => g.slug === gameSlug || g.id === gameSlug);
    return game?.color || '#3b82f6';
  }
  return '#3b82f6';
};

export default function DeliveriesTab({ orders, games }: DeliveriesTabProps) {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [filterGame, setFilterGame] = useState<string>('all');
  const [confirmModal, setConfirmModal] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [serverUrlModal, setServerUrlModal] = useState<{orderId: string, url: string} | null>(null);
  const [mm2GlobalServerUrl, setMm2GlobalServerUrl] = useState('');
  const [isSavingMm2Url, setIsSavingMm2Url] = useState(false);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveMm2ServerUrl = async () => {
    setIsSavingMm2Url(true);
    try {
      const response = await StoreAPI.updateMM2ServerConfig(mm2GlobalServerUrl);
      if (response.success) {
        showToast('✅ URL del servidor MM2 guardada', 'success');
      }
    } catch (error) {
      showToast('Error al guardar la URL', 'error');
    } finally {
      setIsSavingMm2Url(false);
    }
  };

  // Load MM2 global server URL
  useEffect(() => {
    const loadMM2ServerConfig = async () => {
      try {
        const response = await StoreAPI.getMM2ServerConfig();
        if (response.success && response.data.mm2PrivateServerUrl) {
          setMm2GlobalServerUrl(response.data.mm2PrivateServerUrl);
        }
      } catch (error) {
        console.error('Error loading MM2 server config:', error);
      }
    };
    loadMM2ServerConfig();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => hasDeliveryType(order.type));
    const uniqueOrders = Array.from(new Map(filtered.map(order => [order.id, order])).values());
    setDeliveryOrders(uniqueOrders);
  }, [orders]);

  // Real-time updates via socket
  useEffect(() => {
    socket.emit('join-admin');

    const handleOrderUpdate = (updatedOrder: any) => {
      if (hasDeliveryType(updatedOrder.type)) {
        setDeliveryOrders(prev => {
          const exists = prev.find(o => o.id === updatedOrder.id);
          if (exists) {
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          } else {
            return [...prev, updatedOrder];
          }
        });
      }
    };

    socket.on('order-updated', handleOrderUpdate);

    return () => {
      socket.off('order-updated', handleOrderUpdate);
      socket.emit('leave-admin');
    };
  }, []);

  const handleApproveDelivery = async (orderId: string, serverUrl: string) => {
    if (!serverUrl.trim()) {
      showToast('Por favor ingresa un servidor de entrega', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await StoreAPI.updateDelivery(orderId, {
        deliveryStatus: 'ready',
        deliveryServerUrl: serverUrl
      });
      
      if (response.success) {
        setDeliveryOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
        showToast('✅ Entrega aprobada correctamente', 'success');
      }
    } catch (error) {
      showToast('Error al aprobar la entrega', 'error');
      console.error(error);
    } finally {
      setIsUpdating(false);
      setServerUrlModal(null);
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    setConfirmModal({
      title: 'Confirmar Entrega Completada',
      message: '¿Estás seguro de que la entrega fue completada?',
      onConfirm: async () => {
        setIsUpdating(true);
        try {
          const response = await StoreAPI.updateDelivery(orderId, {
            deliveryStatus: 'completed',
            status: 'completed'
          });
          
          if (response.success) {
            setDeliveryOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
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

  // Filter by game
  const filteredOrders = filterGame === 'all' 
    ? deliveryOrders 
    : deliveryOrders.filter(o => o.type.startsWith(filterGame) || o.type === filterGame);

  // Group by status
  const requestedOrders = filteredOrders.filter(o => getDeliveryStatus(o) === 'requested');
  const readyOrders = filteredOrders.filter(o => getDeliveryStatus(o) === 'ready');
  const completedOrders = filteredOrders.filter(o => getDeliveryStatus(o) === 'completed');
  const pendingOrders = filteredOrders.filter(o => !getDeliveryStatus(o) || getDeliveryStatus(o) === 'pending');

  // Get unique games with delivery orders
  const gamesWithOrders = Array.from(new Set(deliveryOrders.map(o => {
    const parsed = parseOrderType(o.type, games);
    return parsed.gameSlug;
  })));

  return (
    <div className="space-y-6">
      {/* MM2 Global Server URL Config */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">URL Global MM2</h3>
            <p className="text-xs text-white/40">Servidor privado por defecto para entregas de Murder Mystery 2</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={mm2GlobalServerUrl}
            onChange={(e) => setMm2GlobalServerUrl(e.target.value)}
            placeholder="https://www.roblox.com/share?code=..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
          />
          <button
            onClick={handleSaveMm2ServerUrl}
            disabled={isSavingMm2Url}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSavingMm2Url ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Guardar
          </button>
        </div>
      </div>

      {/* Header with Stats and Filters */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-white">Entregas Especiales</h2>
          <p className="text-xs text-white/40 mt-1">Gestiona las entregas de MM2 e In-Game con servidor privado</p>
        </div>
      </div>

      {/* Game Filter */}
      {gamesWithOrders.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-white/30" />
          <button
            onClick={() => setFilterGame('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterGame === 'all' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          {gamesWithOrders.map(gameSlug => {
            const game = games.find(g => g.slug === gameSlug || g.id === gameSlug);
            if (!game) return null;
            return (
              <button
                key={gameSlug}
                onClick={() => setFilterGame(gameSlug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterGame === gameSlug 
                    ? 'text-white shadow-lg'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                }`}
                style={filterGame === gameSlug ? { backgroundColor: game.color, boxShadow: `0 4px 20px ${game.color}40` } : {}}
              >
                <Gamepad2 size={12} />
                {game.name}
              </button>
            );
          })}
        </div>
      )}

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
              <p className="text-2xl font-black text-white">{filteredOrders.length}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total</p>
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
            {requestedOrders.map((order) => {
              const parsed = parseOrderType(order.type, games);
              const gameColor = getGameColor(order.type, games);
              
              return (
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
                        {getStatusBadge(getDeliveryStatus(order))}
                        <span 
                          className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: `${gameColor}20`, color: gameColor }}
                        >
                          {parsed.gameName} · {parsed.categoryName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <div className="flex items-center gap-1.5">
                          <User size={12} />
                          <span>{order.username}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{new Date(order.deliveryRequestedAt || order.mm2RequestedAt || order.createdAt).toLocaleString('es-PE')}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const url = getCategoryDeliveryUrl(order, games, mm2GlobalServerUrl);
                        if (url) {
                          handleApproveDelivery(order.id, url);
                        } else {
                          setServerUrlModal({ orderId: order.id, url: '' });
                        }
                      }}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Aprobar Entrega
                    </button>
                  </div>

                  {/* Items Info */}
                  {order.cart && order.cart.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Items ({order.cart.length})</p>
                        <p className="text-xs font-black text-white">S/ {order.total}</p>
                      </div>
                      {order.cart.map((item: any, idx: number) => {
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
                              <p className="text-[10px] font-bold uppercase" style={{ color: itemColor, opacity: 0.6 }}>{item?.game || parsed.gameName}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
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
            {readyOrders.map((order) => {
              const parsed = parseOrderType(order.type, games);
              const gameColor = getGameColor(order.type, games);
              
              return (
                <div key={order.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-black text-white">{order.id}</span>
                        {getStatusBadge(getDeliveryStatus(order))}
                        <span 
                          className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: `${gameColor}20`, color: gameColor }}
                        >
                          {parsed.gameName} · {parsed.categoryName}
                        </span>
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
                      value={getDeliveryServerUrl(order)} 
                      readOnly 
                      className="flex-1 bg-transparent text-xs text-white/60 font-mono outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(getDeliveryServerUrl(order), order.id)}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                      {copiedOrderId === order.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
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
            {completedOrders.slice(0, 5).map((order) => {
              const parsed = parseOrderType(order.type, games);
              const gameColor = getGameColor(order.type, games);
              
              return (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">{order.id}</p>
                      <p className="text-[10px] text-white/40">@{order.username} · {parsed.gameName}</p>
                    </div>
                  </div>
                  {getStatusBadge(getDeliveryStatus(order))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 text-sm">No hay pedidos de entrega aún</p>
        </div>
      )}

      {/* Server URL Modal */}
      {serverUrlModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setServerUrlModal(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#1a1835] via-[#13102a] to-[#0f0d22] border border-emerald-500/20 rounded-3xl p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-black text-white mb-2">Aprobar Entrega</h3>
            <p className="text-sm text-white/60 mb-4">Ingresa el servidor privado para el usuario</p>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
                URL del Servidor Privado
              </label>
              <input
                type="text"
                value={serverUrlModal.url}
                onChange={(e) => setServerUrlModal({ ...serverUrlModal, url: e.target.value })}
                placeholder="https://www.roblox.com/share?code=..."
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500/50 transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setServerUrlModal(null)}
                className="flex-1 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white rounded-xl text-sm font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApproveDelivery(serverUrlModal.orderId, serverUrlModal.url)}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all"
              >
                Confirmar Entrega
              </button>
            </div>
          </motion.div>
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
    </div>
  );
}
