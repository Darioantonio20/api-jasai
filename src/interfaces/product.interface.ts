import { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  storeId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
} 