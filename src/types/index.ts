export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  chassisNumber: string;
  engineNumber: string;
  totalMileage: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}