import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddressForm from './AddressForm';
import './AddressSelector.css';

const AddressSelector = ({ selectedAddressId, onAddressSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('/api/addresses');
      if (response.data.success) {
        setAddresses(response.data.data);
        
        // Auto-select default address if no address is selected
        if (!selectedAddressId && response.data.data.length > 0) {
          const defaultAddress = response.data.data.find(addr => addr.isDefault) || response.data.data[0];
          onAddressSelect(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressCreated = (newAddress) => {
    setAddresses([newAddress, ...addresses]);
    setShowAddForm(false);
    onAddressSelect(newAddress);
  };

  const handleAddressUpdated = (updatedAddress) => {
    setAddresses(addresses.map(addr => 
      addr.id === updatedAddress.id ? updatedAddress : addr
    ));
    setEditingAddress(null);
    if (selectedAddressId === updatedAddress.id) {
      onAddressSelect(updatedAddress);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await axios.delete(`/api/addresses/${addressId}`);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      
      if (selectedAddressId === addressId) {
        const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
        if (remainingAddresses.length > 0) {
          onAddressSelect(remainingAddresses[0]);
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'HOME': return '🏠';
      case 'WORK': return '💼';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div className="address-selector">
        <h3>📍 Delivery Address</h3>
        <div className="loading">Loading addresses...</div>
      </div>
    );
  }

  return (
    <div className="address-selector">
      <div className="section-header">
        <h3>📍 Delivery Address</h3>
        <button 
          className="add-address-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="no-addresses">
          <p>No saved addresses found.</p>
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map(address => (
            <div 
              key={address.id}
              className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="address-header">
                <div className="address-type">
                  {getAddressTypeIcon(address.addressType)} {address.addressType}
                  {address.isDefault && <span className="default-badge">DEFAULT</span>}
                </div>
                <div className="address-actions">
                  <button 
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(address);
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="address-content">
                <p className="address-street">{address.street}</p>
                {address.landmark && (
                  <p className="address-landmark">📍 {address.landmark}</p>
                )}
                <p className="address-city">
                  {address.city}, {address.state} {address.zipCode}
                </p>
              </div>

              {selectedAddressId === address.id && (
                <div className="selected-indicator">
                  ✅ Selected
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(showAddForm || editingAddress) && (
        <AddressForm
          address={editingAddress}
          onSave={editingAddress ? handleAddressUpdated : handleAddressCreated}
          onCancel={() => {
            setShowAddForm(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
};

export default AddressSelector;
