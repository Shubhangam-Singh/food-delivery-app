import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  const {
    id,
    name,
    description,
    image,
    rating,
    totalReviews,
    cuisineType,
    deliveryFee,
    minOrder,
    address,
    averagePrice,
    isOpen,
    menuItems
  } = restaurant;

  const formatDeliveryFee = (fee) => {
    return fee === 0 ? 'Free delivery' : `₹${fee} delivery`;
  };

  const getPriceRange = (avgPrice) => {
    if (avgPrice <= 200) return '₹';
    if (avgPrice <= 400) return '₹₹';
    return '₹₹₹';
  };

  return (
    <Link to={`/restaurants/${id}`} className="restaurant-card-link">
      <div className="restaurant-card">
        <div className="restaurant-image">
          <img 
            src={image || '/placeholder-restaurant.jpg'} 
            alt={name}
            onError={(e) => {
              e.target.src = '/placeholder-restaurant.jpg';
            }}
          />
          {!isOpen && <div className="closed-overlay">Closed</div>}
          <div className="rating-badge">
            <span className="rating-star">★</span>
            <span className="rating-text">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="restaurant-info">
          <div className="restaurant-header">
            <h3 className="restaurant-name">{name}</h3>
            <div className="price-range">{getPriceRange(averagePrice)}</div>
          </div>

          <p className="restaurant-description">{description}</p>

          <div className="cuisine-tags">
            {cuisineType.slice(0, 3).map((cuisine, index) => (
              <span key={index} className="cuisine-tag">
                {cuisine}
              </span>
            ))}
            {cuisineType.length > 3 && (
              <span className="cuisine-tag more">
                +{cuisineType.length - 3} more
              </span>
            )}
          </div>

          <div className="restaurant-stats">
            <div className="stat">
              <span className="stat-icon">⭐</span>
              <span>{rating.toFixed(1)} ({totalReviews} reviews)</span>
            </div>
            <div className="stat">
              <span className="stat-icon">🚚</span>
              <span>{formatDeliveryFee(deliveryFee)}</span>
            </div>
            <div className="stat">
              <span className="stat-icon">💰</span>
              <span>Min order ₹{minOrder}</span>
            </div>
          </div>

          <div className="restaurant-location">
            <span className="location-icon">📍</span>
            <span>{address?.city}, {address?.state}</span>
          </div>

          {menuItems && menuItems.length > 0 && (
            <div className="menu-preview">
              <div className="menu-items">
                {menuItems.slice(0, 3).map((item, index) => (
                  <span key={item.id} className="menu-item">
                    {item.name}
                    {index < Math.min(menuItems.length, 3) - 1 && ', '}
                  </span>
                ))}
                {menuItems.length > 3 && <span className="menu-more">...</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
