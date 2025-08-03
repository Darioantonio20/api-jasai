import { Document } from 'mongoose';

interface ICustomer {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
}

interface IOrderProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

interface IOrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

interface IPayment {
  method: 'efectivo' | 'transferencia' | 'tarjeta';
  details: string;
  status: 'pendiente' | 'pagado' | 'rechazado';
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: ICustomer;
  storeId: string;
  products: IOrderProduct[];
  totals: IOrderTotals;
  payment: IPayment;
  status: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 