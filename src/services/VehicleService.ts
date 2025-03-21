import { Vehicle, MaintenanceRecord, Facility } from '../types/Vehicle';

class VehicleService {
  private vehicles: Vehicle[] = [];

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehicles;
  }

  async addMaintenanceRecord(vehicleId: string, record: Omit<MaintenanceRecord, 'id'>): Promise<Vehicle> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }

    const newRecord: MaintenanceRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9)
    };

    vehicle.maintenanceHistory = vehicle.maintenanceHistory || [];
    vehicle.maintenanceHistory.push(newRecord);
    vehicle.lastMaintenance = record.date;
    vehicle.updatedAt = new Date();

    return vehicle;
  }

  async deleteMaintenanceRecord(vehicleId: string, recordId: string): Promise<Vehicle> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }

    vehicle.maintenanceHistory = vehicle.maintenanceHistory.filter(r => r.id !== recordId);
    vehicle.updatedAt = new Date();

    return vehicle;
  }

  async updateTireStock(vehicleId: string, quantity: number): Promise<Vehicle> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }

    vehicle.tireStock = Math.max(0, vehicle.tireStock + quantity);
    vehicle.updatedAt = new Date();
    
    return vehicle;
  }

  async getTireStock(vehicleId: string): Promise<number> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }
    return vehicle.tireStock;
  }

  async getAllTireStock(): Promise<{ vehicleId: string; plate: string; stock: number }[]> {
    return this.vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      stock: vehicle.tireStock
    }));
  }

  async incrementTireChangeCount(vehicleId: string): Promise<Vehicle> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }

    vehicle.tireChangeCount = (vehicle.tireChangeCount || 0) + 1;
    vehicle.updatedAt = new Date();
    
    return vehicle;
  }

  async getVehicleWithMostTireChanges(): Promise<Vehicle | null> {
    if (this.vehicles.length === 0) return null;
    
    return this.vehicles.reduce((max, current) => 
      (current.tireChangeCount || 0) > (max.tireChangeCount || 0) ? current : max
    );
  }

  async getTireChangeStats(): Promise<{ vehicleId: string; plate: string; changeCount: number }[]> {
    return this.vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      changeCount: vehicle.tireChangeCount || 0
    }));
  }

  async updateTechnicalInspectionDate(vehicleId: string, date: Date): Promise<Vehicle> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }

    // Fenni muayene tarihini güncelle
    vehicle.technicalInspectionDate = date;
    
    // Son geçerlilik tarihini 1 yıl sonrası olarak ayarla
    const endDate = new Date(date);
    endDate.setFullYear(endDate.getFullYear() + 1);
    vehicle.technicalInspectionEndDate = endDate;
    
    vehicle.updatedAt = new Date();
    
    return vehicle;
  }

  async updateFacility(vehicleId: string, facility: Facility): Promise<Vehicle> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error('Araç bulunamadı');
    }

    vehicle.facility = facility;
    vehicle.updatedAt = new Date();
    
    return vehicle;
  }
}

export const vehicleService = new VehicleService(); 