import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import RestaurantChangeModal from '../components/cart/RestaurantChangeModal';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    restaurantInfo,
    isCartEmpty,
    getCartItemsCount,
    getCartTotal,
    getDeliveryFee,
    getTax,
    getFinalTotal,
    clearCart,
    deliveryInstructions,
    setDeliveryInfo
  } = useCart();

  const [orderInstructions, setOrderInstructions] = useState(deliveryInstructions || '');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const handleApplyPromo = () => {
    // Simple promo code logic (you can make this more sophisticated)
    if (promoCode.toLowerCase() === 'welcome10') {
      setPromoDiscount(getCartTotal() * 0.1); // 10% discount
    } else if (promoCode.toLowerCase() === 'save5') {
      setPromoDiscount(50); // ₹50 off
    } else {
      setPromoDiscount(0);
      // Could show error toast here
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    
    // Save delivery instructions
    setDeliveryInfo(null, orderInstructions);
    
    // Navigate to checkout (we'll build this in Phase 2)
    navigate('/checkout');
  };

  if (isCartEmpty()) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/restaurants" className="browse-restaurants-btn">
              Browse Restaurants
            </Link>
          </div>
        </div>
        <RestaurantChangeModal />
      </div>
    );
  }

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const finalTotal = getFinalTotal() - promoDiscount;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>🛒 Your Order</h1>
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        {restaurantInfo && (
          <div className="restaurant-info">
            <h3>{restaurantInfo.name}</h3>
            <p>{restaurantInfo.address?.city}, {restaurantInfo.address?.state}</p>
            <div className="restaurant-meta">
              <span>⭐ {restaurantInfo.rating}</span>
              <span>🚚 {deliveryFee === 0 ? 'Free delivery' : `₹${deliveryFee} delivery`}</span>
            </div>
          </div>
        )}

        <div className="cart-content">
          <div className="cart-items-section">
            <h3>Items ({getCartItemsCount()})</h3>
            <div className="cart-items">
              {items.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="order-instructions">
              <h4>📝 Delivery Instructions</h4>
              <textarea
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                placeholder="Add any special instructions for your order..."
                className="instructions-textarea"
                rows="3"
              />
            </div>

            <div className="promo-section">
              <h4>🎯 Promo Code</h4>
              <div className="promo-input">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="promo-code-input"
                />
                <button 
                  className="apply-promo-btn"
                  onClick={handleApplyPromo}
                >
                  Apply
                </button>
              </div>
              {promoDiscount > 0 && (
                <div className="promo-applied">
                  ✅ Promo applied! You saved ₹{promoDiscount.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-line">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-line">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              
              <div className="summary-line">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              
              {promoDiscount > 0 && (
                <div className="summary-line discount">
                  <span>Promo Discount</span>
                  <span>-₹{promoDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="summary-line total">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              <button 
                className="checkout-btn"
                onClick={handleProceedToCheckout}
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Continue'}
              </button>

              <div className="continue-shopping">
                <Link to="/restaurants">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            <div className="order-tips">
              <h4>💡 Order Tips</h4>
              <ul>
                <li>Free delivery on orders above ₹200</li>
                <li>Try promo codes: WELCOME10, SAVE5</li>
                <li>Add special instructions for dietary preferences</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <RestaurantChangeModal />
    </div>
  );
};

export default Cart;
