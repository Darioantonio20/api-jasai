import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
} from '../controllers/productController';
import { protect, authorize } from '../middlewares/auth';
import { setStore } from '../middlewares/store';

const router = express.Router({ mergeParams: true });

// Aplicar el middleware setStore a todas las rutas
router.use(setStore);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.use(protect);

// Store owner/admin routes
router.post('/', authorize('admin', 'store_owner'), createProduct);
router.put('/:id', authorize('admin', 'store_owner'), updateProduct);
router.put('/:id/toggle-status', authorize('admin', 'store_owner'), toggleProductStatus);
router.delete('/:id', authorize('admin', 'store_owner'), deleteProduct);

export default router;