import React, { useEffect, useState } from 'react';
import { Vehicle, Facility } from '../types/Vehicle';
import { MoreHorizontal, Filter } from 'lucide-react';
import { vehicleService } from '../services/VehicleService';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onUpdateFacility?: (vehicleId: string, facility: Facility) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ 
  vehicles, 
  onEdit, 
  onDelete,
  onUpdateFacility 
}) => {
  const [mostChangedVehicle, setMostChangedVehicle] = useState<Vehicle | null>(null);
  const [editingFacility, setEditingFacility] = useState<string | null>(null);

  const facilities: Facility[] = [
    'İZMİR YOLU',
    'PANAYIR',
    'İNEGÖL',
    'PAMUKOVA',
    'TEKNOSAB',
    'TOKİ',
    'YENİ KADEME',
    'HAMZABEY (İNEGÖL) OSB',
    'GÜRSU TOKİ',
    'DEMİRTAŞ (AVDANCIK)',
    'MEKECE-1',
    'MEKECE-2',
    'KAYAPA',
    'İNEGÖL CİHANTAŞ'
  ];

  useEffect(() => {
    const fetchMostChangedVehicle = async () => {
      const vehicle = await vehicleService.getVehicleWithMostTireChanges();
      setMostChangedVehicle(vehicle);
    };
    fetchMostChangedVehicle();
  }, [vehicles]);

  const handleFacilityChange = (vehicleId: string, newFacility: Facility) => {
    if (onUpdateFacility) {
      onUpdateFacility(vehicleId, newFacility);
      setEditingFacility(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {mostChangedVehicle && (
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            En çok lastik değişimi yapılan araç: {mostChangedVehicle.plate} ({mostChangedVehicle.tireChangeCount} kez)
          </p>
        </div>
      )}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Araç Listesi</h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Plaka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Marka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tesis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Yıl
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Kilometre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Son Bakım
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Lastik Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Lastik Değişim Sayısı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.plate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.brand}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {editingFacility === vehicle.id ? (
                    <select
                      value={vehicle.facility}
                      onChange={(e) => handleFacilityChange(vehicle.id, e.target.value as Facility)}
                      onBlur={() => setEditingFacility(null)}
                      autoFocus
                      className="w-full px-2 py-1 bg-[#2D333B] border border-gray-600 rounded text-white text-sm"
                    >
                      {facilities.map((facility) => (
                        <option key={facility} value={facility}>
                          {facility}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      onClick={() => setEditingFacility(vehicle.id)}
                      className="cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
                    >
                      {vehicle.facility}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.mileage.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString('tr-TR') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    vehicle.tireStock > 5 ? 'bg-green-100 text-green-800' :
                    vehicle.tireStock > 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.tireStock} adet
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.tireChangeCount <= 5 
                      ? 'bg-green-900 text-green-300' 
                      : vehicle.tireChangeCount <= 10
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {vehicle.tireChangeCount || 0} kez
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => onEdit(vehicle)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 mr-2"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(vehicle.id)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 