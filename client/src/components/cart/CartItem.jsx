import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem, updateInstructions } = useCart();
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState(item.specialInstructions || '');

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleInstructionsSubmit = () => {
    updateInstructions(item.id, instructions);
    setShowInstructions(false);
  };

  const getSpiceIcon = (level) => {
    switch (level) {
      case 'MILD': return '🌶️';
      case 'MEDIUM': return '🌶️��️';
      case 'SPICY': return '🌶️🌶️🌶️';
      case 'EXTRA_SPICY': return '🌶️🌶️🌶️🌶️';
      default: return '';
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-main">
        {item.image && (
          <img 
            src={item.image} 
            alt={item.name}
            className="cart-item-image"
          />
        )}
        
        <div className="cart-item-info">
          <h4 className="cart-item-name">
            {item.isVeg ? '🟢' : '🔴'} {item.name}
            {item.spiceLevel && (
              <span className="spice-level">
                {getSpiceIcon(item.spiceLevel)}
              </span>
            )}
          </h4>
          
          {item.description && (
            <p className="cart-item-description">{item.description}</p>
          )}
          
          <div className="cart-item-price">₹{item.price}</div>
          
          {item.specialInstructions && (
            <div className="special-instructions">
              <small>📝 {item.specialInstructions}</small>
            </div>
          )}
        </div>

        <div className="cart-item-controls">
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              −
            </button>
            <span className="quantity-display">{item.quantity}</span>
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              +
            </button>
          </div>
          
          <div className="item-total">
            ₹{(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="cart-item-actions">
        <button 
          className="instructions-btn"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          📝 {item.specialInstructions ? 'Edit' : 'Add'} Instructions
        </button>
        
        <button 
          className="remove-btn"
          onClick={() => removeItem(item.id)}
        >
          🗑️ Remove
        </button>
      </div>

      {showInstructions && (
        <div className="instructions-panel">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Any special instructions for this item..."
            className="instructions-textarea"
            rows="3"
          />
          <div className="instructions-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowInstructions(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleInstructionsSubmit}
            >
              Save Instructions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItem;
