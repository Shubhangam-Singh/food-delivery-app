import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/restaurants/${id}`);
      
      if (response.data.success) {
        setRestaurant(response.data.data);
        if (response.data.data.menuByCategory && Object.keys(response.data.data.menuByCategory).length > 0) {
          setSelectedCategory(Object.keys(response.data.data.menuByCategory)[0]);
        }
      } else {
        setError('Restaurant not found');
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menuItem) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const existingItem = cart.find(item => item.id === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
    toast.success(`${menuItem.name} added to cart`);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrderNow = () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart first');
      return;
    }
    
    // Here you would implement the order flow
    toast.success('Order functionality coming soon!');
  };

  const getSpiceIcon = (level) => {
    switch (level) {
      case 'MILD': return '🌶️';
      case 'MEDIUM': return '🌶️🌶️';
      case 'SPICY': return '🌶️🌶️🌶️';
      case 'EXTRA_SPICY': return '🌶️🌶️🌶️🌶️';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="restaurant-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading restaurant details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-detail-error">
        <h2>😔 {error}</h2>
        <Link to="/restaurants" className="back-to-restaurants">
          ← Back to Restaurants
        </Link>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-detail-error">
        <h2>Restaurant not found</h2>
        <Link to="/restaurants" className="back-to-restaurants">
          ← Back to Restaurants
        </Link>
      </div>
    );
  }

  const categories = Object.keys(restaurant.menuByCategory || {});

  return (
    <div className="restaurant-detail">
      {/* Header Section */}
      <div className="restaurant-header">
        <div className="restaurant-hero">
          <img 
            src={restaurant.image || '/placeholder-restaurant.jpg'} 
            alt={restaurant.name}
            className="restaurant-hero-image"
          />
          <div className="restaurant-hero-overlay">
            <Link to="/restaurants" className="back-button">
              ← Back to Restaurants
            </Link>
            <div className="restaurant-hero-content">
              <h1 className="restaurant-name">{restaurant.name}</h1>
              <p className="restaurant-description">{restaurant.description}</p>
              <div className="restaurant-meta">
                <div className="meta-item">
                  <span className="meta-icon">⭐</span>
                  <span>{restaurant.rating.toFixed(1)} ({restaurant.totalReviews} reviews)</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span>{restaurant.address?.city}, {restaurant.address?.state}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🕒</span>
                  <span>{restaurant.isOpen ? 'Open Now' : 'Closed'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Info Bar */}
        <div className="restaurant-info-bar">
          <div className="info-items">
            <div className="info-item">
              <strong>Delivery Fee:</strong> 
              {restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}
            </div>
            <div className="info-item">
              <strong>Min Order:</strong> ₹{restaurant.minOrder}
            </div>
            <div className="info-item">
              <strong>Cuisines:</strong> {restaurant.cuisineType?.join(', ')}
            </div>
            {restaurant.openTime && restaurant.closeTime && (
              <div className="info-item">
                <strong>Hours:</strong> {restaurant.openTime} - {restaurant.closeTime}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="restaurant-content">
        <div className="menu-section">
          <h2 className="menu-title">Menu</h2>
          
          {categories.length > 0 ? (
            <>
              {/* Category Filter */}
              <div className="category-filter">
                <button
                  className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Items
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Menu Items */}
              <div className="menu-items">
                {categories.map(category => (
                  (selectedCategory === 'all' || selectedCategory === category) && (
                    <div key={category} className="menu-category">
                      <h3 className="category-title">{category}</h3>
                      <div className="category-items">
                        {restaurant.menuByCategory[category].map(item => (
                          <div key={item.id} className="menu-item">
                            <div className="menu-item-info">
                              <div className="item-header">
                                <h4 className="item-name">
                                  {item.isVeg ? '🟢' : '🔴'} {item.name}
                                  {item.spiceLevel && (
                                    <span className="spice-level">
                                      {getSpiceIcon(item.spiceLevel)}
                                    </span>
                                  )}
                                </h4>
                                <span className="item-price">₹{item.price}</span>
                              </div>
                              {item.description && (
                                <p className="item-description">{item.description}</p>
                              )}
                            </div>
                            <div className="menu-item-actions">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="menu-item-image"
                                />
                              )}
                              <button 
                                className="add-to-cart-btn"
                                onClick={() => addToCart(item)}
                                disabled={!item.isAvailable}
                              >
                                {item.isAvailable ? 'Add to Cart' : 'Not Available'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </>
          ) : (
            <div className="no-menu">
              <p>No menu items available at the moment.</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <div className="reviews-section">
            <h3>Recent Reviews</h3>
            <div className="reviews-list">
              {restaurant.reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="floating-cart">
          <button 
            className="cart-toggle"
            onClick={() => setShowCart(!showCart)}
          >
            🛒 {getCartItemsCount()} items • ₹{getCartTotal().toFixed(2)}
          </button>
          
          {showCart && (
            <div className="cart-dropdown">
              <div className="cart-header">
                <h3>Your Order</h3>
                <button onClick={() => setShowCart(false)}>✕</button>
              </div>
              
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <span className="cart-item-price">₹{item.price}</span>
                    </div>
                    <div className="cart-item-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        −
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total: ₹{getCartTotal().toFixed(2)}</strong>
                </div>
                <button 
                  className="order-now-btn"
                  onClick={handleOrderNow}
                >
                  Order Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;

// Note: Replace the existing addToCart function with this:
/*
const { addItem } = useCart();

const addToCart = (menuItem) => {
  if (!isAuthenticated) {
    toast.error('Please login to add items to cart');
    navigate('/login');
    return;
  }

  addItem(menuItem, restaurant.id, {
    id: restaurant.id,
    name: restaurant.name,
    deliveryFee: restaurant.deliveryFee,
    address: restaurant.address
  });
};
*/
