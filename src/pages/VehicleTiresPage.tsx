import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VehicleTires } from '../components/vehicles/VehicleTires';
import { useVehicles } from '../hooks/useVehicles';

export const VehicleTiresPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, updateVehicle } = useVehicles();
  const vehicle = vehicles.find(v => v.id === id);

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1C2128] rounded-lg p-6">
          <div className="text-center text-gray-400">
            <p className="text-xl">Araç bulunamadı</p>
            <button
              onClick={() => navigate('/vehicles')}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Araç Listesine Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VehicleTires
        vehicle={vehicle}
        onUpdate={updateVehicle}
      />
    </div>
  );
}; 