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
      /^\+?1?\s*\(?[0-9]{3}\)?\s*[0-9]{3}\s*-?\s*[0-9]{4}$/,
      'Por favor ingresa un número telefónico válido (Ej: +1 (555) 123-4567)'
    ]
  },
  location: {
    address: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'El estado es requerido'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'El código postal es requerido'],
      match: [/^[0-9]{5}$/, 'El código postal debe tener 5 dígitos']
    }
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