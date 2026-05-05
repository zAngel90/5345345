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
  X
} from 'lucide-react';
import { StoreAPI, SERVER_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersTab({ orders, onContactClient }: { orders: any[], onContactClient: (orderId: string, userId: string, username: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const filteredOrders = orders.filter(order =>
    order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await StoreAPI.updateOrderStatus(orderId, status);
      if (res.success) {
        alert(`Pedido #${orderId} actualizado a ${status}`);
        window.location.reload(); // Simple reload to refresh data
      }
    } catch (err) {
      alert('Error al actualizar estado');
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
    </div>
  );
}

