import mongoose, { Schema } from 'mongoose';
import { IStore } from '../interfaces/store.interface';

const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;  // Validación formato 24h "HH:mm"

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
    trim: true,
    match: [
      /^\+[1-9]\d{1,14}$/,
      'Por favor ingresa un número telefónico válido en formato internacional (Ej: +529614795475)'
    ],
    validate: {
      validator: function(v: string) {
        const digits = v.slice(1);
        return digits.length >= 10 && digits.length <= 15;
      },
      message: 'El número telefónico debe tener entre 10 y 15 dígitos'
    }
  },
  categories: [{
    type: String,
    required: [true, 'Al menos una categoría es requerida'],
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
    ]
  }],
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
    alias: {
      type: String,
      required: [true, 'El alias de ubicación es requerido'],
      trim: true,
      maxlength: [200, 'El alias de ubicación no puede tener más de 200 caracteres']
    },
    googleMapsUrl: {
      type: String,
      required: [true, 'El vínculo de Google Maps es requerido'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return v.startsWith('https://maps.app.goo.gl/') || v.startsWith('https://goo.gl/maps/');
        },
        message: 'El vínculo debe ser una URL válida de Google Maps'
      }
    }
  },
  schedule: {
    type: [{
      day: {
        type: String,
        required: [true, 'El día es requerido'],
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      },
      openTime: {
        type: String,
        required: [true, 'La hora de apertura es requerida'],
        validate: {
          validator: function(v: string) {
            return timeRegex.test(v);
          },
          message: 'El formato de hora debe ser HH:mm en formato 24 horas'
        }
      },
      closeTime: {
        type: String,
        required: [true, 'La hora de cierre es requerida'],
        validate: {
          validator: function(v: string) {
            return timeRegex.test(v);
          },
          message: 'El formato de hora debe ser HH:mm en formato 24 horas'
        }
      },
      isOpen: {
        type: Boolean,
        required: [true, 'Debe especificar si la tienda abre este día'],
        default: true
      }
    }],
    required: [true, 'El horario de la tienda es requerido'],
    validate: {
      validator: function(schedule: any[]) {
        // Verificar que estén todos los días de la semana
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const scheduleDays = schedule.map(s => s.day);
        return days.every(day => scheduleDays.includes(day));
      },
      message: 'Debe proporcionar el horario para todos los días de la semana'
    }
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
  },
  socialMedia: {
    tiktok: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Campo opcional
          return v.startsWith('https://www.tiktok.com/') || v.startsWith('https://tiktok.com/');
        },
        message: 'El enlace de TikTok debe ser una URL válida de TikTok'
      }
    },
    facebook: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Campo opcional
          return v.startsWith('https://www.facebook.com/') || v.startsWith('https://facebook.com/');
        },
        message: 'El enlace de Facebook debe ser una URL válida de Facebook'
      }
    },
    instagram: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Campo opcional
          return v.startsWith('https://www.instagram.com/') || v.startsWith('https://instagram.com/');
        },
        message: 'El enlace de Instagram debe ser una URL válida de Instagram'
      }
    }
  }
}, {
  timestamps: true
});

// Add index for search
storeSchema.index({ name: 'text', description: 'text', categories: 'text' });

export const Store = mongoose.model<IStore>('Store', storeSchema);