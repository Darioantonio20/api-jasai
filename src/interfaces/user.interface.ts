import { Document } from 'mongoose';

interface ILocation {
  _id?: string;       // ID de MongoDB (opcional para creación)
  alias: string;      // Descripción textual de la ubicación
  googleMapsUrl: string;  // Vínculo de Google Maps
  isDefault?: boolean;    // Indica si es la ubicación por defecto
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  profileImageUrl?: string;
  locations: ILocation[];
  currentLocationIndex: number;
  role: 'client' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}