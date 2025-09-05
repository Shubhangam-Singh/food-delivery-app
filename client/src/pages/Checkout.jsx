import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AddressSelector from '../components/checkout/AddressSelector';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items, 
    restaurantInfo, 
    getCartTotal, 
    getDeliveryFee, 
    getTax, 
    getFinalTotal,
    clearCart 
  } = useCart();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty
  if (!items || items.length === 0) {
    navigate('/restaurants');
    return null;
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!restaurantInfo) {
      toast.error('Restaurant information is missing');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        cartItems: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions
        })),
        restaurantId: restaurantInfo.id,
        deliveryAddressId: selectedAddress.id,
        deliveryInstructions,
        paymentMethod
      };

      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        // Clear cart
        clearCart();
        
        toast.success('Order placed successfully!');
        
        // Navigate to order confirmation
        navigate('/order-confirmation', { 
          state: { order: response.data.data } 
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      const errorMessage = error.response?.data?.error || 'Failed to place order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getFinalTotal();

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
        <div className="checkout-progress">
          <div className="progress-step active completed">
            <div className="step-circle">1</div>
            <div className="step-label">Cart</div>
          </div>
          <div className="progress-step active">
            <div className="step-circle">2</div>
            <div className="step-label">Checkout</div>
          </div>
          <div className="progress-step">
            <div className="step-circle">3</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="progress-step">
            <div className="step-circle">4</div>
            <div className="step-label">Confirmation</div>
          </div>
        </div>
          <h1>🛒 Checkout</h1>
          <p>Review your order and complete your purchase</p>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {/* Address Selection */}
            <div className="checkout-section">
              <AddressSelector
                selectedAddressId={selectedAddress?.id}
                onAddressSelect={handleAddressSelect}
              />
            </div>

            {/* Order Items Review */}
            <div className="checkout-section">
              <h3><span className="section-icon">📋</span>Order Details</h3>
              <div className="restaurant-info">
                <div className="restaurant-header">
                  <h4>{restaurantInfo?.name}</h4>
                  <p>{restaurantInfo?.address?.city}, {restaurantInfo?.address?.state}</p>
                </div>
              </div>

              <div className="order-items">
                {items.map(item => (
                  <div key={item.id} className="checkout-item">
                    <div className="item-info">
                      <div className="item-name">
                        {item.isVeg ? '🟢' : '🔴'} {item.name}
                      </div>
                      {item.specialInstructions && (
                        <div className="item-instructions">
                          📝 {item.specialInstructions}
                        </div>
                      )}
                    </div>
                    <div className="item-quantity">×{item.quantity}</div>
                    <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="checkout-section">
              <h3>📝 Delivery Instructions</h3>
              <textarea
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="Any special instructions for delivery (optional)"
                rows="3"
                className="delivery-instructions"
              />
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h3><span className="section-icon">💳</span>Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <div className="payment-name">💵 Cash on Delivery</div>
                    <div className="payment-desc">Pay when your order arrives</div>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <div className="payment-name">📱 UPI</div>
                    <div className="payment-desc">Pay instantly with UPI</div>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    value="CREDIT_CARD"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <div className="payment-name">💳 Credit/Debit Card</div>
                    <div className="payment-desc">Secure card payment</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>

              <div className="customer-info">
                <div className="customer-name">
                  👤 {user?.firstName} {user?.lastName}
                </div>
                <div className="customer-phone">📞 {user?.phone}</div>
              </div>

              <div className="summary-line">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-line">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-line">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="summary-line total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="delivery-time">
                <span>🕒 Estimated Delivery</span>
                <span>30-45 minutes</span>
              </div>

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
              >
                {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
              </button>

              <div className="order-guarantee">
                <p>🛡️ 100% Safe & Secure</p>
                <p>📞 24/7 Customer Support</p>
                <p>🔄 Easy Returns & Refunds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
