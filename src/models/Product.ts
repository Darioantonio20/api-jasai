import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import { Store } from './Store';

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
    required: [true, 'Categoría es requerida'],
    enum: [
      'tecnologia',
      'moda',
      'juguetes',
      'comida',
      'hogar',
      'jardin',
      'mascotas',
      'deportes',
      'belleza',
      'libros',
      'musica',
      'arte',
      'automotriz',
      'ferreteria'
    ],
    validate: {
      validator: async function(this: any, category: string) {
        // Verificar que la categoría esté entre las categorías de la tienda
        const store = await Store.findById(this.storeId);
        return store?.categories.includes(category);
      },
      message: 'La categoría del producto debe ser una de las categorías de la tienda'
    }
  },
  images: [{
    type: String,
    required: [true, 'Al menos una imagen es requerida']
  }],
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    validate: {
      validator: async function(storeId: string) {
        const store = await Store.findById(storeId);
        return store !== null;
      },
      message: 'La tienda especificada no existe'
    }
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: [200, 'La nota del admin no puede tener más de 200 caracteres']
  }
}, {
  timestamps: true
});

// Add index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);