import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/restaurants/${id}`);
      
      if (response.data.success) {
        const restaurantData = response.data.data;
        setRestaurant(restaurantData);
        
        // ✅ FIX: Get unique categories with proper filtering
        const validCategories = restaurantData.menuItems
          ?.filter(item => item.category && item.category.name) // Filter out undefined/null categories
          .map(item => item.category.name)
          .filter((category, index, arr) => arr.indexOf(category) === index) // Remove duplicates
          .sort() || [];
        
        console.log('Valid categories:', validCategories);
        
        // Set default category to first valid category or "All Items"
        if (validCategories.length > 0) {
          setSelectedCategory('All Items');
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      setError('Failed to load restaurant details');
      toast.error('Failed to load restaurant details');
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

    addItem(menuItem, restaurant.id, {
      id: restaurant.id,
      name: restaurant.name,
      deliveryFee: restaurant.deliveryFee,
      address: restaurant.address
    });
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
      <div className="restaurant-detail-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-detail-page">
        <div className="error-message">
          😕 {error}
          <button onClick={() => navigate('/restaurants')} className="back-btn">
            ← Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  // ✅ FIX: Get categories with proper null/undefined handling
  const categories = ['All Items'];
  if (restaurant.menuItems && restaurant.menuItems.length > 0) {
    const uniqueCategories = restaurant.menuItems
      .filter(item => item.category && item.category.name) // Only items with valid categories
      .map(item => item.category.name)
      .filter((category, index, arr) => arr.indexOf(category) === index)
      .sort();
    
    categories.push(...uniqueCategories);
  }

  // ✅ FIX: Filter menu items with category validation
  const filteredMenuItems = restaurant.menuItems?.filter(item => {
    // Always show items that have valid categories
    if (!item.category || !item.category.name) {
      return selectedCategory === 'All Items'; // Only show uncategorized items in "All Items"
    }
    
    return selectedCategory === 'All Items' || item.category.name === selectedCategory;
  }) || [];

  return (
    <div className="restaurant-detail-page">
      {/* Restaurant Header */}
      <div className="restaurant-header">
        <button onClick={() => navigate('/restaurants')} className="back-button">
          ← Back
        </button>
        
        <div className="restaurant-hero">
          {restaurant.image && (
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="restaurant-hero-image"
            />
          )}
          <div className="restaurant-hero-content">
            <h1>{restaurant.name}</h1>
            <p className="restaurant-description">{restaurant.description}</p>
            
            <div className="restaurant-meta">
              <span className="rating">⭐ {restaurant.rating}</span>
              <span className="delivery-info">
                🚚 {restaurant.deliveryFee === 0 ? 'Free delivery' : `₹${restaurant.deliveryFee} delivery`}
              </span>
              <span className="timing">🕐 {restaurant.openTime} - {restaurant.closeTime}</span>
            </div>
            
            <div className="restaurant-tags">
              {restaurant.cuisineType?.map(cuisine => (
                <span key={cuisine} className="cuisine-tag">{cuisine}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="menu-section">
        <h2>Menu</h2>
        
        {/* ✅ FIX: Category Tabs with Validation */}
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category || 'unknown'} // Fallback key
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category || 'Other'} {/* ✅ FIX: Show "Other" instead of undefined */}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="menu-items">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map(item => (
              <div key={item.id} className="menu-item">
                <div className="menu-item-info">
                  <div className="menu-item-header">
                    <h3 className="menu-item-name">
                      {item.isVeg ? '🟢' : '🔴'} {item.name}
                      {item.spiceLevel && (
                        <span className="spice-level">
                          {getSpiceIcon(item.spiceLevel)}
                        </span>
                      )}
                    </h3>
                    <div className="menu-item-price">₹{item.price}</div>
                  </div>
                  
                  {item.description && (
                    <p className="menu-item-description">{item.description}</p>
                  )}
                  
                  <div className="menu-item-meta">
                    {item.calories && <span>🔥 {item.calories} cal</span>}
                    {item.servingSize && <span>🍽️ {item.servingSize}</span>}
                    {item.timesOrdered > 0 && (
                      <span className="popularity">👥 Ordered {item.timesOrdered} times</span>
                    )}
                  </div>
                </div>

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
            ))
          ) : (
            <div className="no-items">
              <p>No items found in this category.</p>
              <button 
                className="show-all-btn"
                onClick={() => setSelectedCategory('All Items')}
              >
                Show All Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
