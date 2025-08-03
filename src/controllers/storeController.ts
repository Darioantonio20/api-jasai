import { Request, Response } from 'express';
import { Store } from '../models/Store';
import { Product } from '../models/Product';

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categories, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Add categories filter (ahora es un array)
    if (categories) {
      query.categories = { $in: Array.isArray(categories) ? categories : [categories] };
    }

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const stores = await Store.find(query)
      .skip(skip)
      .limit(Number(limit))
      .populate('ownerId', 'name email')
      .lean();

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      count: stores.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      },
      data: stores
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
export const getStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('ownerId', 'name email')
      .lean();

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get store by owner ID
// @route   GET /api/stores/owner/:ownerId
// @access  Private (admin/store_owner)
export const getStoreByOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findOne({ ownerId: req.params.ownerId })
      .populate('ownerId', 'name email')
      .lean();

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    // Verificar que el usuario sea el dueño o un admin
    if (store.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'No autorizado para ver esta tienda'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (admin/store_owner)
export const updateStore = async (req: Request, res: Response): Promise<void> => {
  try {
    let store = await Store.findById(req.params.id);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    // Make sure user is store owner or admin
    if (store.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'No autorizado para actualizar esta tienda'
      });
      return;
    }

    // Validate schedule if it's being updated
    if (req.body.schedule) {
      if (!Array.isArray(req.body.schedule) || req.body.schedule.length !== 7) {
        res.status(400).json({
          success: false,
          error: 'Debe proporcionar el horario para todos los días de la semana'
        });
        return;
      }

      // Validar formato de horarios
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const isValidSchedule = req.body.schedule.every((day: any) => {
        return timeRegex.test(day.openTime) && timeRegex.test(day.closeTime);
      });

      if (!isValidSchedule) {
        res.status(400).json({
          success: false,
          error: 'Los horarios deben estar en formato HH:mm'
        });
        return;
      }
    }

    // Validate categories if they're being updated
    if (req.body.categories) {
      if (!Array.isArray(req.body.categories) || req.body.categories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Debe seleccionar al menos una categoría'
        });
        return;
      }
    }

    // Validate phone if it's being updated
    if (req.body.phone) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(req.body.phone)) {
        res.status(400).json({
          success: false,
          error: 'El número telefónico debe estar en formato internacional (Ej: +529614795475)'
        });
        return;
      }
    }

    // Validate location if it's being updated
    if (req.body.location) {
      if (!req.body.location.alias || !req.body.location.googleMapsUrl) {
        res.status(400).json({
          success: false,
          error: 'La ubicación debe incluir alias y URL de Google Maps'
        });
        return;
      }

      if (!req.body.location.googleMapsUrl.startsWith('https://maps.app.goo.gl/') && 
          !req.body.location.googleMapsUrl.startsWith('https://goo.gl/maps/')) {
        res.status(400).json({
          success: false,
          error: 'El enlace de Google Maps proporcionado no es válido'
        });
        return;
      }
    }

    // Update store with new data
    store = await Store.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true
      }
    ).populate('ownerId', 'name email');

    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete store and all its products
// @route   DELETE /api/stores/:id
// @access  Private (admin only)
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    // Delete all products associated with the store
    await Product.deleteMany({ storeId: store._id });

    // Delete the store
    await store.deleteOne();

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