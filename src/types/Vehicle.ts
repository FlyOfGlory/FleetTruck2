export type VehicleType = 'Damperli Kamyon' | 'Çekici' | 'Tır' | 'Kamyonet' | 'Minibüs' | 'Otobüs';
export type VehicleStatus = 'Aktif' | 'Serviste' | 'Pasif';
export type TirePosition = 
  | 'Ön Sol' 
  | 'Ön Sağ'
  | 'Arka Sol 1'
  | 'Arka Sağ 1'
  | 'Arka Sol 2'
  | 'Arka Sağ 2'
  | 'Arka Sol 3'
  | 'Arka Sağ 3'
  | 'Yedek';

export type TireStatus = 'Depoda' | 'Takılı' | 'Hurdada';

export type TireBrand = 
  | 'Michelin'
  | 'Bridgestone'
  | 'Goodyear'
  | 'Continental'
  | 'Pirelli'
  | 'Hankook'
  | 'Yokohama'
  | 'Dunlop'
  | 'BFGoodrich'
  | 'Cooper Tires'
  | 'Firestone'
  | 'Nokian Tyres'
  | 'Toyo Tires'
  | 'Kumho'
  | 'Falken'
  | 'General Tire'
  | 'Ceat'
  | 'Apollo Tyres'
  | 'MRF'
  | 'Double Coin';

export interface Tire {
  id: string;
  brand: string;
  model: string;
  size: string;
  serialNumber: string;
  position?: TirePosition;
  status: TireStatus;
  installationDate?: string;
  mileageAtInstallation?: number;
  purchaseDate: string;
  price: number;
}

export type MaintenanceType = 'Periyodik Bakım' | 'Arıza' | 'Kaza' | 'Lastik' | 'Diğer';

export interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  description: string;
  cost: number;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
}

export interface MileageRecord {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  previousMileage: number;
  dailyDistance: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  mileage: number;
  maintenanceRecords: MaintenanceRecord[];
  tires: Tire[];
  lastInspectionDate?: string;
  nextInspectionDate?: string;
}

export interface VehicleFormData {
  plate: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  mileage: number;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
} 