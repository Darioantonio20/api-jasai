import { Document } from 'mongoose';

interface ILocation {
  alias: string;
  googleMapsUrl: string;
}

interface ISchedule {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  openTime: string;  // Formato 24h "HH:mm"
  closeTime: string; // Formato 24h "HH:mm"
  isOpen: boolean;   // Para indicar si abre ese día
}

export interface IStore extends Document {
  name: string;
  categories: string[];
  logo: string;
  description: string;
  image: string;
  location: ILocation;
  schedule: ISchedule[];  // Array de horarios para cada día
  ownerId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}