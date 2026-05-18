import React from 'react';
import { motion } from 'framer-motion';
import { FortniteItem } from '../../services/fortniteApi';
import './ItemCard.css';

interface ItemCardProps {
  item: FortniteItem;
  onAddToCart?: (item: FortniteItem) => void;
  pricePerHundred?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onAddToCart, pricePerHundred = 20 }) => {
  const rarityClass = `rarity-${item.rarity.toLowerCase().replace(/\s+/g, '-')}`;
  const isBundle = item.isBundle;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  // Calcular precio en soles
  const priceInSoles = ((item.price / 100) * pricePerHundred).toFixed(2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`item-card-wrapper group ${rarityClass} ${item.isWide ? 'is-wide' : ''} ${isBundle ? 'is-bundle' : ''}`}
    >
      <div className="card-selection-frame"></div>
      
      <div className="item-card">
        <div className="card-rarity-bg"></div>

        {isBundle && (
          <div className="bundle-discount-tag burbank">
            ¡OFERTA DE LOTE!
          </div>
        )}

        <div className={`item-image-container ${item.isWide ? 'wide-image' : ''} ${isBundle ? 'bundle-image' : ''}`}>
          <img 
            src={item.image} 
            alt={item.name} 
            className="item-image group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {!isBundle && item.type && item.type !== 'item' && (
            <div className="item-tag burbank skewed">{item.type}</div>
          )}
        </div>

        <div className="item-info">
          <div className="item-name-container">
            <h3 className="item-name burbank skewed">{item.name}</h3>
          </div>
          <div className="item-footer">
            <div className="item-price-badge skewed">
              <span className="burbank" style={{ fontSize: '18px' }}>S/ {priceInSoles}</span>
            </div>

            {!isBundle && (
              <button onClick={handleAddToCart} className="action-btn cart-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </button>
            )}

            {isBundle && (
              <button onClick={handleAddToCart} className="action-btn cart-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="rarity-bar"></div>
      </div>
    </motion.div>
  );
};
