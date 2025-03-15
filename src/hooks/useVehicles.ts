import { useState, useEffect } from 'react';
import { Vehicle } from '../types/Vehicle';

const VEHICLES_STORAGE_KEY = 'fleet-management-vehicles';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const loadVehicles = () => {
      try {
        const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
        if (savedVehicles) {
          setVehicles(JSON.parse(savedVehicles));
        } else {
          const initialVehicles: Vehicle[] = [
            { 
              id: '1', 
              plate: 'ABC 1234',
              brand: 'Volvo',
              model: 'FH16', 
              type: 'Çekici Kamyon',
              year: 2020,
              mileage: 150000,
              chassisNumber: 'YV2RT40A8LB123456',
              lastMaintenance: '2023-10-15',
              nextMaintenance: '2024-04-15',
              lastInspection: '2023-06-15',
              nextInspection: '2024-06-15',
              status: 'Aktif',
              tires: [
                {
                  id: '1',
                  position: 'Ön Sol',
                  brand: 'Michelin',
                  model: 'X Multi D',
                  serialNumber: 'DOT1234567890',
                  size: '315/80R22.5',
                  installationDate: '2023-08-15',
                  mileageAtInstallation: 145000
                },
                {
                  id: '2',
                  position: 'Ön Sağ',
                  brand: 'Michelin',
                  model: 'X Multi D',
                  serialNumber: 'DOT1234567891',
                  size: '315/80R22.5',
                  installationDate: '2023-08-15',
                  mileageAtInstallation: 145000
                }
              ],
              maintenanceHistory: []
            },
            { 
              id: '2', 
              plate: 'DEF 5678',
              brand: 'Mercedes',
              model: 'Actros', 
              type: 'Çekici Kamyon',
              year: 2021,
              mileage: 120000,
              chassisNumber: 'WDB96340310123456',
              lastMaintenance: '2023-11-01',
              nextMaintenance: '2024-05-01',
              lastInspection: '2023-07-01',
              nextInspection: '2024-07-01',
              status: 'Aktif',
              tires: [],
              maintenanceHistory: []
            }
          ];
          setVehicles(initialVehicles);
          localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(initialVehicles));
        }
      } catch (err) {
        console.error('Araçlar yüklenirken hata oluştu:', err);
      }
    };

    loadVehicles();
  }, []);

  const addVehicle = (vehicle: Vehicle) => {
    const updatedVehicles = [...vehicles, vehicle];
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    );
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
  };

  const deleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
  };

  return {
    vehicles,
    setVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };
}; 