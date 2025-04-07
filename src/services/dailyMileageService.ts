import { DailyMileage, DailyMileageFormData } from '../types/dailyMileage';
import { Vehicle } from '../types/Vehicle';

const STORAGE_KEY = 'daily_mileage_records';

export const getDailyMileageRecords = (): DailyMileage[] => {
  const records = localStorage.getItem(STORAGE_KEY);
  return records ? JSON.parse(records) : [];
};

export const addDailyMileage = (data: DailyMileageFormData): DailyMileage => {
  const records = getDailyMileageRecords();
  const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]') as Vehicle[];
  
  const vehicle = vehicles.find(v => v.id === data.vehicleId);
  if (!vehicle) {
    throw new Error('Araç bulunamadı');
  }

  // Günlük kilometreyi hesapla
  const dailyKm = data.endKm - data.startKm;
  if (dailyKm < 0) {
    throw new Error('Bitiş kilometresi başlangıç kilometresinden küçük olamaz');
  }

  const newRecord: DailyMileage = {
    id: crypto.randomUUID(),
    ...data,
    dailyKm,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Aracın kilometre bilgisini güncelle
  vehicle.mileage = data.endKm;
  vehicle.lastMileageUpdate = new Date().toISOString();
  localStorage.setItem('vehicles', JSON.stringify(vehicles));

  // Yeni kaydı ekle
  records.push(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

  return newRecord;
};

export const getDailyMileageByVehicle = (vehicleId: string): DailyMileage[] => {
  const records = getDailyMileageRecords();
  return records.filter(record => record.vehicleId === vehicleId);
};

export const getDailyMileageByDateRange = (startDate: string, endDate: string): DailyMileage[] => {
  const records = getDailyMileageRecords();
  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
  });
};

export const deleteDailyMileage = (id: string): void => {
  const records = getDailyMileageRecords();
  const filteredRecords = records.filter(record => record.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
}; 