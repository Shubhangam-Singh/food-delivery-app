import React from 'react';
import { useCart } from '../../context/CartContext';
import './RestaurantChangeModal.css';

const RestaurantChangeModal = () => {
  const { showRestaurantChangeModal, pendingAdd, restaurantInfo, replaceCart, cancelRestaurantChange } = useCart();

  if (!showRestaurantChangeModal || !pendingAdd) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>🏪 Different Restaurant</h3>
        </div>
        
        <div className="modal-body">
          <p>
            You have items from <strong>{restaurantInfo?.name}</strong> in your cart.
          </p>
          <p>
            Adding items from <strong>{pendingAdd.restaurantInfo?.name}</strong> will replace your current cart.
          </p>
          <div className="modal-warning">
            ⚠️ Your current cart items will be removed.
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={cancelRestaurantChange}
          >
            Keep Current Cart
          </button>
          <button 
            className="btn-primary" 
            onClick={replaceCart}
          >
            Replace Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantChangeModal;
