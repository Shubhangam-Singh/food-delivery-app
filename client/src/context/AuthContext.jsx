import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configure axios defaults
  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load user data
  const loadUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.data,
            token: Cookies.get('auth_token'),
          },
        });
      }
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token in cookie
        Cookies.set('auth_token', token, { expires: 7 });
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });

        toast.success(`Welcome back, ${user.firstName}!`);
        return { success: true };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('/api/auth/register', userData);

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token in cookie
        Cookies.set('auth_token', token, { expires: 7 });
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });

        toast.success(`Welcome to Food Delivery, ${user.firstName}!`);
        return { success: true };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from cookies
    Cookies.remove('auth_token');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update state
    dispatch({ type: 'LOGOUT' });
    
    toast.success('Logged out successfully');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
