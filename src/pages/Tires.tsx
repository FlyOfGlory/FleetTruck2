import React, { useState, useEffect } from 'react';
import { Tire, TireLocation, TireStatus, TireBrand } from '../types/Vehicle';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const TIRES_STORAGE_KEY = 'fleet-management-tires';

export const Tires: React.FC = () => {
  const [tires, setTires] = useState<Tire[]>([]);
  const [activeTab, setActiveTab] = useState<TireLocation>('Takılı');
  const [newRetreadTire, setNewRetreadTire] = useState<Partial<Tire>>({
    id: uuidv4(),
    serialNumber: '',
    brand: '',
    model: '',
    size: '',
    pattern: '',
    dot: '',
    retreadDate: '',
    retreadCompany: '',
    retreadCost: 0,
    location: 'Kaplama',
    status: 'Yeni',
  });
  const [newStorageTire, setNewStorageTire] = useState<Partial<Tire>>({
    id: uuidv4(),
    serialNumber: '',
    brand: '',
    pattern: '',
    size: '',
    location: 'Depo',
    status: 'Yeni',
    storageLocation: '',
    facility: '',
  });
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<TireLocation>('Depo');

  useEffect(() => {
    const savedTires = localStorage.getItem(TIRES_STORAGE_KEY);
    if (savedTires) {
      setTires(JSON.parse(savedTires));
    }
  }, []);

  const handleAddTire = () => {
    const newTire: Tire = {
      id: uuidv4(),
      serialNumber: '',
      brand: '',
      model: '',
      pattern: '',
      size: '315/80R22.5',
      dot: '',
      treadDepth: 10,
      pressure: 32,
      position: 'ÖnSol',
      installationDate: new Date().toISOString().split('T')[0],
      installationMileage: 0,
      status: 'Yeni',
      location: activeTab,
      storageLocation: '',
      facility: ''
    };
    const updatedTires = [...tires, newTire];
    setTires(updatedTires);
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));
  };

  const handleUpdateTire = (updatedTire: Tire) => {
    const updatedTires = tires.map(tire =>
      tire.id === updatedTire.id ? updatedTire : tire
    );
    setTires(updatedTires);
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));
  };

  const handleDeleteTire = (id: string) => {
    const updatedTires = tires.filter(tire => tire.id !== id);
    setTires(updatedTires);
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));
  };

  const handleSaveRetread = () => {
    const newTire: Tire = {
      ...newRetreadTire as Tire,
      id: uuidv4(),
      location: 'Kaplama',
      treadDepth: 0,
      pressure: 0,
      position: 'ÖnSol',
      installationDate: new Date().toISOString().split('T')[0],
    };

    const updatedTires = [...tires, newTire];
    setTires(updatedTires);
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));

    // Formu temizle
    setNewRetreadTire({
      id: uuidv4(),
      serialNumber: '',
      brand: '',
      model: '',
      size: '',
      pattern: '',
      dot: '',
      retreadDate: '',
      retreadCompany: '',
      retreadCost: 0,
      location: 'Kaplama',
      status: 'Yeni',
    });
  };

  const handleSaveStorage = () => {
    const newTire: Tire = {
      ...newStorageTire as Tire,
      id: uuidv4(),
      location: 'Depo',
      treadDepth: 0,
      pressure: 0,
      position: 'ÖnSol',
      installationDate: new Date().toISOString().split('T')[0],
    };

    const updatedTires = [...tires, newTire];
    setTires(updatedTires);
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(updatedTires));

    // Formu temizle
    setNewStorageTire({
      id: uuidv4(),
      serialNumber: '',
      brand: '',
      pattern: '',
      size: '',
      location: 'Depo',
      status: 'Yeni',
      storageLocation: '',
      facility: '',
    });
  };

  const handleTransfer = (tire: Tire) => {
    setSelectedTire(tire);
    setShowTransferModal(true);
  };

  const handleTransferConfirm = () => {
    if (selectedTire) {
      const updatedTire = { ...selectedTire, location: selectedLocation };
      handleUpdateTire(updatedTire);
      setShowTransferModal(false);
      setSelectedTire(null);
    }
  };

  const filteredTires = tires.filter(tire => tire.location === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Lastik Yönetimi</h2>
        <button
          onClick={handleAddTire}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Lastik Ekle
        </button>
      </div>

      <div className="bg-[#1C2128] rounded-lg">
        <div className="border-b border-gray-700">
          <nav className="flex overflow-x-auto">
            {['Takılı', 'Depo', 'Kaplama', 'Dış Ayar', 'Tamir', 'Hurda', 'Satıldı'].map((location) => (
              <button
                key={location}
                onClick={() => setActiveTab(location as TireLocation)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === location
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {location === 'Takılı' ? 'Araçlara Takılı' : `${location}daki Lastikler`}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'Kaplama' && (
        <>
          <div className="bg-[#1C2128] rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Yeni Kaplama Lastiği Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">Ebat</label>
                <input
                  type="text"
                  value={newRetreadTire.size || ''}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, size: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: 315/80 R22,5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Orijinal Marka</label>
                <select
                  value={newRetreadTire.brand || ''}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                >
                  <option value="">Marka Seçin</option>
                  <option value="Michelin">Michelin</option>
                  <option value="Bridgestone">Bridgestone</option>
                  <option value="Goodyear">Goodyear</option>
                  <option value="Continental">Continental</option>
                  <option value="Pirelli">Pirelli</option>
                  <option value="Hankook">Hankook</option>
                  <option value="Yokohama">Yokohama</option>
                  <option value="Dunlop">Dunlop</option>
                  <option value="BFGoodrich">BFGoodrich</option>
                  <option value="Cooper Tires">Cooper Tires</option>
                  <option value="Firestone">Firestone</option>
                  <option value="Nokian Tyres">Nokian Tyres</option>
                  <option value="Toyo Tires">Toyo Tires</option>
                  <option value="Kumho">Kumho</option>
                  <option value="Falken">Falken</option>
                  <option value="General Tire">General Tire</option>
                  <option value="Ceat">Ceat</option>
                  <option value="Apollo Tyres">Apollo Tyres</option>
                  <option value="MRF">MRF</option>
                  <option value="Double Coin">Double Coin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Desen</label>
                <input
                  type="text"
                  value={newRetreadTire.pattern || ''}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, pattern: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: 7500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">DOT</label>
                <input
                  type="text"
                  value={newRetreadTire.dot || ''}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, dot: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: 3221"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Seri No</label>
                <input
                  type="text"
                  value={newRetreadTire.serialNumber || ''}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: 8IBB19827"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Kaplama Tarihi</label>
                <input
                  type="date"
                  value={newRetreadTire.retreadDate || ''}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, retreadDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Kaplama Firması</label>
                <input
                  type="text"
                  value={newRetreadTire.retreadCompany || ''}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, retreadCompany: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Kaplama Maliyeti</label>
                <input
                  type="number"
                  value={newRetreadTire.retreadCost || 0}
                  onChange={(e) => setNewRetreadTire({ ...newRetreadTire, retreadCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveRetread}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
              >
                Kaydet
              </button>
            </div>
          </div>

          <div className="mt-6 bg-[#1C2128] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Lastik Seri No</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Çıkış Depo</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Gidiş Tarihi</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Gidiş Maliyet</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Kaplama Durumu</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Dönüş Maliyet</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Dönüş Tarihi</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Önceki D.D.</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Kaplanan Marka</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Kaplanan Desen</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Kaplanan Seri No</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Sonraki D.D.</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Gidiş Notu</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Dönüş Notu</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Ebat</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Marka</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Desen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTires.map((tire, index) => (
                    <tr key={tire.id} className={index % 2 === 0 ? 'bg-[#1C2128]' : 'bg-[#22272E]'}>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.serialNumber}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.location}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadDate}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadCost}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadStatus}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadReturnCost}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadReturnDate}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.previousTreadDepth}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadBrand}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadPattern}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.retreadSerialNumber}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.nextTreadDepth}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.departureNote}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.returnNote}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.size}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.brand}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.pattern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Depo' && (
        <>
          <div className="bg-[#1C2128] rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Yeni Depo Lastiği Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">Seri No</label>
                <input
                  type="text"
                  value={newStorageTire.serialNumber || ''}
                  onChange={(e) => setNewStorageTire({ ...newStorageTire, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: 8IBB19827"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Ebat</label>
                <input
                  type="text"
                  value={newStorageTire.size || ''}
                  onChange={(e) => setNewStorageTire({ ...newStorageTire, size: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: 315/80 R22,5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Marka</label>
                <select
                  value={newStorageTire.brand || ''}
                  onChange={(e) => setNewStorageTire({ ...newStorageTire, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                >
                  <option value="">Marka Seçin</option>
                  <option value="Michelin">Michelin</option>
                  <option value="Bridgestone">Bridgestone</option>
                  <option value="Goodyear">Goodyear</option>
                  <option value="Continental">Continental</option>
                  <option value="Pirelli">Pirelli</option>
                  <option value="Hankook">Hankook</option>
                  <option value="Yokohama">Yokohama</option>
                  <option value="Dunlop">Dunlop</option>
                  <option value="BFGoodrich">BFGoodrich</option>
                  <option value="Cooper Tires">Cooper Tires</option>
                  <option value="Firestone">Firestone</option>
                  <option value="Nokian Tyres">Nokian Tyres</option>
                  <option value="Toyo Tires">Toyo Tires</option>
                  <option value="Kumho">Kumho</option>
                  <option value="Falken">Falken</option>
                  <option value="General Tire">General Tire</option>
                  <option value="Ceat">Ceat</option>
                  <option value="Apollo Tyres">Apollo Tyres</option>
                  <option value="MRF">MRF</option>
                  <option value="Double Coin">Double Coin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Desen</label>
                <input
                  type="text"
                  value={newStorageTire.pattern || ''}
                  onChange={(e) => setNewStorageTire({ ...newStorageTire, pattern: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: 7500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Depoya Geliş Tarihi</label>
                <input
                  type="date"
                  value={newStorageTire.installationDate || ''}
                  onChange={(e) => setNewStorageTire({ ...newStorageTire, installationDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Depo Konumu (Opsiyonel)</label>
                <input
                  type="text"
                  value={newStorageTire.storageLocation || ''}
                  onChange={(e) => setNewStorageTire({ ...newStorageTire, storageLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: A-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Tesis (Opsiyonel)</label>
                <input
                  type="text"
                  value={newStorageTire.facility || ''}
                  onChange={(e) => setNewStorageTire({ ...newStorageTire, facility: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white mt-1"
                  placeholder="Örn: İstanbul Depo"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveStorage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
              >
                Kaydet
              </button>
            </div>
          </div>

          <div className="mt-6 bg-[#1C2128] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Seri No</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Ebat</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Marka</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Desen</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Depoya Geliş Tarihi</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Depo Konumu</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">Tesis</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-[#2D333B]">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTires.map((tire, index) => (
                    <tr key={tire.id} className={index % 2 === 0 ? 'bg-[#1C2128]' : 'bg-[#22272E]'}>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.serialNumber}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.size}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.brand}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.pattern}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.installationDate}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.storageLocation}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{tire.facility}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
                        <button
                          onClick={() => handleTransfer(tire)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                        >
                          Transfer Et
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Lastiği Transfer Et</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hedef Birim</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value as TireLocation)}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                >
                  <option value="Kaplama">Kaplama</option>
                  <option value="Dış Ayar">Dış Ayar</option>
                  <option value="Tamir">Tamir</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleTransferConfirm}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  Transfer Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 