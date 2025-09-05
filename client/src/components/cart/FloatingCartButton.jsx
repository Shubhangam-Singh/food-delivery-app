import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './FloatingCartButton.css';

const FloatingCartButton = () => {
  const navigate = useNavigate();
  const { items, getCartItemsCount, getFinalTotal, isCartEmpty } = useCart();

  if (isCartEmpty()) {
    return null;
  }

  const handleClick = () => {
    navigate('/cart');
  };

  return (
    <div className="floating-cart-button" onClick={handleClick}>
      <div className="cart-info">
        <div className="cart-count">{getCartItemsCount()}</div>
        <div className="cart-details">
          <span className="cart-text">View Cart</span>
          <span className="cart-total">₹{getFinalTotal().toFixed(2)}</span>
        </div>
      </div>
      <div className="cart-icon">🛒</div>
    </div>
  );
};

export default FloatingCartButton;
