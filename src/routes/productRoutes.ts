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

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.use(protect);
router.use(authorize('admin', 'store_owner'));

router.route('/')
  .post(createProduct);

router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

router.put('/:id/toggle-status', toggleProductStatus);

export default router; 