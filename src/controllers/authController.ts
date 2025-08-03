import { Request, Response } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone,
      location,
      role = 'client',
      store // Solo para role = 'admin'
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !location) {
      res.status(400).json({
        success: false,
        error: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    // Validate location fields
    if (!location.alias || !location.googleMapsUrl) {
      res.status(400).json({
        success: false,
        error: 'Por favor proporciona el alias y el enlace de Google Maps para la ubicación'
      });
      return;
    }

    // Validate Google Maps URL format
    if (!location.googleMapsUrl.startsWith('https://maps.app.goo.gl/') && 
        !location.googleMapsUrl.startsWith('https://goo.gl/maps/')) {
      res.status(400).json({
        success: false,
        error: 'El enlace de Google Maps proporcionado no es válido'
      });
      return;
    }

    // Validate phone format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json({
        success: false,
        error: 'El número telefónico debe estar en formato internacional (Ej: +529614795475)'
      });
      return;
    }

    // Additional validations for admin role
    if (role === 'admin') {
      if (!store) {
        res.status(400).json({
          success: false,
          error: 'La información de la tienda es requerida para cuentas de administrador'
        });
        return;
      }

      // Validate store schedule
      if (!store.schedule || !Array.isArray(store.schedule) || store.schedule.length !== 7) {
        res.status(400).json({
          success: false,
          error: 'Debe proporcionar el horario para todos los días de la semana'
        });
        return;
      }

      // Validate store categories
      if (!store.categories || !Array.isArray(store.categories) || store.categories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Debe seleccionar al menos una categoría para la tienda'
        });
        return;
      }

      // Validate store phone format
      if (!phoneRegex.test(store.phone)) {
        res.status(400).json({
          success: false,
          error: 'El número telefónico de la tienda debe estar en formato internacional (Ej: +529614795475)'
        });
        return;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      location,
      role
    });

    // If admin role, create store
    if (role === 'admin' && store) {
      store.ownerId = user._id;
      await Store.create(store);
    }

    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Por favor proporciona email y contraseña'
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    let userData: any = user?.toObject();

    // If user is admin, get their store information
    if (user?.role === 'admin') {
      const store = await Store.findOne({ ownerId: user._id });
      userData = { ...userData, store };
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  // Create token
  const token = user.getSignedJwtToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};