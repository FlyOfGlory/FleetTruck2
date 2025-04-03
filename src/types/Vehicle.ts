export type VehicleType = 'Kamyon' | 'Çekici' | 'Tır' | 'Römork' | 'Dorse' | 'Minibüs' | 'Otobüs' | 'Pickup';

export type VehicleStatus = 'Aktif' | 'Kademe' | 'Yetkili Servis';

export type TireLocation = 'Depo' | 'Takılı' | 'Hurda';
export type TirePosition = 'ÖnSol' | 'ÖnSağ' | 'ArkaSol1' | 'ArkaSağ1' | 'ArkaSol2' | 'ArkaSağ2';

export type TireStatus = 'Yeni' | 'Kullanımda' | 'Değişmeli';

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
  pattern: string;
  serialNumber: string;
  size: string;
  dot: string;
  purchaseDate: string;
  location: TireLocation;
  position?: TirePosition;
  installationDate?: string;
  installationMileage?: number;
  removalDate?: string;
  removalMileage?: number;
  status: 'Yeni' | 'Kullanılmış' | 'Hurda';
}

export type MaintenanceType = 'Periyodik Bakım' | 'Arıza' | 'Kaza' | 'Diğer';

export interface MaintenanceRecord {
  id: string;
  date: Date;
  mileage: number;
  nextMaintenanceMileage?: number;
  nextMaintenanceDate?: Date;
  description: string;
}

export type Facility = 
  | 'İZMİR YOLU'
  | 'PANAYIR'
  | 'İNEGÖL'
  | 'PAMUKOVA'
  | 'TEKNOSAB'
  | 'TOKİ'
  | 'YENİ KADEME'
  | 'HAMZABEY (İNEGÖL) OSB'
  | 'GÜRSU TOKİ'
  | 'DEMİRTAŞ (AVDANCIK)'
  | 'MEKECE-1'
  | 'MEKECE-2'
  | 'KAYAPA'
  | 'İNEGÖL CİHANTAŞ';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: 'active' | 'inactive' | 'maintenance' | 'repair';
  mileage?: number;
  lastMileageUpdate?: string;
  driver?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  lastMaintenanceDate?: string;
  lastMaintenanceMileage?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  plate: string;
  model: string;
  type: string;
  year: string;
  chassisNumber: string;
} 