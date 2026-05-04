import React, { useEffect, useState } from 'react';
import { getFortniteShop, FortniteShopSection } from '../../services/fortniteApi';
import { ItemCard } from './ItemCard';
import './FortniteShop.css';

export const FortniteShop: React.FC = () => {
  const [sections, setSections] = useState<FortniteShopSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      const data = await getFortniteShop();
      setSections(data.sections);
      setLoading(false);
    };

    fetchShop();

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

    return () => clearInterval(timer);
  }, []);

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
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};
