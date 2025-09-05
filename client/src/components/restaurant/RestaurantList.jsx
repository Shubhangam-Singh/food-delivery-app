import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import './RestaurantList.css';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const getCurrentFilters = () => ({
    search: searchParams.get('search') || '',
    cuisine: searchParams.get('cuisine') || '',
    minRating: searchParams.get('minRating') || '0',
    maxDeliveryFee: searchParams.get('maxDeliveryFee') || '1000',
    sortBy: searchParams.get('sortBy') || 'rating',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: searchParams.get('page') || '1'
  });

  const updateFilters = useCallback((newFilters) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== '0' && value !== '1000') {
        updatedParams.set(key, value);
      } else {
        updatedParams.delete(key);
      }
    });
    
    if (newFilters.page === undefined) {
      updatedParams.delete('page');
    }
    
    setSearchParams(updatedParams);
  }, [searchParams, setSearchParams]);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = getCurrentFilters();
      const response = await axios.get('/api/restaurants', {
        params: filters
      });

      if (response.data.success) {
        setRestaurants(response.data.data.restaurants);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value });
  };

  const handleSortChange = (sortBy, sortOrder) => {
    updateFilters({ sortBy, sortOrder });
  };

  const handlePageChange = (page) => {
    updateFilters({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filters = getCurrentFilters();

  if (error) {
    return (
      <div className="restaurant-list-container">
        <div className="error-message">
          <h2>😔 Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchRestaurants} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-list-container">
      <div className="restaurant-list-header">
        <div className="header-content">
          <h1>🍽️ Discover Restaurants</h1>
          <p>Find and order from the best restaurants near you</p>
        </div>
        
        <SearchBar 
          value={filters.search}
          onSearch={handleSearch}
          placeholder="Search restaurants, cuisines..."
        />
        
        <div className="list-controls">
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters {Object.values(filters).some(v => v && v !== '0' && v !== '1000' && v !== 'rating' && v !== 'desc' && v !== '1') && '(Active)'}
          </button>
          
          <div className="sort-controls">
            <select 
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleSortChange(sortBy, sortOrder);
              }}
              className="sort-select"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="deliveryFee-asc">Lowest Delivery Fee</option>
              <option value="deliveryFee-desc">Highest Delivery Fee</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      <div className="restaurant-list-content">
        {loading ? (
          <div className="restaurant-grid">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="restaurant-card loading">
                <div className="restaurant-image"></div>
                <div className="restaurant-info">
                  <div style={{ height: '24px', marginBottom: '8px' }}></div>
                  <div style={{ height: '16px', marginBottom: '8px' }}></div>
                  <div style={{ height: '16px', marginBottom: '8px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="no-results">
            <h2>🔍 No restaurants found</h2>
            <p>Try adjusting your search or filters</p>
            <button 
              onClick={() => {
                setSearchParams({});
                setShowFilters(false);
              }}
              className="clear-filters-button"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="results-info">
              <p>
                Found <strong>{pagination.totalCount}</strong> restaurants
                {filters.search && ` for "${filters.search}"`}
              </p>
            </div>
            
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant} 
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="pagination-button"
                >
                  ← Previous
                </button>
                
                <div className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="pagination-button"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;
