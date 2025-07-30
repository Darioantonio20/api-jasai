import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Store } from '../models/Store';

// @desc    Get all products by store
// @route   GET /api/stores/:storeId/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query: any = { storeId: req.params.storeId };

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

    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
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

// @desc    Get single product
// @route   GET /api/stores/:storeId/products/:id
// @access  Public
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      storeId: req.params.storeId
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/stores/:storeId/products
// @access  Private (store owner/admin)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findById(req.params.storeId);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    // Check if user is store owner or admin
    if (store.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'No autorizado para crear productos en esta tienda'
      });
      return;
    }

    // Add store id to body
    req.body.storeId = req.params.storeId;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/stores/:storeId/products/:id
// @access  Private (store owner/admin)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    let product = await Product.findOne({
      _id: req.params.id,
      storeId: req.params.storeId
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
      return;
    }

    const store = await Store.findById(req.params.storeId);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    // Check if user is store owner or admin
    if (store.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'No autorizado para actualizar productos en esta tienda'
      });
      return;
    }

    product = await Product.findOneAndUpdate(
      { _id: req.params.id, storeId: req.params.storeId },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Toggle product status (active/inactive)
// @route   PUT /api/stores/:storeId/products/:id/toggle-status
// @access  Private (store owner/admin)
export const toggleProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      storeId: req.params.storeId
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
      return;
    }

    const store = await Store.findById(req.params.storeId);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    // Check if user is store owner or admin
    if (store.ownerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'No autorizado para modificar productos en esta tienda'
      });
      return;
    }

    // Toggle status
    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 