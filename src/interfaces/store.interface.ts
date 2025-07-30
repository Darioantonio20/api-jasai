import { Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  category: string;
  logo: string;
  description: string;
  image: string;
  location: string;
  address: string;
  ownerId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
} 