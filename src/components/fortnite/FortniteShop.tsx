import React, { useEffect, useState } from 'react';
import { getFortniteShop, FortniteShopSection, FortniteItem } from '../../services/fortniteApi';
import { ItemCard } from './ItemCard';
import { FortniteCart } from './FortniteCart';
import { ShoppingCart, Copy, Check } from 'lucide-react';
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

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      const data = await getFortniteShop();
      setSections(data.sections);
      setLoading(false);
    };

    fetchShop();

    // Cargar configuración del admin
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

    // Actualizar contador del carrito
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

  const handleAddToCart = (item: FortniteItem) => {
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
    
    // Mostrar notificación
    setToastMessage(`${item.name} agregado al carrito!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(adminUsername);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="shop-layout">
      {/* SIDEBAR NAVIGATION */}
      <aside className="shop-sidebar">
        <div className="sidebar-container">
          <h3 className="sidebar-title burbank">NAVEGACIÓN</h3>
          <div className="sidebar-divider"></div>
          <nav className="sidebar-nav">
            {sections.map((section) => (
              <button 
                key={section.name} 
                className="nav-item burbank"
                onClick={() => scrollToSection(`section-${section.name.replace(/\s+/g, '-')}`)}
              >
                {section.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="shop-container">
        <header className="shop-header">
          <div className="header-content">
            <h1 className="burbank skewed">TIENDA DE OBJETOS</h1>
            <div className="timer-container skewed">
              <span className="timer-label">Reinicia en:</span>
              <span className="timer-value burbank">{timeLeft}</span>
            </div>
          </div>
        </header>

        {/* Admin Username Section */}
        {adminUsername && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
                Agrega al administrador en Fortnite para recibir tus items:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="burbank" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', textTransform: 'none' }}>
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
        )}

        <main className="shop-main">
          {sections.map((section) => (
            <section 
              key={section.name} 
              id={`section-${section.name.replace(/\s+/g, '-')}`}
              className="shop-section"
            >
              <div className="section-header">
                <h2 className="burbank skewed">{section.name}</h2>
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

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 50,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
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
            style={{
              position: 'fixed',
              top: '100px',
              right: '30px',
              zIndex: 200,
              background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <p style={{ fontWeight: 'bold', margin: 0 }}>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
