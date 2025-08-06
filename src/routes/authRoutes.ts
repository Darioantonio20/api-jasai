import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout, 
  updateProfile, 
  changePassword,
  addLocation,
  updateLocation,
  deleteLocation,
  setCurrentLocation,
  getCurrentLocation
} from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Location management routes
router.post('/locations', protect, addLocation);
router.put('/locations/:locationId', protect, updateLocation);
router.delete('/locations/:locationId', protect, deleteLocation);
router.put('/locations/:locationId/set-current', protect, setCurrentLocation);
router.get('/locations/current', protect, getCurrentLocation);

export default router;