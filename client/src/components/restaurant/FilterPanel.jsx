import React, { useState } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const cuisineOptions = [
    'North Indian',
    'South Indian',
    'Chinese',
    'Continental',
    'Italian',
    'Mexican',
    'Thai',
    'Japanese',
    'Mediterranean',
    'Fast Food',
    'Desserts',
    'Beverages'
  ];

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    Object.entries(localFilters).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      cuisine: '',
      minRating: '0',
      maxDeliveryFee: '1000',
      sortBy: 'rating',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    Object.entries(clearedFilters).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>🔍 Filter Restaurants</h3>
        <button onClick={onClose} className="close-button">✕</button>
      </div>

      <div className="filter-panel-content">
        <div className="filter-group">
          <label className="filter-label">Cuisine Type</label>
          <select
            value={localFilters.cuisine}
            onChange={(e) => handleLocalFilterChange('cuisine', e.target.value)}
            className="filter-select"
          >
            <option value="">All Cuisines</option>
            {cuisineOptions.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            Minimum Rating: {localFilters.minRating}⭐
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={localFilters.minRating}
            onChange={(e) => handleLocalFilterChange('minRating', e.target.value)}
            className="filter-range"
          />
          <div className="range-labels">
            <span>0⭐</span>
            <span>5⭐</span>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            Max Delivery Fee: ₹{localFilters.maxDeliveryFee}
          </label>
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={localFilters.maxDeliveryFee}
            onChange={(e) => handleLocalFilterChange('maxDeliveryFee', e.target.value)}
            className="filter-range"
          />
          <div className="range-labels">
            <span>₹0</span>
            <span>₹200</span>
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-button">
            Clear All
          </button>
          <button onClick={applyFilters} className="apply-button">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
