import React, { useState } from 'react';
import { VehicleFormData, VehicleType } from '../../types/Vehicle';

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
}

const vehicleTypes: VehicleType[] = [
  'Kamyon',
  'Çekici',
  'Tır',
  'Römork',
  'Dorse',
  'Minibüs',
  'Otobüs',
  'Pickup'
];

export const VehicleForm: React.FC<VehicleFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    plate: '',
    model: '',
    type: 'Çekici',
    year: '',
    chassisNumber: '',
    status: 'Aktif'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-[#2D333B] rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Yeni Araç Ekle</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="plate" className="block text-sm font-medium text-gray-300">
              Plaka
            </label>
            <input
              type="text"
              id="plate"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-[#1C2128] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="34 ABC 123"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-300">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-[#1C2128] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Marka ve Model"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-300">
              Yıl
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-[#1C2128] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Üretim Yılı"
            />
          </div>

          <div>
            <label htmlFor="chassisNumber" className="block text-sm font-medium text-gray-300">
              Şasi Numarası
            </label>
            <input
              type="text"
              id="chassisNumber"
              name="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-[#1C2128] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Şasi Numarası"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300">
              Tip
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full bg-[#1C2128] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {vehicleTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 