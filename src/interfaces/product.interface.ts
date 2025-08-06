import { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];  // Cambiado a array para múltiples imágenes
  category: string;  // Debe coincidir con una categoría de la tienda
  storeId: string;
  adminNote?: string;  // Nota del admin para el producto
  createdAt: Date;
  updatedAt: Date;
}