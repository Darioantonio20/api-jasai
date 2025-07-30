import express from 'express';
import {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore
} from '../controllers/storeController';
import { protect, authorize } from '../middlewares/auth';

// Include other resource routers
import productRouter from './productRoutes';

const router = express.Router();

// Re-route into other resource routers
router.use('/:storeId/products', productRouter);

// Public routes
router.get('/', getStores);
router.get('/:id', getStore);

// Protected routes
router.use(protect);

// Admin/store_owner routes
router.post('/', authorize('admin', 'store_owner'), createStore);
router.put('/:id', authorize('admin', 'store_owner'), updateStore);

// Admin only routes
router.delete('/:id', authorize('admin'), deleteStore);

export default router; 