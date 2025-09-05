import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Redirect if no order data
  if (!order) {
    navigate('/restaurants');
    return null;
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p>Your order has been confirmed and is being processed</p>
        </div>

        <div className="order-details-card">
          <div className="order-header">
            <div className="order-number">
              <h3>Order #{order.orderNumber}</h3>
              <div className="order-status">
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status === 'PENDING' ? '⏳ Pending' : order.status}
                </span>
              </div>
            </div>
            <div className="order-time">
              <div>📅 {formatDate(order.createdAt)}</div>
              <div>🕐 {formatTime(order.createdAt)}</div>
            </div>
          </div>

          <div className="delivery-info">
            <div className="delivery-section">
              <h4>🏪 Restaurant</h4>
              <div className="restaurant-details">
                <div className="restaurant-name">{order.restaurant.name}</div>
                <div className="restaurant-phone">📞 {order.restaurant.phone}</div>
              </div>
            </div>

            <div className="delivery-section">
              <h4>📍 Delivery Address</h4>
              <div className="address-details">
                <div>{order.deliveryAddress.street}</div>
                {order.deliveryAddress.landmark && (
                  <div>Near {order.deliveryAddress.landmark}</div>
                )}
                <div>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</div>
              </div>
            </div>

            <div className="delivery-section">
              <h4>🕒 Estimated Delivery</h4>
              <div className="delivery-time">
                <div className="time-estimate">
                  {formatTime(order.estimatedDeliveryTime)}
                </div>
                <div className="time-note">
                  We'll notify you when your order is on the way!
                </div>
              </div>
            </div>
          </div>

          {order.instructions && (
            <div className="delivery-instructions">
              <h4>📝 Delivery Instructions</h4>
              <p>{order.instructions}</p>
            </div>
          )}

          <div className="order-items">
            <h4>📋 Order Items</h4>
            <div className="items-list">
              {order.orderItems.map(orderItem => (
                <div key={orderItem.id} className="order-item">
                  <div className="item-details">
                    <div className="item-name">
                      {orderItem.menuItem.isVeg ? '��' : '🔴'} 
                      {orderItem.menuItem.name}
                    </div>
                    {orderItem.notes && (
                      <div className="item-notes">📝 {orderItem.notes}</div>
                    )}
                  </div>
                  <div className="item-quantity">×{orderItem.quantity}</div>
                  <div className="item-price">
                    ₹{(orderItem.price * orderItem.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{(order.totalAmount - order.deliveryFee - order.tax).toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="summary-line">
              <span>Tax</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="summary-line total">
              <span>Total Paid</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-info">
            <div className="payment-method">
              💳 Payment Method: {order.paymentMethod.replace('_', ' ')}
            </div>
            <div className="payment-status">
              Status: {order.paymentStatus === 'PENDING' ? '⏳ Pending' : order.paymentStatus}
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">Order Confirmation</div>
                <div className="step-desc">Restaurant will confirm your order</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">Preparation</div>
                <div className="step-desc">Your food is being prepared</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">On the Way</div>
                <div className="step-desc">Delivery partner will pick up your order</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <div className="step-title">Delivered</div>
                <div className="step-desc">Enjoy your meal!</div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/orders" className="btn-secondary">
            View All Orders
          </Link>
          <Link to="/restaurants" className="btn-primary">
            Order Again
          </Link>
        </div>

        <div className="support-info">
          <p>Need help with your order?</p>
          <div className="support-options">
            <a href="tel:+91-8000000000" className="support-link">
              📞 Call Support: +91-8000000000
            </a>
            <a href="mailto:support@fooddelivery.com" className="support-link">
              ✉️ Email: support@fooddelivery.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
