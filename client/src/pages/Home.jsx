import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🍕 Welcome to Food Delivery</h1>
          <p className="hero-subtitle">
            Order delicious food from your favorite restaurants and get it delivered fresh to your doorstep
          </p>
          <div className="hero-actions">
            <Link to="/restaurants" className="cta-button primary">
              Browse Restaurants
            </Link>
            {!isAuthenticated ? (
              <Link to="/register" className="cta-button secondary">
                Sign Up Now
              </Link>
            ) : (
              <Link to="/dashboard" className="cta-button secondary">
                My Dashboard
              </Link>
            )}
          </div>
          {isAuthenticated && (
            <p className="welcome-message">
              Welcome back, <strong>{user?.firstName}</strong>! Ready to order something delicious?
            </p>
          )}
        </div>
        <div className="hero-image">
          <div className="floating-food">🍔</div>
          <div className="floating-food">🍕</div>
          <div className="floating-food">🥗</div>
          <div className="floating-food">🍜</div>
          <div className="floating-food">🌮</div>
          <div className="floating-food">🍦</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Get your food delivered in 30 minutes or less</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏪</div>
              <h3>Wide Selection</h3>
              <p>Choose from hundreds of restaurants and cuisines</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Easy Payment</h3>
              <p>Multiple payment options for your convenience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Assured</h3>
              <p>Only the best rated restaurants on our platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cuisines */}
      <section className="cuisines-section">
        <div className="container">
          <h2 className="section-title">Popular Cuisines</h2>
          <div className="cuisines-grid">
            <Link to="/restaurants?cuisine=North Indian" className="cuisine-card">
              <div className="cuisine-emoji">🍛</div>
              <span>North Indian</span>
            </Link>
            <Link to="/restaurants?cuisine=Chinese" className="cuisine-card">
              <div className="cuisine-emoji">🥢</div>
              <span>Chinese</span>
            </Link>
            <Link to="/restaurants?cuisine=Italian" className="cuisine-card">
              <div className="cuisine-emoji">🍝</div>
              <span>Italian</span>
            </Link>
            <Link to="/restaurants?cuisine=South Indian" className="cuisine-card">
              <div className="cuisine-emoji">🥞</div>
              <span>South Indian</span>
            </Link>
            <Link to="/restaurants?cuisine=Fast Food" className="cuisine-card">
              <div className="cuisine-emoji">🍔</div>
              <span>Fast Food</span>
            </Link>
            <Link to="/restaurants?cuisine=Desserts" className="cuisine-card">
              <div className="cuisine-emoji">🍰</div>
              <span>Desserts</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Order?</h2>
            <p>Join thousands of satisfied customers who trust us for their food delivery needs</p>
            <div className="cta-buttons">
              <Link to="/restaurants" className="cta-button primary large">
                Start Ordering Now
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="cta-button secondary large">
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
