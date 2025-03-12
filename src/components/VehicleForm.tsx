import { useState } from 'react';
import { Vehicle } from '../types/Vehicle';

export const VehicleForm = () => {
  const [vehicle, setVehicle] = useState<Vehicle>({
    chassisNumber: '',
    licensePlate: '',
    brand: '',
    model: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Araç bilgileri:', vehicle);
    // Burada form verilerini işleyebilirsiniz
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Araç Detayları</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="chassisNumber" className="block text-sm font-medium text-gray-700">
            Şasi Numarası
          </label>
          <input
            type="text"
            id="chassisNumber"
            name="chassisNumber"
            value={vehicle.chassisNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
            Plaka
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={vehicle.licensePlate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            Marka
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={vehicle.brand}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            Model
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={vehicle.model}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}; 