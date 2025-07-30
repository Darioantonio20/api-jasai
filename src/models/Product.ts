import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/product.interface';

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descripción es requerida'],
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'Precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'Stock es requerido'],
    min: [0, 'El stock no puede ser negativo']
  },
  category: {
    type: String,
    required: [true, 'Categoría es requerida']
  },
  image: {
    type: String,
    required: [true, 'Imagen es requerida']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema); 