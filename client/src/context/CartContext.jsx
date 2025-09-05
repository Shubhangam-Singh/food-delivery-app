import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// Cart reducer for complex state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || [],
        restaurantId: action.payload.restaurantId || null,
        restaurantInfo: action.payload.restaurantInfo || null,
      };

    case 'ADD_ITEM':
      const { item, restaurantId, restaurantInfo } = action.payload;
      
      // Check if adding from different restaurant
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        return {
          ...state,
          pendingAdd: { item, restaurantId, restaurantInfo },
          showRestaurantChangeModal: true,
        };
      }

      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem.id === item.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Add new item
        newItems = [...state.items, { ...item, quantity: 1, specialInstructions: '' }];
      }

      return {
        ...state,
        items: newItems,
        restaurantId: restaurantId,
        restaurantInfo: restaurantInfo,
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId),
      };

    case 'UPDATE_QUANTITY':
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== itemId),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      };

    case 'UPDATE_INSTRUCTIONS':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, specialInstructions: action.payload.instructions }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        restaurantId: null,
        restaurantInfo: null,
      };

    case 'REPLACE_CART':
      const { item: newItem, restaurantId: newRestaurantId, restaurantInfo: newRestaurantInfo } = state.pendingAdd;
      return {
        ...state,
        items: [{ ...newItem, quantity: 1, specialInstructions: '' }],
        restaurantId: newRestaurantId,
        restaurantInfo: newRestaurantInfo,
        pendingAdd: null,
        showRestaurantChangeModal: false,
      };

    case 'CANCEL_RESTAURANT_CHANGE':
      return {
        ...state,
        pendingAdd: null,
        showRestaurantChangeModal: false,
      };

    case 'SET_DELIVERY_INFO':
      return {
        ...state,
        deliveryAddress: action.payload.address,
        deliveryInstructions: action.payload.instructions,
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  restaurantId: null,
  restaurantInfo: null,
  deliveryAddress: null,
  deliveryInstructions: '',
  pendingAdd: null,
  showRestaurantChangeModal: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('fooddelivery_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    const cartData = {
      items: state.items,
      restaurantId: state.restaurantId,
      restaurantInfo: state.restaurantInfo,
      deliveryAddress: state.deliveryAddress,
      deliveryInstructions: state.deliveryInstructions,
    };
    localStorage.setItem('fooddelivery_cart', JSON.stringify(cartData));
  }, [state.items, state.restaurantId, state.restaurantInfo, state.deliveryAddress, state.deliveryInstructions]);

  // Action creators
  const addItem = (item, restaurantId, restaurantInfo) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { item, restaurantId, restaurantInfo }
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeItem = (itemId) => {
    const item = state.items.find(item => item.id === itemId);
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
    if (item) {
      toast.success(`${item.name} removed from cart`);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const updateInstructions = (itemId, instructions) => {
    dispatch({ type: 'UPDATE_INSTRUCTIONS', payload: { itemId, instructions } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  const replaceCart = () => {
    dispatch({ type: 'REPLACE_CART' });
    toast.success('Cart replaced with new restaurant items');
  };

  const cancelRestaurantChange = () => {
    dispatch({ type: 'CANCEL_RESTAURANT_CHANGE' });
  };

  const setDeliveryInfo = (address, instructions) => {
    dispatch({ type: 'SET_DELIVERY_INFO', payload: { address, instructions } });
  };

  // Computed values
  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    return state.restaurantInfo?.deliveryFee || 0;
  };

  const getTax = () => {
    const subtotal = getCartTotal();
    return subtotal * 0.05; // 5% tax
  };

  const getFinalTotal = () => {
    return getCartTotal() + getDeliveryFee() + getTax();
  };

  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  const getItemById = (itemId) => {
    return state.items.find(item => item.id === itemId);
  };

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    updateInstructions,
    clearCart,
    replaceCart,
    cancelRestaurantChange,
    setDeliveryInfo,
    getCartItemsCount,
    getCartTotal,
    getDeliveryFee,
    getTax,
    getFinalTotal,
    isCartEmpty,
    getItemById,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
