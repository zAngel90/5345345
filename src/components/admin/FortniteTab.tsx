import React, { useState, useEffect } from 'react';
import { Save, Copy, Check } from 'lucide-react';
import { SERVER_URL } from '../../services/api';

interface FortniteTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const FortniteTab: React.FC<FortniteTabProps> = ({ showToast }) => {
  const [fortniteUsername, setFortniteUsername] = useState('');
  const [fortnitePlatform, setFortnitePlatform] = useState<'epic' | 'playstation' | 'xbox'>('epic');
  const [pricePerHundred, setPricePerHundred] = useState(20); // Precio en soles por 100 V-Bucks
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
    loadOrders();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/admin/fortnite-config`);
      const data = await response.json();
      if (data.success) {
        setFortniteUsername(data.data.fortniteUsername);
        setFortnitePlatform(data.data.fortnitePlatform);
        setPricePerHundred(data.data.pricePerHundred || 20);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('pixel_token');
      const response = await fetch(`${SERVER_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Filtrar solo las órdenes de tipo fortnite
        const fortniteOrders = data.data.filter((order: any) => order.type === 'fortnite');
        // Ordenar por fecha más reciente primero
        fortniteOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fortniteOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/admin/fortnite-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fortniteUsername, fortnitePlatform, pricePerHundred })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Configuración guardada exitosamente', 'success');
      } else {
        showToast('Error al guardar configuración', 'error');
      }
    } catch (error) {
      showToast('Error al guardar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('pixel_token');
      const response = await fetch(`${SERVER_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Estado actualizado', 'success');
        loadOrders();
      } else {
        showToast('Error al actualizar estado', 'error');
      }
    } catch (error) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Configuración de Cuenta</h3>
        <p className="text-white/60 text-sm mb-6">
          Configura tu nombre de usuario de Fortnite para que los clientes puedan agregarte y recibir sus items.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-bold mb-2">Usuario de Fortnite</label>
            <input
              type="text"
              value={fortniteUsername}
              onChange={(e) => setFortniteUsername(e.target.value)}
              placeholder="Ej: ProGamer123"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              style={{ textTransform: 'none' }}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-bold mb-2">Plataforma</label>
            <div className="grid grid-cols-3 gap-3">
              {(['epic', 'playstation', 'xbox'] as const).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setFortnitePlatform(platform)}
                  className={`py-3 rounded-xl font-bold capitalize transition-all ${
                    fortnitePlatform === platform
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {platform === 'epic' ? 'Epic Games' : platform === 'playstation' ? 'PlayStation' : 'Xbox'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-bold mb-2">Precio por 100 V-Bucks (Soles Peruanos)</label>
            <input
              type="number"
              value={pricePerHundred}
              onChange={(e) => setPricePerHundred(parseFloat(e.target.value) || 0)}
              placeholder="Ej: 20"
              step="0.01"
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <p className="text-white/40 text-xs mt-2">Este precio se aplicará a todos los items de Fortnite</p>
          </div>

          <button
            onClick={saveConfig}
            disabled={saving || !fortniteUsername}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>

      {/* Órdenes */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Órdenes de Fortnite</h3>
          <button
            onClick={loadOrders}
            className="text-blue-400 hover:text-blue-300 text-sm font-bold"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No hay órdenes de Fortnite</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white font-bold">{order.username}</p>
                    <p className="text-white/40 text-sm">ID: {order.id}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Usuario Fortnite</p>
                    <p className="text-white font-bold">{order.fortniteData?.fortniteUsername || order.username}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Plataforma</p>
                    <p className="text-white font-bold capitalize">{order.fortniteData?.platform || 'Epic'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Contacto</p>
                    <p className="text-white font-bold">{order.fortniteData?.contactInfo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Total Pagado</p>
                    <p className="text-white font-bold">S/ {order.total.toFixed(2)} {order.currency}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Total V-Bucks</p>
                    <div className="flex items-center gap-1">
                      <img src="https://i.postimg.cc/QtGpSqh4/10dp-Ikb-Es-Txae.png" alt="V-Bucks" className="w-4 h-4" />
                      <p className="text-white font-bold">{order.fortniteData?.vbucksTotal || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-white/40 text-xs mb-2">Items ({order.cart.length})</p>
                  <div className="space-y-2">
                    {order.cart.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-bold">{item.name}</p>
                          <div className="flex items-center gap-1">
                            <img src="https://i.postimg.cc/QtGpSqh4/10dp-Ikb-Es-Txae.png" alt="V-Bucks" className="w-3 h-3" />
                            <p className="text-white/60 text-xs">{item.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comprobante de Pago */}
                {order.receipt && (
                  <div className="mb-4">
                    <p className="text-white/40 text-xs mb-2">Comprobante de Pago</p>
                    <a 
                      href={order.receipt.startsWith('http') ? order.receipt : `${SERVER_URL}${order.receipt}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/5 rounded-lg p-3 border border-white/10 hover:border-blue-500/50 transition-all group"
                    >
                      <img 
                        src={order.receipt.startsWith('http') ? order.receipt : `${SERVER_URL}${order.receipt}`}
                        alt="Comprobante"
                        className="w-full max-w-xs rounded-lg mx-auto"
                      />
                      <p className="text-blue-400 text-xs text-center mt-2 group-hover:underline">Click para ver en tamaño completo</p>
                    </a>
                  </div>
                )}

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'in_progress')}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Marcar En Progreso
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Marcar Completado
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'in_progress') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FortniteTab;
