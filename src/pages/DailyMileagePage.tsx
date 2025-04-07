import React, { useState, useEffect } from 'react';
import { DailyMileage, DailyMileageFormData } from '../types/dailyMileage';
import { Vehicle } from '../types/Vehicle';
import { getDailyMileageRecords, addDailyMileage, deleteDailyMileage } from '../services/dailyMileageService';
import { toast } from 'react-hot-toast';

const DailyMileagePage: React.FC = () => {
  const [records, setRecords] = useState<DailyMileage[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [formData, setFormData] = useState<DailyMileageFormData>({
    vehicleId: '',
    plate: '',
    date: new Date().toISOString().split('T')[0],
    startKm: 0,
    endKm: 0,
    driver: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedVehicles = localStorage.getItem('vehicles');
    if (storedVehicles) {
      setVehicles(JSON.parse(storedVehicles));
    }
    setRecords(getDailyMileageRecords());
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicleId);
      setFormData(prev => ({
        ...prev,
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        startKm: vehicle.mileage || 0
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRecord = addDailyMileage(formData);
      setRecords(prev => [...prev, newRecord]);
      toast.success('Günlük kilometre kaydı eklendi');
      setFormData({
        vehicleId: '',
        plate: '',
        date: new Date().toISOString().split('T')[0],
        startKm: 0,
        endKm: 0,
        driver: '',
        notes: ''
      });
      setSelectedVehicle('');
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      deleteDailyMileage(id);
      setRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Kayıt silindi');
    }
  };

  const filteredRecords = records.filter(record => {
    if (selectedVehicle && record.vehicleId !== selectedVehicle) return false;
    if (startDate && record.date < startDate) return false;
    if (endDate && record.date > endDate) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Günlük Kilometre Takibi</h1>
      
      {/* Filtreler */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Araç</label>
            <select
              className="w-full p-2 rounded bg-gray-700"
              value={selectedVehicle}
              onChange={(e) => handleVehicleSelect(e.target.value)}
            >
              <option value="">Tüm Araçlar</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-700"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-700"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Yeni Kayıt Formu */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-4">Yeni Kilometre Kaydı</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Araç</label>
            <select
              className="w-full p-2 rounded bg-gray-700"
              value={formData.vehicleId}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              required
            >
              <option value="">Araç Seçin</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tarih</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-700"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Başlangıç Km</label>
            <input
              type="number"
              className="w-full p-2 rounded bg-gray-700"
              value={formData.startKm}
              onChange={(e) => setFormData(prev => ({ ...prev, startKm: Number(e.target.value) }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bitiş Km</label>
            <input
              type="number"
              className="w-full p-2 rounded bg-gray-700"
              value={formData.endKm}
              onChange={(e) => setFormData(prev => ({ ...prev, endKm: Number(e.target.value) }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sürücü</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700"
              value={formData.driver}
              onChange={(e) => setFormData(prev => ({ ...prev, driver: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* Kayıt Listesi */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Kilometre Kayıtları</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Tarih</th>
                <th className="text-left p-2">Plaka</th>
                <th className="text-left p-2">Başlangıç Km</th>
                <th className="text-left p-2">Bitiş Km</th>
                <th className="text-left p-2">Günlük Km</th>
                <th className="text-left p-2">Sürücü</th>
                <th className="text-left p-2">Notlar</th>
                <th className="text-left p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id} className="border-b border-gray-700">
                  <td className="p-2">{new Date(record.date).toLocaleDateString('tr-TR')}</td>
                  <td className="p-2">{record.plate}</td>
                  <td className="p-2">{record.startKm.toLocaleString('tr-TR')}</td>
                  <td className="p-2">{record.endKm.toLocaleString('tr-TR')}</td>
                  <td className="p-2">{record.dailyKm.toLocaleString('tr-TR')}</td>
                  <td className="p-2">{record.driver || '-'}</td>
                  <td className="p-2">{record.notes || '-'}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Sil
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

export default DailyMileagePage; 