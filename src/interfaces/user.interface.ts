import { Document } from 'mongoose';

interface ILocation {
  alias: string;      // Descripción textual de la ubicación
  googleMapsUrl: string;  // Vínculo de Google Maps
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