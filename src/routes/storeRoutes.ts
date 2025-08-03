import express from 'express';
import {
  getStores,
  getStore,
  getStoreByOwner,
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

// Protected routes
router.use(protect);

// Get store by owner ID (debe ir antes de getStore por el patrón de la URL)
router.get('/owner/:ownerId', authorize('admin', 'store_owner'), getStoreByOwner);

// Rutas con :id deben ir después de rutas específicas para evitar conflictos
router.get('/:id', getStore);
router.put('/:id', authorize('admin', 'store_owner'), updateStore);
router.delete('/:id', authorize('admin'), deleteStore);

export default router;