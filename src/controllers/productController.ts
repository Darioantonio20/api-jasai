import { Request, Response } from 'express';
import { Product } from '../models/Product';

// @desc    Get all products
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
      .limit(Number(limit))
      .populate('storeId', 'name')
      .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      },
      data: products
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
    }).populate('storeId', 'name');

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
    req.body.storeId = req.params.storeId;

    // Verificar que la categoría está entre las categorías de la tienda
    if (!req.store.categories.includes(req.body.category)) {
      res.status(400).json({
        success: false,
        error: 'La categoría del producto debe ser una de las categorías de la tienda'
      });
      return;
    }

    // Validar adminNote si se proporciona
    if (req.body.adminNote && req.body.adminNote.length > 200) {
      res.status(400).json({
        success: false,
        error: 'La nota del admin no puede tener más de 200 caracteres'
      });
      return;
    }

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

    // Si se está actualizando la categoría, verificar que sea válida
    if (req.body.category && !req.store.categories.includes(req.body.category)) {
      res.status(400).json({
        success: false,
        error: 'La categoría del producto debe ser una de las categorías de la tienda'
      });
      return;
    }

    // Validar adminNote si se está actualizando
    if (req.body.adminNote && req.body.adminNote.length > 200) {
      res.status(400).json({
        success: false,
        error: 'La nota del admin no puede tener más de 200 caracteres'
      });
      return;
    }

    product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        storeId: req.params.storeId
      },
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

// @desc    Delete product
// @route   DELETE /api/stores/:storeId/products/:id
// @access  Private (store owner/admin)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
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

    await product.deleteOne();

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