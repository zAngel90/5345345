import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FortniteItem } from '../../services/fortniteApi';
import './ItemCard.css';

interface ItemCardProps {
  item: FortniteItem;
  onAddToCart?: (item: FortniteItem, e: React.MouseEvent) => void;
  pricePerHundred?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onAddToCart, pricePerHundred = 20 }) => {
  const [added, setAdded] = useState(() => {
    try {
      const saved = localStorage.getItem('fortnite_cart');
      if (saved) {
        const cart = JSON.parse(saved);
        return cart.some((i: any) => i.id === item.id);
      }
    } catch {}
    return false;
  });
  const rarityClass = `rarity-${item.rarity.toLowerCase().replace(/\s+/g, '-')}`;
  const isBundle = item.isBundle;

  const handleClick = (e: React.MouseEvent) => {
    if (onAddToCart) {
      onAddToCart(item, e);
      setAdded(true);
    }
  };

  const priceInSoles = ((item.price / 100) * pricePerHundred).toFixed(2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`item-card-wrapper group ${rarityClass} ${item.isWide ? 'is-wide' : ''} ${isBundle ? 'is-bundle' : ''}`}
      onClick={handleClick}
    >
      <div className="card-selection-frame"></div>
      
      <AnimatePresence>
        {added && (
          <motion.div 
            className="added-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      
      <div className="item-card">
        <div className="card-rarity-bg"></div>

        {isBundle && (
          <div className="bundle-discount-tag">
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
            <div className="item-tag">{item.type}</div>
          )}
        </div>

        <div className="item-info">
          <div className="item-name-container">
            <h3 className="item-name">{item.name}</h3>
          </div>
          <div className="item-footer">
            <div className="item-price-badge">
              <span style={{ fontSize: '18px' }}>S/ {priceInSoles}</span>
            </div>
            <div className={`add-to-cart-icon ${added ? 'added' : ''}`}>{added ? '✓' : '+'}</div>
          </div>
        </div>
        
        <div className="rarity-bar"></div>
      </div>
    </motion.div>
  );
};
