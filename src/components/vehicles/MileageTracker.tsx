import React, { useState } from 'react';
import { Vehicle, MileageRecord } from '../../types/Vehicle';
import { v4 as uuidv4 } from 'uuid';

interface MileageTrackerProps {
  vehicle: Vehicle;
  onUpdate: (updatedVehicle: Vehicle) => void;
}

export const MileageTracker: React.FC<MileageTrackerProps> = ({ vehicle, onUpdate }) => {
  const [newMileage, setNewMileage] = useState<number>(vehicle.mileage || 0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const previousMileage = vehicle.mileage || 0;
    const dailyDistance = newMileage - previousMileage;

    if (dailyDistance < 0) {
      alert('Yeni kilometre değeri mevcut kilometreden küçük olamaz!');
      return;
    }

    const mileageRecord: MileageRecord = {
      id: uuidv4(),
      vehicleId: vehicle.id,
      date,
      mileage: newMileage,
      previousMileage,
      dailyDistance
    };

    const updatedVehicle: Vehicle = {
      ...vehicle,
      mileage: newMileage,
      mileageHistory: [...(vehicle.mileageHistory || []), mileageRecord],
      totalDistance: (vehicle.totalDistance || 0) + dailyDistance
    };

    onUpdate(updatedVehicle);
    setNewMileage(newMileage);
  };

  return (
    <div className="bg-[#2D333B] rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Kilometre Takibi</h3>
        <div className="text-sm text-gray-300">
          Toplam Mesafe: {vehicle.totalDistance?.toLocaleString() || 0} km
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tarih
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Yeni Kilometre
          </label>
          <input
            type="number"
            value={newMileage}
            onChange={(e) => setNewMileage(Number(e.target.value))}
            min={vehicle.mileage || 0}
            className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
            required
          />
        </div>

        <div className="text-sm text-gray-400">
          Günlük Mesafe: {newMileage - (vehicle.mileage || 0)} km
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Kaydet
        </button>
      </form>

      {vehicle.mileageHistory && vehicle.mileageHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-white mb-3">Kilometre Geçmişi</h4>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1C2128]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Tarih</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Kilometre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Günlük Mesafe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[...vehicle.mileageHistory]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {new Date(record.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {record.mileage.toLocaleString()} km
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {record.dailyDistance.toLocaleString()} km
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 