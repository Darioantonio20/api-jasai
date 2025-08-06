import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Store } from '../models/Store';

// @desc    Create order
// @route   POST /api/orders/create
// @access  Public
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customer,
      items,
      payment,
      totals,
      storeId
    } = req.body;

    // Validar datos requeridos
    if (!customer || !items || !payment || !totals || !storeId) {
      res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
      return;
    }

    // Validar que hay al menos un producto
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'La orden debe tener al menos un producto'
      });
      return;
    }

    // Verificar stock de todos los productos
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(400).json({
          success: false,
          error: `Producto ${item.name} no encontrado`
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          error: `Stock insuficiente para ${item.name}`
        });
        return;
      }
    }

    // Crear la orden
    const order = await Order.create({
      customer,
      storeId,
      products: items,
      totals,
      payment
    });

    // Actualizar stock de productos
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get orders (Admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Filtrar por estado
    if (status) {
      query.status = status;
    }

    // Filtrar por fecha
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Solo órdenes de la tienda del admin
    if (req.user?.role === 'admin') {
      const store = await Store.findOne({ ownerId: req.user.id });
      if (store) {
        query.storeId = store._id;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          total,
          perPage: Number(limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/admin/orders/:id
// @access  Private (Admin)
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('storeId', 'name')
      .lean();

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
      return;
    }

    // Verificar que el admin puede ver esta orden
    if (req.user?.role === 'admin') {
      const store = await Store.findOne({ ownerId: req.user.id });
      
      // Corregir la comparación - order.storeId es un objeto populado
      const orderStoreId = typeof order.storeId === 'object' && order.storeId !== null 
        ? (order.storeId as any)._id.toString() 
        : order.storeId.toString();
      
      if (store && orderStoreId !== (store._id as any).toString()) {
        res.status(403).json({
          success: false,
          error: 'No autorizado para ver esta orden'
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Estado es requerido'
      });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
      return;
    }

    // Verificar que el admin puede actualizar esta orden
    if (req.user?.role === 'admin') {
      const store = await Store.findOne({ ownerId: req.user.id });
      
      // Corregir la comparación - order.storeId es un ObjectId directo
      const orderStoreId = order.storeId.toString();
      
      if (store && orderStoreId !== (store._id as any).toString()) {
        res.status(403).json({
          success: false,
          error: 'No autorizado para actualizar esta orden'
        });
        return;
      }
    }

    order.status = status;
    if (notes) {
      order.notes = notes;
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get client orders
// @route   GET /api/orders/my-orders
// @access  Private (Client)
export const getClientOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Filtrar por estado
    if (status) {
      query.status = status;
    }

    // Solo órdenes del cliente actual - CORREGIDO
    query['customer.email'] = req.user?.email;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          total,
          perPage: Number(limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single client order
// @route   GET /api/orders/my-orders/:id
// @access  Private (Client)
export const getClientOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('storeId', 'name')
      .lean();

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
      return;
    }

    // Verificar que el cliente puede ver esta orden - CORREGIDO
    const isClientOrder = order.customer && order.customer.email === req.user?.email;

    if (!isClientOrder) {
      res.status(403).json({
        success: false,
        error: 'No autorizado para ver esta orden'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    let storeFilter = {};
    
    if (req.user?.role === 'admin') {
      const store = await Store.findOne({ ownerId: req.user.id });
      if (store) {
        storeFilter = { storeId: store._id };
      }
    }

    // Estadísticas de productos
    const totalProducts = await Product.countDocuments(storeFilter);
    const activeProducts = totalProducts; // Todos los productos están activos ahora

    // Estadísticas de órdenes
    const totalOrders = await Order.countDocuments(storeFilter);
    const pendingOrders = await Order.countDocuments({ ...storeFilter, status: 'pendiente' });

    // Estadísticas de ingresos
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayRevenue = await Order.aggregate([
      { $match: { ...storeFilter, createdAt: { $gte: today }, status: { $ne: 'cancelado' } } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]);

    const weekRevenue = await Order.aggregate([
      { $match: { ...storeFilter, createdAt: { $gte: weekAgo }, status: { $ne: 'cancelado' } } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]);

    const monthRevenue = await Order.aggregate([
      { $match: { ...storeFilter, createdAt: { $gte: monthAgo }, status: { $ne: 'cancelado' } } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        revenue: {
          today: todayRevenue[0]?.total || 0,
          week: weekRevenue[0]?.total || 0,
          month: monthRevenue[0]?.total || 0
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 