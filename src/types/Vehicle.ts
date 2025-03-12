export type VehicleType = 'Kamyon' | 'Çekici';

export type VehicleStatus = 'Aktif' | 'Kademe' | 'Yetkili Servis';

export type TireLocation = 'Takılı' | 'Depo' | 'Kaplama' | 'Dış Ayar' | 'Tamir' | 'Hurda' | 'Satıldı';

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
  model: string;
  size: string;
  serialNumber: string;
  position: string;
  installationDate: string;
  installationMileage: number;
  location: 'Takılı' | 'Depo' | 'Kaplama' | 'Dış Ayar' | 'Tamir' | 'Hurda' | 'Satıldı';
  treadDepth: number; // Diş derinliği (mm)
  pressure: number; // Basınç (PSI)
  status: TireStatus;
  storageLocation?: string; // Depo konumu (örn: A-1)
  facility?: string; // Tesis (örn: İstanbul Depo)
  // Kaplama bilgileri
  pattern?: string; // Desen (örn: 7500)
  dot?: string; // DOT numarası
  retreadDate?: string; // Gidiş Tarihi
  retreadReturnDate?: string; // Dönüş Tarihi
  retreadCost?: number; // Gidiş Maliyeti
  retreadReturnCost?: number; // Dönüş Maliyeti
  retreadCompany?: string; // Kaplama Firması
  retreadStatus?: string; // Kaplama Durumu
  previousTreadDepth?: number; // Önceki Diş Derinliği
  nextTreadDepth?: number; // Sonraki Diş Derinliği
  departureNote?: string; // Gidiş Notu
  returnNote?: string; // Dönüş Notu
  retreadBrand?: string; // Kaplanan Marka
  retreadPattern?: string; // Kaplanan Desen
  retreadSerialNumber?: string; // Kaplanan Seri No
  // Diğer opsiyonel alanlar
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;
  removalDate?: string;
  removalReason?: string;
  repairDate?: string;
  repairDescription?: string;
  repairCost?: number;
  retreaded?: boolean;
  groovingDate?: string;
  groovingDepth?: number;
  groovingCost?: number;
  disposalDate?: string;
  disposalReason?: string;
  saleDate?: string;
  salePrice?: number;
  buyer?: string;
  notes?: string;
}

export type MaintenanceType = 'Periyodik Bakım' | 'Arıza Bakım' | 'Lastik Değişimi' | 'Kaporta/Boya' | 'Motor Bakım' | 'Diğer';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: MaintenanceType;
  mileage: number;
  description: string;
  cost: number;
  location: string;
  technician: string;
  parts: {
    name: string;
    quantity: number;
    cost: number;
  }[];
  nextMaintenanceMileage: number;
  nextMaintenanceDate: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  type: VehicleType;
  year: number;
  mileage: number;
  chassisNumber: string;
  lastMaintenance: string;
  nextMaintenance: string;
  lastInspection: string;
  nextInspection: string;
  status: VehicleStatus;
  tires: Tire[];
  maintenanceHistory: MaintenanceRecord[];
}

export interface VehicleFormData {
  plate: string;
  model: string;
  type: VehicleType;
  year: string;
  chassisNumber: string;
  status: string;
} 