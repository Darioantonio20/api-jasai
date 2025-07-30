import { Document } from 'mongoose';

interface IOrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  userId: string;
  storeId: string;
  products: IOrderProduct[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
} 