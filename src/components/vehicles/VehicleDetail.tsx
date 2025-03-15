import React, { useState } from 'react';
import { Vehicle } from '../../types/Vehicle';
import { MileageTracker } from './MileageTracker';
import { ArrowLeft, Truck, FileText, Activity, Calendar, Wrench } from 'lucide-react';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate: (updatedVehicle: Vehicle) => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'genel' | 'kilometre' | 'bakim'>('genel');
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceDate, setMaintenanceDate] = useState(vehicle.lastMaintenance);
  const [inspectionDate, setInspectionDate] = useState(vehicle.lastInspection);
  const [currentMileage, setCurrentMileage] = useState(vehicle.mileage);

  const handleMaintenanceUpdate = () => {
    const nextMaintenanceDate = new Date(maintenanceDate);
    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);

    const nextInspectionDate = new Date(inspectionDate);
    nextInspectionDate.setFullYear(nextInspectionDate.getFullYear() + 1);

    const updatedVehicle = {
      ...vehicle,
      lastMaintenance: maintenanceDate,
      nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0],
      lastInspection: inspectionDate,
      nextInspection: nextInspectionDate.toISOString().split('T')[0],
      mileage: currentMileage
    };

    onUpdate(updatedVehicle);
    setShowMaintenanceForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold text-white">
            {vehicle.plate} - Araç Detayları
          </h2>
        </div>
      </div>

      <div className="bg-[#1C2128] rounded-lg mb-6">
        <div className="border-b border-gray-700">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('genel')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'genel'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Genel Bilgiler</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('kilometre')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'kilometre'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Kilometre Takibi</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bakim')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'bakim'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4" />
                <span>Bakım Bilgileri</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'genel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Araç Bilgileri</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Plaka</label>
                    <div className="text-white">{vehicle.plate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Marka</label>
                    <div className="text-white">{vehicle.brand}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Model</label>
                    <div className="text-white">{vehicle.model}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Tip</label>
                    <div className="text-white">{vehicle.type}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Yıl</label>
                    <div className="text-white">{vehicle.year}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Şasi Numarası</label>
                    <div className="text-white">{vehicle.chassisNumber}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Durum Bilgileri</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Durum</label>
                    <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                      vehicle.status === 'Aktif'
                        ? 'bg-green-900/50 text-green-300'
                        : vehicle.status === 'Kademe'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {vehicle.status}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Kilometre</label>
                    <div className="text-white">{vehicle.mileage?.toLocaleString() || 0} km</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Son Bakım</label>
                    <div className="text-white">
                      {new Date(vehicle.lastMaintenance).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Sonraki Bakım</label>
                    <div className="text-white">
                      {new Date(vehicle.nextMaintenance).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Son Muayene</label>
                    <div className="text-white">
                      {new Date(vehicle.lastInspection).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Sonraki Muayene</label>
                    <div className="text-white">
                      {new Date(vehicle.nextInspection).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kilometre' && (
            <MileageTracker
              vehicle={vehicle}
              onUpdate={onUpdate}
            />
          )}

          {activeTab === 'bakim' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Bakım ve Muayene Bilgileri</h3>
                <button
                  onClick={() => setShowMaintenanceForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Güncelle
                </button>
              </div>

              {showMaintenanceForm ? (
                <div className="bg-[#2D333B] rounded-lg p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Mevcut Kilometre
                      </label>
                      <input
                        type="number"
                        value={currentMileage}
                        onChange={(e) => setCurrentMileage(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Son Periyodik Bakım Tarihi
                      </label>
                      <input
                        type="date"
                        value={maintenanceDate}
                        onChange={(e) => setMaintenanceDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Son Fenni Muayene Tarihi
                      </label>
                      <input
                        type="date"
                        value={inspectionDate}
                        onChange={(e) => setInspectionDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowMaintenanceForm(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleMaintenanceUpdate}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#2D333B] rounded-lg p-6">
                    <h4 className="text-md font-medium text-white mb-4">Periyodik Bakım Bilgileri</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Son Bakım</label>
                        <div className="text-white">
                          {new Date(vehicle.lastMaintenance).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Sonraki Bakım</label>
                        <div className="text-white">
                          {new Date(vehicle.nextMaintenance).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Kalan Süre</label>
                        <div className="text-white">
                          {Math.ceil((new Date(vehicle.nextMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2D333B] rounded-lg p-6">
                    <h4 className="text-md font-medium text-white mb-4">Fenni Muayene Bilgileri</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Son Muayene</label>
                        <div className="text-white">
                          {new Date(vehicle.lastInspection).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Sonraki Muayene</label>
                        <div className="text-white">
                          {new Date(vehicle.nextInspection).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">Kalan Süre</label>
                        <div className="text-white">
                          {Math.ceil((new Date(vehicle.nextInspection).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 