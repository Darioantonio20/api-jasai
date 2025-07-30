import { Document } from 'mongoose';

interface ILocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: ILocation;
  role: 'client' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}