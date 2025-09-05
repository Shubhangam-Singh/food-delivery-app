import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'CUSTOMER':
        return { text: 'Customer', icon: '👤', color: '#3498db' };
      case 'RESTAURANT_OWNER':
        return { text: 'Restaurant Owner', icon: '🏪', color: '#e67e22' };
      case 'ADMIN':
        return { text: 'Administrator', icon: '👑', color: '#9b59b6' };
      default:
        return { text: role, icon: '👤', color: '#95a5a6' };
    }
  };

  const roleInfo = getRoleDisplay(user?.role);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍕 Food Delivery Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="profile-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <h3>{user?.firstName} {user?.lastName}</h3>
            <div 
              className="role-badge" 
              style={{ backgroundColor: roleInfo.color }}
            >
              <span className="role-icon">{roleInfo.icon}</span>
              {roleInfo.text}
            </div>
          </div>

          <nav className="dashboard-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            
            {user?.role === 'CUSTOMER' && (
              <>
                <button
                  className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  📦 My Orders
                </button>
                <button
                  className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  📍 Addresses
                </button>
              </>
            )}

            {user?.role === 'RESTAURANT_OWNER' && (
              <>
                <button
                  className={`nav-item ${activeTab === 'restaurant' ? 'active' : ''}`}
                  onClick={() => setActiveTab('restaurant')}
                >
                  🏪 My Restaurant
                </button>
                <button
                  className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
                  onClick={() => setActiveTab('menu')}
                >
                  🍽️ Menu Management
                </button>
                <button
                  className={`nav-item ${activeTab === 'restaurant-orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('restaurant-orders')}
                >
                  📋 Orders
                </button>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <button
                  className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  👥 Users
                </button>
                <button
                  className={`nav-item ${activeTab === 'restaurants' ? 'active' : ''}`}
                  onClick={() => setActiveTab('restaurants')}
                >
                  🏪 Restaurants
                </button>
                <button
                  className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  📊 Analytics
                </button>
              </>
            )}
          </nav>
        </aside>

        <main className="dashboard-main">
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>Profile Information</h2>
              <div className="profile-info">
                <div className="info-grid">
                  <div className="info-item">
                    <label>First Name</label>
                    <span>{user?.firstName}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Name</label>
                    <span>{user?.lastName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{user?.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{user?.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Account Type</label>
                    <span>{roleInfo.text}</span>
                  </div>
                  <div className="info-item">
                    <label>Member Since</label>
                    <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="edit-profile-button">
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && user?.role === 'CUSTOMER' && (
            <div className="tab-content">
              <h2>My Orders</h2>
              <div className="coming-soon">
                <h3>�� Coming Soon</h3>
                <p>Order history and tracking will be available here.</p>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && user?.role === 'CUSTOMER' && (
            <div className="tab-content">
              <h2>Delivery Addresses</h2>
              <div className="coming-soon">
                <h3>🚧 Coming Soon</h3>
                <p>Manage your delivery addresses here.</p>
              </div>
            </div>
          )}

          {activeTab === 'restaurant' && user?.role === 'RESTAURANT_OWNER' && (
            <div className="tab-content">
              <h2>Restaurant Management</h2>
              <div className="coming-soon">
                <h3>🚧 Coming Soon</h3>
                <p>Manage your restaurant details here.</p>
              </div>
            </div>
          )}

          {activeTab === 'menu' && user?.role === 'RESTAURANT_OWNER' && (
            <div className="tab-content">
              <h2>Menu Management</h2>
              <div className="coming-soon">
                <h3>🚧 Coming Soon</h3>
                <p>Add and manage your menu items here.</p>
              </div>
            </div>
          )}

          {activeTab === 'restaurant-orders' && user?.role === 'RESTAURANT_OWNER' && (
            <div className="tab-content">
              <h2>Restaurant Orders</h2>
              <div className="coming-soon">
                <h3>🚧 Coming Soon</h3>
                <p>View and manage incoming orders here.</p>
              </div>
            </div>
          )}

          {user?.role === 'ADMIN' && (
            <div className="tab-content">
              <h2>Admin Panel</h2>
              <div className="coming-soon">
                <h3>🚧 Coming Soon</h3>
                <p>Admin features will be available here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
