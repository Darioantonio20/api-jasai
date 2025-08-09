import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces/user.interface';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor agrega un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'El número telefónico es requerido'],
    match: [
      /^\+[1-9]\d{1,14}$/,
      'Por favor ingresa un número telefónico válido en formato internacional (Ej: +529614795475)'
    ],
    validate: {
      validator: function(v: string) {
        // Asegurarse de que el número tenga entre 10 y 15 dígitos (sin contar el +)
        const digits = v.slice(1);
        return digits.length >= 10 && digits.length <= 15;
      },
      message: 'El número telefónico debe tener entre 10 y 15 dígitos'
    }
  },
  profileImageUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'La URL de la imagen no puede tener más de 500 caracteres'],
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        // Acepta cualquier URL http/https; opcionalmente con extensión de imagen
        const genericUrl = /^https?:\/\/.+/i;
        return genericUrl.test(v);
      },
      message: 'La URL de imagen no es válida. Debe iniciar con http o https'
    }
  },
  locations: [{
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
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  currentLocationIndex: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const payload = {
    id: this._id
  };

  return jwt.sign(payload, secret);
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);