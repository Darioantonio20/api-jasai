import { Document } from 'mongoose';

interface ICartItem {
  productId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  note?: string;
}

export interface ICart extends Document {
  sessionId: string;
  storeId: string;
  items: ICartItem[];
  totalItems: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
} 