import mongoose, { Schema } from 'mongoose';
import { IStore } from '../interfaces/store.interface';

const storeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nombre de la tienda es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  responsibleName: {
    type: String,
    required: [true, 'Nombre del responsable es requerido'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Número telefónico es requerido'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Categoría es requerida'],
    enum: ['Restaurante', 'Ropa', 'Tecnología', 'Hogar', 'Otros']
  },
  description: {
    type: String,
    required: [true, 'Descripción es requerida'],
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: [true, 'Ubicación es requerida']
  },
  address: {
    type: String,
    required: [true, 'Dirección es requerida']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
storeSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Store = mongoose.model<IStore>('Store', storeSchema); 