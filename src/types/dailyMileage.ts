export interface DailyMileage {
  id: string;
  vehicleId: string;
  plate: string;
  date: string;
  startKm: number;
  endKm: number;
  dailyKm: number;
  driver?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMileageFormData {
  vehicleId: string;
  plate: string;
  date: string;
  startKm: number;
  endKm: number;
  driver?: string;
  notes?: string;
} 