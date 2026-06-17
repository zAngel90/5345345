import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Image as ImageIcon,
  User,
  CreditCard,
  X,
  AlertTriangle
} from 'lucide-react';
import { StoreAPI, SERVER_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersTab({ orders, onContactClient }: { orders: any[], onContactClient: (orderId: string, userId: string, username: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any | null>(null);
  
  // Custom Modals & Toasts
  const [confirmModal, setConfirmModal] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [hiddenOrderIds, setHiddenOrderIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pixel_hidden_orders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleHideAll = () => {
    setConfirmModal({
      title: 'Limpiar Vista',
      message: '¿Estás seguro de querer ocultar todos los pedidos visualmente? (Solo se ocultan de tu vista actual, no de la base de datos)',
      onConfirm: () => {
        const allIds = orders.map(o => o.id);
        setHiddenOrderIds(allIds);
        localStorage.setItem('pixel_hidden_orders', JSON.stringify(allIds));
        showToast('Vista limpiada correctamente', 'success');
      }
    });
  };

  const handleRestoreHidden = () => {
    setHiddenOrderIds([]);
    localStorage.removeItem('pixel_hidden_orders');
    showToast('Pedidos restaurados', 'success');
  };

  const visibleOrders = orders.filter(o => !hiddenOrderIds.includes(o.id));
  const sortedOrders = [...visibleOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredOrders = sortedOrders.filter(order =>
    order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await StoreAPI.updateOrderStatus(orderId, status);
      if (res.success) {
        showToast(`Pedido #${orderId} actualizado a ${status}`, 'success');
        setTimeout(() => window.location.reload(), 1500); // Reload after toast
      } else {
        showToast('Error al actualizar estado', 'error');
      }
    } catch (err) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="py-20 text-center opacity-20">
        <ShoppingBag size={48} className="mx-auto mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">No hay pedidos registrados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gestión de Pedidos</h2>
          <p className="text-white/40 text-xs font-bold mt-1 uppercase tracking-widest">Control total de ventas y entregas</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID o Usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:border-blue-500/50 outline-none w-full transition-all"
            />
          </div>
          <button 
            onClick={handleHideAll}
            className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl transition-all whitespace-nowrap text-xs font-black uppercase tracking-widest"
            title="Ocultar todos visualmente"
          >
            Limpiar Vista
          </button>
          {hiddenOrderIds.length > 0 && (
            <button 
              onClick={handleRestoreHidden}
              className="px-4 py-3 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10 rounded-2xl transition-all whitespace-nowrap text-xs font-black uppercase tracking-widest"
              title="Restaurar ocultos"
            >
              Restaurar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-6">
              <th className="pb-4 pl-6">Pedido / Fecha</th>
              <th className="pb-4">Cliente</th>
              <th className="pb-4">Detalle</th>
              <th className="pb-4">Total / Pago</th>
              <th className="pb-4">Estado</th>
              <th className="pb-4 text-right pr-6">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                <td className="py-5 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <ShoppingBag size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">#{order.id}</span>
                      <span className="text-[10px] text-white/20 flex items-center gap-1">
                        <Clock size={10} /> {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-white/20" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">@{order.username}</span>
                      <span className="text-[10px] text-white/30">ID: {order.userId}</span>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex flex-col">
                    {order.type === 'mm2' || order.type === 'trade_limited' || order.type?.includes(':') || (order.cart && order.cart.length > 0 && order.cart.some((item: any) => 
                      String(item.game || '').toLowerCase().includes('mm2') || 
                      String(item.game || '').toLowerCase().includes('limited')
                    )) ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{order.cart?.length || 1} {order.cart?.length === 1 ? 'Item' : 'Ítems'}</span>
                          <button
                            onClick={() => setSelectedOrderItems(order)}
                            className="p-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                            title="Ver items"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                          {order.type === 'mm2' ? 'Murder Mystery 2' : order.type === 'trade_limited' ? 'Limiteds (Trade)' : order.type?.includes(':') ? order.type.split(':')[1] : 'Limiteds'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-white">{order.amount?.toLocaleString()} Robux</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Entrega: {order.method}</span>
                          {order.gamepassId && (
                            <a 
                              href={`https://www.roblox.com/game-pass/${order.gamepassId}/`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                              title="Ver Gamepass"
                            >
                              <span className="text-[8px] font-black uppercase tracking-tighter">Link</span>
                              <ExternalLink size={8} />
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-emerald-400">${order.total?.toLocaleString()} {order.currency}</span>
                    <span className="text-[10px] text-white/20 flex items-center gap-1">
                      <CreditCard size={10} /> {order.paymentMethodId}
                    </span>
                  </div>
                </td>
                <td className="py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      order.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {order.status === 'completed' ? 'Completado' : order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </span>
                </td>
                <td className="py-5 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedReceipt(order.receipt)}
                      className="p-2.5 bg-white/5 text-white/40 rounded-xl border border-white/5 hover:text-white transition-all hover:bg-white/10"
                      title="Ver Comprobante"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onContactClient(order.id, order.userId, order.username)}
                      className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                      title="Contactar Cliente"
                    >
                      <MessageSquare size={16} />
                    </button>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                          className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all"
                          title="Marcar como Completado"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="p-2.5 bg-red-600/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-600 hover:text-white transition-all"
                          title="Cancelar Pedido"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Comprobante */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setSelectedReceipt(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-[#161530] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ImageIcon size={20} className="text-blue-500" /> Comprobante de Pago
                </h3>
                <button onClick={() => setSelectedReceipt(null)} className="text-white/20 hover:text-white p-2">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <img
                  src={selectedReceipt.startsWith('http') ? selectedReceipt : `${SERVER_URL}${selectedReceipt}`}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  alt="Comprobante"
                />
              </div>
              <div className="p-6 bg-white/5 flex justify-center">
                <a
                  href={selectedReceipt.startsWith('http') ? selectedReceipt : `${SERVER_URL}${selectedReceipt}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-500 transition-all"
                >
                  <ExternalLink size={18} /> Abrir en nueva pestaña
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-[#03030a]/90 backdrop-blur-md" onClick={() => setConfirmModal(null)} />
            <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} className="relative bg-[#0a0a16] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] pointer-events-none"></div>
              
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 relative border border-red-500/20">
                 <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 relative z-10">{confirmModal.title}</h3>
              <p className="text-white/40 text-xs mb-8 relative z-10">{confirmModal.message}</p>
              <div className="flex gap-4 relative z-10">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">Cancelar</button>
                <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Items Modal */}
      <AnimatePresence>
        {selectedOrderItems && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-[#03030a]/90 backdrop-blur-md" onClick={() => setSelectedOrderItems(null)} />
            <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} className="relative bg-[#0a0a16] border border-white/10 rounded-[32px] p-6 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Items del Pedido</h3>
                  <p className="text-xs text-white/40 mt-1">Pedido #{selectedOrderItems.id} - @{selectedOrderItems.username}</p>
                </div>
                <button onClick={() => setSelectedOrderItems(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                  <X size={20} className="text-white/40" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedOrderItems.cart && selectedOrderItems.cart.length > 0 ? (
                  selectedOrderItems.cart.map((item: any, idx: number) => {
                    const itemColor = item?.color || '#ec4899';
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-4 p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor: `${itemColor}25`,
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          borderColor: `${itemColor}60`
                        }}
                      >
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${itemColor}35` }}>
                          <img src={item?.img || item?.image} alt="" className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{item?.name}</p>
                          <p className="text-[11px] font-bold uppercase mt-1 text-white/60">
                            {item?.game || (selectedOrderItems.type === 'mm2' ? 'Murder Mystery 2' : selectedOrderItems.type?.includes(':') ? selectedOrderItems.type.split(':')[0].replace(/-/g, ' ') : 'Roblox Limiteds')}
                          </p>
                        </div>
                        {item?.price && (
                          <div className="text-right">
                            <p className="text-sm font-black text-white">${item.price}</p>
                            <p className="text-[10px] text-white/40">{selectedOrderItems.currency}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <p className="text-sm">No hay items en este pedido</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-xs text-white/40 uppercase tracking-widest">Total Items</p>
                <p className="text-lg font-black text-white">{selectedOrderItems.cart?.length || 0}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Toast Notification */}
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

