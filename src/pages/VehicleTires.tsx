import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Vehicle, Tire, TirePosition } from '../types/Vehicle';

const VEHICLES_STORAGE_KEY = 'fleet-management-vehicles';
const TIRES_STORAGE_KEY = 'fleet-management-tires';

export const VehicleTires: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showTireAssignModal, setShowTireAssignModal] = useState(false);
  const [showTireRemovalModal, setShowTireRemovalModal] = useState(false);
  const [selectedTireForRemoval, setSelectedTireForRemoval] = useState<Tire | null>(null);
  const [removalMileage, setRemovalMileage] = useState(0);
  const [availableTires, setAvailableTires] = useState<Tire[]>([]);
  const [selectedTireId, setSelectedTireId] = useState('');
  const [tirePosition, setTirePosition] = useState('');
  const [installationMileage, setInstallationMileage] = useState(0);

  useEffect(() => {
    // Araç verilerini yükle
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles && id) {
      const vehicles: Vehicle[] = JSON.parse(savedVehicles);
      const foundVehicle = vehicles.find(v => v.id === id);
      if (foundVehicle) {
        // Eğer lastikler tanımlı değilse boş dizi olarak ayarla
        setVehicle({
          ...foundVehicle,
          tires: foundVehicle.tires || []
        });
      }
    }

    // Depodaki lastikleri yükle
    const savedTires = localStorage.getItem(TIRES_STORAGE_KEY);
    if (savedTires) {
      const tires: Tire[] = JSON.parse(savedTires);
      const storageTires = tires.filter(tire => tire.location === 'Depo');
      setAvailableTires(storageTires);
    }
  }, [id]);

  const handleTireAssignment = () => {
    if (!vehicle || !selectedTireId || !tirePosition) return;

    const tire = availableTires.find(t => t.id === selectedTireId);
    if (!tire) return;

    // Lastiği güncelle
    const updatedTire: Tire = {
      ...tire,
      location: 'Takılı',
      position: tirePosition as TirePosition,
      installationDate: new Date().toISOString().split('T')[0],
      installationMileage: installationMileage
    };

    // Aracı güncelle
    const updatedVehicle = {
      ...vehicle,
      tires: [...vehicle.tires || [], updatedTire],
      updatedAt: new Date().toISOString(),
    };

    // Lastik veritabanını güncelle
    const savedTires = localStorage.getItem(TIRES_STORAGE_KEY);
    if (savedTires) {
      const tires: Tire[] = JSON.parse(savedTires);
      const updatedTires = tires.map(t => t.id === selectedTireId ? updatedTire : t);
      localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));
      setAvailableTires(updatedTires.filter(t => t.location === 'Depo'));
    }

    // Araç veritabanını güncelle
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles) {
      const vehicles: Vehicle[] = JSON.parse(savedVehicles);
      const updatedVehicles = vehicles.map(v => v.id === vehicle.id ? updatedVehicle : v);
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
      setVehicle(updatedVehicle);
    }

    setShowTireAssignModal(false);
    setSelectedTireId('');
    setTirePosition('');
    setInstallationMileage(0);
  };

  const handleRemoveTire = (tireId: string) => {
    const tire = vehicle?.tires?.find(t => t.id === tireId);
    if (!vehicle || !tire) return;

    setSelectedTireForRemoval(tire);
    setRemovalMileage(vehicle.mileage || 0);
    setShowTireRemovalModal(true);
  };

  const confirmTireRemoval = () => {
    if (!vehicle || !selectedTireForRemoval) return;

    const updatedTire: Tire = {
      ...selectedTireForRemoval,
      location: 'Depo',
      position: undefined,
      removalDate: new Date().toISOString().split('T')[0],
      removalMileage: removalMileage,
      status: 'Kullanılmış'
    };

    // Aracın lastiklerini güncelle
    const updatedVehicle = {
      ...vehicle,
      tires: vehicle.tires?.filter(t => t.id !== selectedTireForRemoval.id) || [],
      tireChangeCount: (vehicle.tireChangeCount || 0) + 1,
      updatedAt: new Date().toISOString()
    };

    // Lastik veritabanını güncelle
    const savedTires = localStorage.getItem(TIRES_STORAGE_KEY);
    if (savedTires) {
      const tires: Tire[] = JSON.parse(savedTires);
      const updatedTires = tires.map(t => t.id === selectedTireForRemoval.id ? updatedTire : t);
      localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));
      setAvailableTires([...availableTires, updatedTire]);
    }

    // Araç veritabanını güncelle
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles) {
      const vehicles: Vehicle[] = JSON.parse(savedVehicles);
      const updatedVehicles = vehicles.map(v => v.id === vehicle.id ? updatedVehicle : v);
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
      setVehicle(updatedVehicle);
    }

    setShowTireRemovalModal(false);
    setSelectedTireForRemoval(null);
    setRemovalMileage(0);
  };

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-white">
            {vehicle.plate} - Lastik Yönetimi
            <span className="ml-4 text-sm font-normal bg-gray-700 px-3 py-1 rounded-full">
              Toplam Değişim: {vehicle.tireChangeCount || 0} kez
            </span>
            <span className="ml-4 text-sm font-normal bg-gray-700 px-3 py-1 rounded-full">
              Toplam KM: {vehicle.mileage?.toLocaleString('tr-TR') || 0} km
            </span>
          </h1>
        </div>
        <button
          onClick={() => setShowTireAssignModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Lastik Ata
        </button>
      </div>

      <div className="bg-[#1C2128] rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#2D333B]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pozisyon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Marka</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Desen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Seri No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Takılma Tarihi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Takılma KM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-[#1C2128] divide-y divide-gray-700">
            {(vehicle.tires || []).map((tire) => (
              <tr key={tire.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tire.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tire.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tire.pattern}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tire.serialNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {tire.installationDate && new Date(tire.installationDate).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {tire.installationMileage?.toLocaleString()} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => handleRemoveTire(tire.id)}
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

      {/* Lastik Atama Modalı */}
      {showTireAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              {vehicle.plate} - Lastik Ata
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lastik</label>
                <select
                  value={selectedTireId}
                  onChange={(e) => setSelectedTireId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                >
                  <option value="">Lastik Seçin</option>
                  {availableTires.map(tire => (
                    <option key={tire.id} value={tire.id}>
                      {tire.brand} {tire.pattern} - {tire.serialNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pozisyon</label>
                <select
                  value={tirePosition}
                  onChange={(e) => setTirePosition(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                >
                  <option value="">Pozisyon Seçin</option>
                  <option value="ÖnSol">Ön Sol</option>
                  <option value="ÖnSağ">Ön Sağ</option>
                  <option value="ArkaSol1">Arka Sol 1</option>
                  <option value="ArkaSağ1">Arka Sağ 1</option>
                  <option value="ArkaSol2">Arka Sol 2</option>
                  <option value="ArkaSağ2">Arka Sağ 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Takılma Kilometresi</label>
                <input
                  type="number"
                  value={installationMileage}
                  onChange={(e) => setInstallationMileage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                  placeholder="Örn: 50000"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTireAssignModal(false);
                    setSelectedTireId('');
                    setTirePosition('');
                    setInstallationMileage(0);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleTireAssignment}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  Lastik Ata
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lastik Sökme Modalı */}
      {showTireRemovalModal && selectedTireForRemoval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Lastik Sökme - {selectedTireForRemoval.brand} {selectedTireForRemoval.pattern}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Söküm Kilometresi</label>
                <input
                  type="number"
                  value={removalMileage}
                  onChange={(e) => setRemovalMileage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                  placeholder="Örn: 75000"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTireRemovalModal(false);
                    setSelectedTireForRemoval(null);
                    setRemovalMileage(0);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={confirmTireRemoval}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                >
                  Sök
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 