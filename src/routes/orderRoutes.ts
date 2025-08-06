import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getAdminStats,
  getClientOrders,
  getClientOrder
} from '../controllers/orderController';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/create', createOrder);

// Protected routes
router.use(protect);

// Client routes
router.get('/my-orders', getClientOrders);
router.get('/my-orders/:id', getClientOrder);

// Admin routes
router.get('/admin/orders', authorize('admin'), getOrders);
router.get('/admin/orders/:id', authorize('admin'), getOrder);
router.put('/admin/orders/:id/status', authorize('admin'), updateOrderStatus);
router.get('/admin/stats', authorize('admin'), getAdminStats);

export default router; 