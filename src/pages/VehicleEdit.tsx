import React, { useState, useEffect } from 'react';
import { Vehicle, Tire } from '../types/Vehicle';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const VEHICLES_STORAGE_KEY = 'fleet-management-vehicles';
const TIRES_STORAGE_KEY = 'fleet-management-tires';

export const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showTireModal, setShowTireModal] = useState(false);
  const [availableTires, setAvailableTires] = useState<Tire[]>([]);
  const [selectedTire, setSelectedTire] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<Tire['position']>('ÖnSol');
  const [installationKm, setInstallationKm] = useState<number>(0);

  useEffect(() => {
    // Araç verilerini yükle
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles && id) {
      const vehicles: Vehicle[] = JSON.parse(savedVehicles);
      const foundVehicle = vehicles.find(v => v.id === id);
      if (foundVehicle) {
        setVehicle(foundVehicle);
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

  const handleTireInstallation = () => {
    if (!vehicle || !selectedTire) return;

    const tire = availableTires.find(t => t.id === selectedTire);
    if (!tire) return;

    // Lastik bilgilerini güncelle
    const updatedTire: Tire = {
      ...tire,
      location: 'Takılı' as const,
      position: selectedPosition,
      installationDate: new Date().toISOString().split('T')[0],
      installationKm: installationKm
    };

    // Aracın lastiklerini güncelle
    const updatedVehicle = {
      ...vehicle,
      tires: [...vehicle.tires, updatedTire]
    };

    // Araç bilgilerini kaydet
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles) {
      const vehicles: Vehicle[] = JSON.parse(savedVehicles);
      const updatedVehicles = vehicles.map(v =>
        v.id === vehicle.id ? updatedVehicle : v
      );
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    }

    // Depodaki lastikleri güncelle
    const savedTires = localStorage.getItem(TIRES_STORAGE_KEY);
    if (savedTires) {
      const tires: Tire[] = JSON.parse(savedTires);
      const updatedTires = tires.map(t =>
        t.id === selectedTire ? updatedTire : t
      );
      localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));
    }

    setVehicle(updatedVehicle);
    setAvailableTires(availableTires.filter(t => t.id !== selectedTire));
    setShowTireModal(false);
    setSelectedTire('');
    setInstallationKm(0);
  };

  const handleTireRemoval = (tireId: string) => {
    if (!vehicle) return;

    // Çıkarılacak lastiği bul
    const tireToRemove = vehicle.tires.find(t => t.id === tireId);
    if (!tireToRemove) return;

    // Lastiği depoya geri koy
    const updatedTire: Tire = {
      ...tireToRemove,
      location: 'Depo' as const,
      position: undefined,
      installationDate: undefined,
      installationKm: undefined
    };

    // Aracın lastiklerini güncelle
    const updatedVehicle = {
      ...vehicle,
      tires: vehicle.tires.filter(t => t.id !== tireId)
    };

    // Araç bilgilerini kaydet
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles) {
      const vehicles: Vehicle[] = JSON.parse(savedVehicles);
      const updatedVehicles = vehicles.map(v =>
        v.id === vehicle.id ? updatedVehicle : v
      );
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    }

    // Depodaki lastikleri güncelle
    const savedTires = localStorage.getItem(TIRES_STORAGE_KEY);
    if (savedTires) {
      const tires: Tire[] = JSON.parse(savedTires);
      const updatedTires = tires.map(t =>
        t.id === tireId ? updatedTire : t
      );
      localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));
    }

    setVehicle(updatedVehicle);
    setAvailableTires([...availableTires, updatedTire]);
  };

  if (!vehicle) return <div>Yükleniyor...</div>;

  const installedTires = vehicle.tires.filter(tire => tire.location === 'Takılı');

  return (
    <div className="min-h-screen bg-[#22272E]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">{vehicle.plate} - Takılı Lastikler</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTireModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lastik Tak
            </button>
            <button
              onClick={() => navigate('/vehicles')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
            >
              Geri
            </button>
          </div>
        </div>

        {installedTires.length > 0 ? (
          <div className="bg-[#1C2128] rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Pozisyon</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Seri No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Marka</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Desen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Takılma Tarihi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Takılma KM</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Diş Derinliği</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Basınç</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {installedTires.map((tire, index) => (
                    <tr key={tire.id} className={index % 2 === 0 ? 'bg-[#1C2128]' : 'bg-[#22272E]'}>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.position}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.serialNumber}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.brand}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.pattern}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.installationDate}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.installationKm}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.treadDepth} mm</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.pressure} PSI</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
                        <button
                          onClick={() => handleTireRemoval(tire.id)}
                          className="text-red-500 hover:text-red-400 p-1 rounded"
                          title="Lastiği Çıkar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#1C2128] rounded-lg p-6">
            <p className="text-center text-gray-400">Bu araca takılı lastik bulunmamaktadır.</p>
          </div>
        )}

        {/* Lastik Takma Modalı */}
        {showTireModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-white mb-4">Lastik Tak</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pozisyon</label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value as Tire['position'])}
                    className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                  >
                    <option value="ÖnSol">Ön Sol</option>
                    <option value="ÖnSağ">Ön Sağ</option>
                    <option value="ArkaSol1">Arka Sol 1</option>
                    <option value="ArkaSağ1">Arka Sağ 1</option>
                    <option value="ArkaSol2">Arka Sol 2</option>
                    <option value="ArkaSağ2">Arka Sağ 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Lastik</label>
                  <select
                    value={selectedTire}
                    onChange={(e) => setSelectedTire(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Lastik Seçin</option>
                    {availableTires.map(tire => (
                      <option key={tire.id} value={tire.id}>
                        {tire.serialNumber} - {tire.brand} {tire.pattern}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Takılma KM</label>
                  <input
                    type="number"
                    value={installationKm}
                    onChange={(e) => setInstallationKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                    placeholder="Örn: 50000"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTireModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleTireInstallation}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Tak
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 