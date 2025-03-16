import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Vehicle, VehicleType, VehicleStatus } from '../types/Vehicle';

const VEHICLES_STORAGE_KEY = 'fleet-management-vehicles';

export const VehicleNew: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    type: 'Çekici' as VehicleType,
    year: new Date().getFullYear(),
    mileage: 0,
    chassisNumber: '',
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextMaintenance: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    lastInspection: new Date().toISOString().split('T')[0],
    nextInspection: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: 'Aktif' as VehicleStatus
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVehicle: Vehicle = {
      id: uuidv4(),
      ...formData,
      tires: [],
      maintenanceHistory: []
    };

    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    const vehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
    vehicles.push(newVehicle);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));

    navigate('/vehicles');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? Number(value) : value
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Yeni Araç Ekle</h1>
        <button
          onClick={() => navigate('/vehicles')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Geri Dön
        </button>
      </div>

      <div className="bg-[#1C2128] rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="plate" className="block text-sm font-medium text-gray-300 mb-1">
              Plaka
            </label>
            <input
              type="text"
              id="plate"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
              Marka
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
              Tip
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Çekici">Çekici</option>
              <option value="Kamyon">Kamyon</option>
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">
              Yıl
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-300 mb-1">
              Kilometre
            </label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="chassisNumber" className="block text-sm font-medium text-gray-300 mb-1">
              Şasi Numarası
            </label>
            <input
              type="text"
              id="chassisNumber"
              name="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
              Durum
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#22272E] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Aktif">Aktif</option>
              <option value="Bakımda">Bakımda</option>
              <option value="İnaktif">İnaktif</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 