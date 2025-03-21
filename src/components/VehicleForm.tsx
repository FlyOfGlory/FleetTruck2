import React, { useState, useEffect } from 'react';
import { Vehicle, Facility } from '../types/Vehicle';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSubmit, onCancel }) => {
  const initialFormData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> = {
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    facility: 'İZMİR YOLU',
    lastMaintenance: undefined,
    technicalInspectionDate: undefined,
    technicalInspectionEndDate: undefined,
    tires: [],
    tireStock: 0,
    tireChangeCount: 0,
    maintenanceHistory: []
  };

  const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>({
    ...initialFormData
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        facility: vehicle.facility,
        lastMaintenance: vehicle.lastMaintenance,
        technicalInspectionDate: vehicle.technicalInspectionDate,
        technicalInspectionEndDate: vehicle.technicalInspectionEndDate,
        tires: vehicle.tires,
        tireStock: vehicle.tireStock,
        tireChangeCount: vehicle.tireChangeCount,
        maintenanceHistory: vehicle.maintenanceHistory
      });
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plaka</label>
        <input
          type="text"
          value={formData.plate}
          onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marka</label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
        <input
          type="text"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yıl</label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kilometre</label>
        <input
          type="number"
          value={formData.mileage}
          onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Son Bakım Tarihi</label>
        <input
          type="date"
          value={formData.lastMaintenance ? new Date(formData.lastMaintenance).toISOString().split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value ? new Date(e.target.value) : undefined })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Fenni Muayene Tarihi
        </label>
        <input
          type="date"
          value={formData.technicalInspectionDate ? new Date(formData.technicalInspectionDate).toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : undefined;
            if (date) {
              const endDate = new Date(date);
              endDate.setFullYear(endDate.getFullYear() + 1);
              setFormData({
                ...formData,
                technicalInspectionDate: date,
                technicalInspectionEndDate: endDate
              });
            } else {
              setFormData({
                ...formData,
                technicalInspectionDate: undefined,
                technicalInspectionEndDate: undefined
              });
            }
          }}
          className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
        />
        {formData.technicalInspectionEndDate && (
          <p className="mt-2 text-sm text-gray-400">
            Son Geçerlilik: {new Date(formData.technicalInspectionEndDate).toLocaleDateString('tr-TR')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lastik Stok</label>
        <input
          type="number"
          value={formData.tireStock}
          onChange={(e) => setFormData({ ...formData, tireStock: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tesis
        </label>
        <select
          value={formData.facility}
          onChange={(e) => setFormData({ ...formData, facility: e.target.value as Facility })}
          className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
        >
          <option value="İZMİR YOLU">İZMİR YOLU</option>
          <option value="PANAYIR">PANAYIR</option>
          <option value="İNEGÖL">İNEGÖL</option>
          <option value="PAMUKOVA">PAMUKOVA</option>
          <option value="TEKNOSAB">TEKNOSAB</option>
          <option value="TOKİ">TOKİ</option>
          <option value="YENİ KADEME">YENİ KADEME</option>
          <option value="HAMZABEY (İNEGÖL) OSB">HAMZABEY (İNEGÖL) OSB</option>
          <option value="GÜRSU TOKİ">GÜRSU TOKİ</option>
          <option value="DEMİRTAŞ (AVDANCIK)">DEMİRTAŞ (AVDANCIK)</option>
          <option value="MEKECE-1">MEKECE-1</option>
          <option value="MEKECE-2">MEKECE-2</option>
          <option value="KAYAPA">KAYAPA</option>
          <option value="İNEGÖL CİHANTAŞ">İNEGÖL CİHANTAŞ</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {vehicle ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </form>
  );
}; 