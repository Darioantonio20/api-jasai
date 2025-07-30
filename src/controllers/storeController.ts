import { Request, Response } from 'express';
import { Store } from '../models/Store';

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Add category filter
    if (category) {
      query.category = category;
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
      .populate('ownerId', 'name email');

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      data: stores,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
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
    const store = await Store.findById(req.params.id).populate('ownerId', 'name email');

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
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

// @desc    Create store
// @route   POST /api/stores
// @access  Private (admin/store_owner)
export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add user to req.body
    req.body.ownerId = req.user?.id;

    const store = await Store.create(req.body);

    res.status(201).json({
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

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (admin/store_owner)
export const updateStore = async (req: Request, res: Response): Promise<void> => {
  try {
    let store = await Store.findById(req.params.id);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    // Make sure user is store owner or admin
    if (store.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this store'
      });
      return;
    }

    store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (admin only)
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

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