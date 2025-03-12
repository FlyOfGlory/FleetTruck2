import React from 'react';
import { Vehicle } from '../../types/Vehicle';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onAddClick: () => void;
  onImportClick: () => void;
  onDelete: (id: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onAddClick, onImportClick, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Araçlar</h2>
        <div className="space-x-3">
          <button
            onClick={onImportClick}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            Excel'den Yükle
          </button>
          <button
            onClick={onAddClick}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Yeni Araç Ekle
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Araçlar
              </h2>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Tüm araçların listesi
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plaka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Yıl
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Şasi No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Son Bakım
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle.plate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {vehicle.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {vehicle.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {vehicle.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {vehicle.chassisNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(vehicle.lastMaintenance).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'Aktif' 
                        ? 'bg-green-900/50 text-green-300'
                        : vehicle.status === 'Bakımda'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => onDelete(vehicle.id)}
                      className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                      title="Düzenle"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(vehicle.id)}
                      className="text-red-400 hover:text-red-500 dark:hover:text-red-300 inline-flex items-center"
                      title="Aracı Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 