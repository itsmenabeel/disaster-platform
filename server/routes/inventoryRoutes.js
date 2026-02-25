// inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { getInventory, addItem, updateItem, deleteItem, getLowStockAlerts } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/alerts', protect, authorize('ngo'), getLowStockAlerts);
router.route('/')
  .get(protect, authorize('ngo'), getInventory)
  .post(protect, authorize('ngo'), addItem);
router.route('/:id')
  .put(protect, authorize('ngo'), updateItem)
  .delete(protect, authorize('ngo'), deleteItem);

module.exports = router;
