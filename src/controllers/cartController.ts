import { Request, Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';

// Middleware para obtener sessionId
const getSessionId = (req: Request): string => {
  return req.headers['x-session-id'] as string || req.cookies?.sessionId || 'default-session';
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Public
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = getSessionId(req);
    const { storeId } = req.query;

    if (!storeId) {
      res.status(400).json({
        success: false,
        error: 'storeId es requerido'
      });
      return;
    }

    let cart = await Cart.findOne({ sessionId, storeId });

    if (!cart) {
      cart = await Cart.create({
        sessionId,
        storeId,
        items: []
      });
    }

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Public
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1, note } = req.body;
    const sessionId = getSessionId(req);
    const { storeId } = req.body;

    if (!productId || !storeId) {
      res.status(400).json({
        success: false,
        error: 'productId y storeId son requeridos'
      });
      return;
    }

    // Verificar que el producto existe y está activo
    const product = await Product.findOne({
      _id: productId,
      storeId,
      status: 'active'
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado o no disponible'
      });
      return;
    }

    // Verificar stock
    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        error: 'Stock insuficiente'
      });
      return;
    }

    let cart = await Cart.findOne({ sessionId, storeId });

    if (!cart) {
      cart = await Cart.create({
        sessionId,
        storeId,
        items: []
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Actualizar cantidad
      cart.items[existingItemIndex].quantity += quantity;
      if (note) {
        cart.items[existingItemIndex].note = note;
      }
    } else {
      // Agregar nuevo item
      cart.items.push({
        productId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.images[0] || '',
        quantity,
        note
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/update
// @access  Public
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity, note } = req.body;
    const sessionId = getSessionId(req);
    const { storeId } = req.body;

    if (!productId || !storeId) {
      res.status(400).json({
        success: false,
        error: 'productId y storeId son requeridos'
      });
      return;
    }

    const cart = await Cart.findOne({ sessionId, storeId });

    if (!cart) {
      res.status(404).json({
        success: false,
        error: 'Carrito no encontrado'
      });
      return;
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Producto no encontrado en el carrito'
      });
      return;
    }

    // Verificar stock si se está actualizando la cantidad
    if (quantity !== undefined) {
      const product = await Product.findById(productId);
      if (product && product.stock < quantity) {
        res.status(400).json({
          success: false,
          error: 'Stock insuficiente'
        });
        return;
      }
      cart.items[itemIndex].quantity = quantity;
    }

    if (note !== undefined) {
      cart.items[itemIndex].note = note;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Public
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, storeId } = req.body;
    const sessionId = getSessionId(req);

    if (!productId || !storeId) {
      res.status(400).json({
        success: false,
        error: 'productId y storeId son requeridos'
      });
      return;
    }

    const cart = await Cart.findOne({ sessionId, storeId });

    if (!cart) {
      res.status(404).json({
        success: false,
        error: 'Carrito no encontrado'
      });
      return;
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Public
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.body;
    const sessionId = getSessionId(req);

    if (!storeId) {
      res.status(400).json({
        success: false,
        error: 'storeId es requerido'
      });
      return;
    }

    const cart = await Cart.findOne({ sessionId, storeId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: {
        items: [],
        totalItems: 0,
        subtotal: 0
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 