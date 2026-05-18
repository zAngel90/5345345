import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Copy, Check } from 'lucide-react';
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [fortniteUsername, setFortniteUsername] = useState('');
  const [platform, setPlatform] = useState<'epic' | 'playstation' | 'xbox'>('epic');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pricePerHundred, setPricePerHundred] = useState(20);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');

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

    // Cargar métodos de pago
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/admin/payment-methods-config`);
        const data = await response.json();
        if (data.success) {
          const activeMethods = data.data.filter((m: any) => m.active);
          setPaymentMethods(activeMethods);
          if (activeMethods.length > 0) {
            setSelectedPaymentMethod(activeMethods[0]);
          }
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };

    if (isOpen) {
      fetchPrice();
      fetchPaymentMethods();
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

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCheckout = async () => {
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

    if (!selectedPaymentMethod) {
      displayToast('Por favor selecciona un método de pago');
      return;
    }

    if (!receipt) {
      displayToast('Por favor sube el comprobante de pago');
      return;
    }

    setLoading(true);
    try {
      // Crear FormData con todos los datos
      const formData = new FormData();
      formData.append('receipt', receipt);
      formData.append('userId', currentUser.id.toString());
      formData.append('username', currentUser.username);
      formData.append('type', 'fortnite');
      formData.append('total', getTotalSoles());
      formData.append('currency', 'PEN');
      formData.append('paymentMethodId', selectedPaymentMethod.id.toString());
      formData.append('method', 'direct');
      formData.append('amount', '0');
      
      // Agregar items del carrito
      const items = cart.map(item => ({
        name: item.name,
        price: parseFloat(((item.price / 100) * pricePerHundred).toFixed(2)),
        quantity: item.quantity || 1,
        image: item.image
      }));
      formData.append('cart', JSON.stringify(items));
      
      // Agregar datos específicos de Fortnite
      const fortniteData = {
        fortniteUsername,
        platform,
        contactInfo,
        vbucksTotal: getTotalVBucks()
      };
      formData.append('fortniteData', JSON.stringify(fortniteData));

      const orderResponse = await fetch(`${SERVER_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pixel_token')}`
        },
        body: formData
      });

      const orderResult = await orderResponse.json();
      
      if (orderResult.success) {
        displayToast('¡Pedido creado exitosamente!');
        saveCart([]);
        setShowCheckout(false);
        setReceipt(null);
        setReceiptPreview('');
        setTimeout(() => onClose(), 1500);
      } else {
        displayToast('Error al crear el pedido: ' + orderResult.error);
      }
    } catch (error) {
      console.error('Error:', error);
      displayToast('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
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
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 rounded-xl font-bold burbank text-lg hover:opacity-90 transition-opacity"
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
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                    >
                      {copied ? <Check className="text-green-400" size={18} /> : <Copy className="text-blue-400" size={18} />}
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
                          className={`py-3 rounded-xl font-bold capitalize transition-all ${
                            platform === p
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
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

                  {/* Métodos de Pago */}
                  <div>
                    <label className="block text-white/60 text-sm mb-3">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedPaymentMethod?.id === method.id
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          {method.image ? (
                            <img src={`${SERVER_URL}${method.image}`} alt={method.name} className="h-8 mx-auto mb-2 object-contain" />
                          ) : (
                            <div className="h-8 flex items-center justify-center mb-2">
                              <span className="text-white font-bold">{method.name}</span>
                            </div>
                          )}
                          <p className="text-white/60 text-xs text-center">{method.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subir Comprobante */}
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Comprobante de Pago</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptChange}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="block w-full bg-white/5 border-2 border-dashed border-white/20 rounded-xl px-4 py-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all"
                      >
                        {receiptPreview ? (
                          <div className="space-y-2">
                            <img src={receiptPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                            <p className="text-green-400 text-sm font-bold">✓ Comprobante cargado</p>
                            <p className="text-white/40 text-xs">Click para cambiar</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-white/60 text-sm">Sube tu comprobante de pago</p>
                            <p className="text-white/40 text-xs">JPG, PNG o PDF</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading || !fortniteUsername || !contactInfo}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 rounded-xl font-bold burbank text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
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
            className="fixed top-24 right-6 z-[200] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-white/20"
          >
            <p className="font-bold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
