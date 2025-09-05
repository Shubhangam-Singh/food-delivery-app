const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', restaurantController.getAllRestaurants);
router.get('/search-suggestions', restaurantController.getSearchSuggestions);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/menu', restaurantController.getRestaurantMenu);

// Protected routes (authentication required)
router.post('/', auth, authorize('RESTAURANT_OWNER', 'ADMIN'), restaurantController.createRestaurant);
router.put('/:id', auth, authorize('RESTAURANT_OWNER', 'ADMIN'), restaurantController.updateRestaurant);
router.delete('/:id', auth, authorize('RESTAURANT_OWNER', 'ADMIN'), restaurantController.deleteRestaurant);

module.exports = router;
