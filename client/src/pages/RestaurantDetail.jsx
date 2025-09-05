import React from 'react';
import { useParams } from 'react-router-dom';

const RestaurantDetail = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🚧 Restaurant Details Coming Soon</h1>
      <p>Restaurant ID: {id}</p>
      <p>This page will show restaurant details, menu, and ordering options.</p>
      <a href="/restaurants" style={{ color: '#007bff', textDecoration: 'none' }}>
        ← Back to Restaurants
      </a>
    </div>
  );
};

export default RestaurantDetail;
