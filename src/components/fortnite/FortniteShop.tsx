import React, { useEffect, useState } from 'react';
import { getFortniteShop, FortniteShopSection, FortniteItem } from '../../services/fortniteApi';
import { ItemCard } from './ItemCard';
import { FortniteCart } from './FortniteCart';
import { ShoppingCart, UserPlus, Clock, CheckCircle2, Copy, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVER_URL } from '../../services/api';
import './FortniteShop.css';

interface FortniteShopProps {
  user: any;
}

export const FortniteShop: React.FC<FortniteShopProps> = ({ user }) => {
  const [sections, setSections] = useState<FortniteShopSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPlatform, setAdminPlatform] = useState('epic');
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pricePerHundred, setPricePerHundred] = useState(20);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [flyingItem, setFlyingItem] = useState<{ item: FortniteItem; startRect: DOMRect } | null>(null);
  const [showFakeError, setShowFakeError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFakeError(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      const data = await getFortniteShop();
      setSections(data.sections);
      setLoading(false);
    };

    fetchShop();

    const fetchAdminConfig = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/fortnite/admin-config`);
        const data = await response.json();
        if (data.success) {
          setAdminUsername(data.data.fortniteUsername);
          setAdminPlatform(data.data.fortnitePlatform);
          setPricePerHundred(data.data.pricePerHundred || 20);
        }
      } catch (error) {
        console.error('Error loading admin config:', error);
      }
    };

    fetchAdminConfig();

    const updateCartCount = () => {
      const savedCart = localStorage.getItem('fortnite_cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        setCartCount(cart.length);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);

    const timer = setInterval(() => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0);
      
      const diff = nextReset.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const handleAddToCart = (item: FortniteItem, e?: React.MouseEvent) => {
    const savedCart = localStorage.getItem('fortnite_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = cart.find((i: any) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem('fortnite_cart', JSON.stringify(cart));
    setCartCount(cart.length);

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setToastMessage(`${item.name} agregado al carrito!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else if (e) {
      const startRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setFlyingItem({ item, startRect });
      setTimeout(() => setFlyingItem(null), 700);
    }
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(adminUsername);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || showFakeError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px' }}>
        <div className="spinner"></div>
        {showFakeError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '20px 28px',
            maxWidth: '440px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
              Fortnite API Connection Error
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', margin: 0 }}>
              SSL 3.6 Business Certificate required to access Epic Games inventory. Please contact support.
            </p>
          </div>
        )}
      </div>
    );
  }

  const filteredSections = selectedFilter
    ? sections.filter(s => s.name === selectedFilter)
    : sections;

  return (
    <div className="shop-layout">
      <div className="shop-container">
        <header className="shop-header">
          <div className="header-content">
            <h1>TIENDA DE OBJETOS</h1>
            <div className="header-actions">
              <div className="timer-container">
                <span className="timer-label">Reinicia en:</span>
                <span className="timer-value">{timeLeft}</span>
              </div>
            </div>
          </div>
        </header>
        {showFilterMenu && <div className="filter-overlay" onClick={() => setShowFilterMenu(false)} />}

        {/* Admin Username Section + 3 Steps */}
        {adminUsername && (
          <div className="admin-section">
            <div className="admin-username-card">
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
                  Agrega al administrador en Fortnite para recibir tus items:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', textTransform: 'none' }}>
                    {adminUsername}
                  </span>
                  <span style={{ 
                    background: 'rgba(59, 130, 246, 0.2)', 
                    color: '#60a5fa', 
                    padding: '4px 12px', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    fontWeight: 'bold'
                  }}>
                    {adminPlatform}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyUsername}
                className="copy-btn"
                style={{
                  background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  border: copied ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
                  color: copied ? '#22c55e' : '#60a5fa',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copiar
                  </>
                )}
              </button>
            </div>

            {/* 3 Steps */}
            <div className="steps-row">
              <div className="step-card">
                <div className="step-icon step-icon-1">
                  <UserPlus size={20} />
                </div>
                <div className="step-content">
                  <span className="step-label">PASO 1</span>
                  <span className="step-text">Agregar a <strong>{adminUsername}</strong> a tu cuenta de Fortnite</span>
                </div>
              </div>
              <div className="step-connector" />
              <div className="step-card">
                <div className="step-icon step-icon-2">
                  <Clock size={20} />
                </div>
                <div className="step-content">
                  <span className="step-label">PASO 2</span>
                  <span className="step-text">Espera 48 horas.<br />Requisito único de Epic Games.</span>
                </div>
              </div>
              <div className="step-connector" />
              <div className="step-card">
                <div className="step-icon step-icon-3">
                  <CheckCircle2 size={20} />
                </div>
                <div className="step-content">
                  <span className="step-label">PASO 3</span>
                  <span className="step-text">¡Listo!<br />Recibe tus ítems mediante regalo.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="filter-float">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`filter-btn ${selectedFilter ? 'filter-active' : ''}`}
          >
            <Filter size={16} />
            <span>{selectedFilter || 'Categorías'}</span>
          </button>
          {showFilterMenu && (
            <div className="filter-dropdown-h">
              <button
                className={`filter-chip-h ${!selectedFilter ? 'filter-chip-active' : ''}`}
                onClick={() => { setSelectedFilter(null); setShowFilterMenu(false); }}
              >
                Todas
              </button>
              {sections.map(s => (
                <button
                  key={s.name}
                  className={`filter-chip-h ${selectedFilter === s.name ? 'filter-chip-active' : ''}`}
                  onClick={() => { setSelectedFilter(s.name); setShowFilterMenu(false); }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <main className="shop-main">
          {filteredSections.map((section) => (
            <section 
              key={section.name} 
              className="shop-section"
            >
              <div className="section-header">
                <h2>{section.name}</h2>
                <div className="section-divider"></div>
              </div>
              <div className="items-grid">
                {section.items.map((item) => (
                  <ItemCard key={item.id} item={item} onAddToCart={handleAddToCart} pricePerHundred={pricePerHundred} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* Flying Item Animation */}
      {flyingItem && (
        <motion.img
          src={flyingItem.item.image}
          alt=""
          initial={{ 
            position: 'fixed',
            zIndex: 9999,
            width: 80,
            height: 80,
            objectFit: 'contain',
            borderRadius: 12,
            left: flyingItem.startRect.left + flyingItem.startRect.width / 2 - 40,
            top: flyingItem.startRect.top + flyingItem.startRect.height / 2 - 40,
            opacity: 1,
            scale: 1
          }}
          animate={{ 
            left: window.innerWidth - 100,
            top: window.innerHeight - 100,
            width: 40,
            height: 40,
            opacity: 0,
            scale: 0.5
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="cart-float-btn"
      >
        <ShoppingCart color="white" size={28} />
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid #0D0B1E'
          }}>
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Component */}
      <FortniteCart 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        user={user}
        adminUsername={adminUsername}
        adminPlatform={adminPlatform}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 right-4 lg:right-[30px] z-[200] bg-gradient-to-br from-blue-500 to-blue-900 text-white px-4 py-3 lg:px-6 lg:py-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 max-w-[calc(100vw-2rem)] lg:max-w-none"
          >
            <p style={{ fontWeight: 'bold', margin: 0 }}>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
