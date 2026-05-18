import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FortniteItem } from '../../services/fortniteApi';
import { SERVER_URL } from '../../services/api';

interface CartItem extends FortniteItem {
  quantity: number;
}

interface FortniteCartProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  adminUsername: string;
  adminPlatform: string;
}

export const FortniteCart: React.FC<FortniteCartProps> = ({ isOpen, onClose, user, adminUsername, adminPlatform }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [fortniteUsername, setFortniteUsername] = useState('');
  const [platform, setPlatform] = useState<'epic' | 'playstation' | 'xbox'>('epic');
  const [contactInfo, setContactInfo] = useState('');
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pricePerHundred, setPricePerHundred] = useState(20);

  useEffect(() => {
    const savedCart = localStorage.getItem('fortnite_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Cargar precio configurado
    const fetchPrice = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/fortnite/admin-config`);
        const data = await response.json();
        if (data.success) {
          setPricePerHundred(data.data.pricePerHundred || 20);
        }
      } catch (error) {
        console.error('Error loading price:', error);
      }
    };

    if (isOpen) {
      fetchPrice();
    }
  }, [isOpen]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('fortnite_cart', JSON.stringify(newCart));
  };

  const removeItem = (itemId: string) => {
    const newCart = cart.filter(item => item.id !== itemId);
    saveCart(newCart);
  };

  const getTotalVBucks = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalSoles = () => {
    const vbucks = getTotalVBucks();
    return ((vbucks / 100) * pricePerHundred).toFixed(2);
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(adminUsername);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = () => {
    // Verificar usuario desde prop o localStorage
    let currentUser = user;
    if (!currentUser) {
      const userData = localStorage.getItem('pixel_user');
      if (userData) {
        try {
          currentUser = JSON.parse(userData);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    if (!currentUser) {
      displayToast('Debes iniciar sesión para realizar una compra');
      return;
    }

    if (!fortniteUsername || !contactInfo) {
      displayToast('Por favor completa todos los campos');
      return;
    }

    // Preparar datos para el checkout
    const checkoutData = {
      type: 'fortnite',
      cart: cart.map(item => ({
        name: item.name,
        price: parseFloat(((item.price / 100) * pricePerHundred).toFixed(2)),
        quantity: item.quantity || 1,
        image: item.image,
        game: 'Fortnite'
      })),
      totalPrice: parseFloat(getTotalSoles()),
      currency: 'PEN',
      username: currentUser.username,
      userId: currentUser.id,
      method: 'direct',
      fortniteData: {
        fortniteUsername,
        platform,
        contactInfo,
        vbucksTotal: getTotalVBucks()
      }
    };

    // Redirigir a checkout con state
    navigate('/checkout', { state: checkoutData });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0D0B1E] z-[101] overflow-y-auto"
          >
            {!showCheckout ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold text-white burbank">Carrito</h2>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="text-white" size={24} />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto mb-4 text-white/20" size={64} />
                    <p className="text-white/40">Tu carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-white/5 rounded-xl p-4 flex gap-4">
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded-lg" />
                          <div className="flex-1">
                            <h3 className="text-white font-bold burbank">{item.name}</h3>
                            <p className="text-white/60 text-sm">{item.type}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-white font-bold burbank">S/ {((item.price / 100) * pricePerHundred).toFixed(2)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors self-start"
                          >
                            <Trash2 className="text-red-400" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 pt-4 mb-6">
                      <div className="flex items-center justify-between text-xl mb-6 pb-6 border-b border-white/10">
                        <span className="text-white burbank">Total:</span>
                        <span className="text-white burbank text-2xl">S/ {getTotalSoles()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white py-4 rounded-xl font-bold burbank text-lg transition-all shadow-lg"
                    >
                      Proceder al Pago
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white burbank">Checkout</h2>
                  <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="text-white" size={24} />
                  </button>
                </div>

                {/* Admin Username Section */}
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <p className="text-white/60 text-sm mb-2">Agrega al administrador en Fortnite:</p>
                  <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-white font-bold burbank" style={{ textTransform: 'none' }}>{adminUsername}</p>
                      <p className="text-white/40 text-xs capitalize">{adminPlatform}</p>
                    </div>
                    <button
                      onClick={handleCopyUsername}
                      className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all"
                    >
                      {copied ? <Check className="text-green-400" size={18} /> : <Copy className="text-white" size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Tu usuario de Fortnite</label>
                    <input
                      type="text"
                      value={fortniteUsername}
                      onChange={(e) => setFortniteUsername(e.target.value)}
                      placeholder="Ej: NinjaGamer123"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-2">Plataforma</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['epic', 'playstation', 'xbox'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPlatform(p)}
                          className={`py-3 rounded-xl font-bold capitalize transition-all border ${
                            platform === p
                              ? 'bg-white/20 text-white border-white/30'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 border-white/10'
                          }`}
                        >
                          {p === 'epic' ? 'Epic' : p === 'playstation' ? 'PS' : 'Xbox'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-2">Información de contacto</label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Email, Discord o Número"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={!fortniteUsername || !contactInfo}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white py-4 rounded-xl font-bold burbank text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10 mt-6"
                  >
                    Ir a Pagar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 right-6 z-[200] bg-black/80 backdrop-blur-xl text-white px-6 py-4 rounded-xl shadow-2xl border border-white/20"
          >
            <p className="font-bold burbank">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
