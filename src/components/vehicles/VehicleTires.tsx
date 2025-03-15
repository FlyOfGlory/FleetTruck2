import React, { useState } from 'react';
import { Vehicle, Tire, TirePosition } from '../../types/Vehicle';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTireWarehouse } from '../../hooks/useTireWarehouse';

interface VehicleTiresProps {
  vehicle: Vehicle;
  onUpdate: (updatedVehicle: Vehicle) => void;
}

const availablePositions: TirePosition[] = [
  'Ön Sol',
  'Ön Sağ',
  'Arka Sol 1',
  'Arka Sağ 1',
  'Arka Sol 2',
  'Arka Sağ 2',
  'Arka Sol 3',
  'Arka Sağ 3',
  'Yedek'
];

export const VehicleTires: React.FC<VehicleTiresProps> = ({ vehicle, onUpdate }) => {
  const navigate = useNavigate();
  const { tires: warehouseTires, updateTire } = useTireWarehouse();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTireId, setSelectedTireId] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<TirePosition>('Ön Sol');

  const availableWarehouseTires = warehouseTires.filter((tire: Tire) => tire.status === 'Depoda');

  const handleAddTire = () => {
    if (!selectedTireId || !selectedPosition) {
      alert('Lütfen lastik ve pozisyon seçin');
      return;
    }

    const selectedTire = warehouseTires.find((t: Tire) => t.id === selectedTireId);
    if (!selectedTire) {
      alert('Seçilen lastik depoda bulunamadı');
      return;
    }

    // Check if position is already occupied
    const isPositionOccupied = (vehicle.tires || []).some(
      tire => tire.position === selectedPosition
    );

    if (isPositionOccupied) {
      alert('Bu pozisyonda zaten bir lastik var');
      return;
    }

    // Update tire status in warehouse
    updateTire({
      ...selectedTire,
      status: 'Takılı',
      installationDate: new Date().toISOString().split('T')[0],
      position: selectedPosition,
      vehicleId: vehicle.id
    });

    // Add tire to vehicle
    const updatedVehicle = {
      ...vehicle,
      tires: [
        ...(vehicle.tires || []),
        {
          ...selectedTire,
          status: 'Takılı',
          installationDate: new Date().toISOString().split('T')[0],
          position: selectedPosition,
          vehicleId: vehicle.id
        }
      ]
    };

    onUpdate(updatedVehicle);
    setShowAddForm(false);
    setSelectedTireId('');
    setSelectedPosition('Ön Sol');
  };

  const handleRemoveTire = (tireToRemove: Tire) => {
    // Update tire status in warehouse
    updateTire({
      ...tireToRemove,
      status: 'Depoda',
      position: undefined,
      vehicleId: undefined,
      installationDate: undefined
    });

    // Remove tire from vehicle
    const updatedVehicle = {
      ...vehicle,
      tires: (vehicle.tires || []).filter(tire => tire.id !== tireToRemove.id)
    };

    onUpdate(updatedVehicle);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold text-white">
            {vehicle.plate} - Lastik Yönetimi
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center"
          disabled={availableWarehouseTires.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Lastik Tak
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[#1C2128] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Depodan Lastik Seç</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Lastik*
              </label>
              <select
                value={selectedTireId}
                onChange={(e) => setSelectedTireId(e.target.value)}
                className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
              >
                <option value="">Lastik Seçin</option>
                {availableWarehouseTires.map((tire: Tire) => (
                  <option key={tire.id} value={tire.id}>
                    {tire.brand} {tire.model} - {tire.size} (SN: {tire.serialNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Pozisyon*
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value as TirePosition)}
                className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
              >
                {availablePositions.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
            >
              İptal
            </button>
            <button
              onClick={handleAddTire}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1C2128] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Pozisyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Marka/Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Seri No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ebat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Takılma Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {(vehicle.tires || []).map((tire) => (
                <tr key={tire.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tire.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tire.brand} {tire.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tire.serialNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tire.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tire.installationDate && new Date(tire.installationDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleRemoveTire(tire)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Sök
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