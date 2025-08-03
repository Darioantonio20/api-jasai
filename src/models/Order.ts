import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../interfaces/order.interface';

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Nombre del cliente es requerido'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email del cliente es requerido'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Teléfono del cliente es requerido'],
      trim: true
    },
    shippingAddress: {
      type: String,
      required: [true, 'Dirección de envío es requerida'],
      trim: true
    }
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo']
    },
    note: {
      type: String,
      trim: true
    }
  }],
  totals: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo']
    },
    shipping: {
      type: Number,
      required: true,
      min: [0, 'El envío no puede ser negativo']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'El total no puede ser negativo']
    }
  },
  payment: {
    method: {
      type: String,
      required: [true, 'Método de pago es requerido'],
      enum: ['efectivo', 'transferencia', 'tarjeta']
    },
    details: {
      type: String,
      required: [true, 'Detalles del pago son requeridos'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pendiente', 'pagado', 'rechazado'],
      default: 'pendiente'
    }
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generar número de orden automáticamente
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const count = await Order.countDocuments();
      this.orderNumber = `#${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // Si hay error, usar timestamp como fallback
      this.orderNumber = `#${Date.now()}`;
    }
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema); 