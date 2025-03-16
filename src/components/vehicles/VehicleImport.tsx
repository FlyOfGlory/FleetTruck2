import React, { useState } from 'react';
import { Vehicle, VehicleType, VehicleStatus } from '../../types/Vehicle';
import * as XLSX from 'xlsx';

interface VehicleImportProps {
  onImport: (vehicles: Vehicle[]) => void;
  onCancel: () => void;
}

interface VehicleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate: (updatedVehicle: Vehicle) => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ vehicle, onClose, onUpdate }) => {
  const [maintenanceDate, setMaintenanceDate] = useState(vehicle.lastMaintenance);
  const [status, setStatus] = useState(vehicle.status);

  const handleUpdate = () => {
    // 6 ay sonrasını hesapla
    const nextMaintenanceDate = new Date(maintenanceDate);
    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);

    onUpdate({
      ...vehicle,
      lastMaintenance: maintenanceDate,
      nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0],
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2D333B] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Araç Detayları</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Plaka</label>
            <div className="text-white">{vehicle.plate}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tip</label>
            <div className="text-white">{vehicle.type}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
            <div className="text-white">{vehicle.model}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Yıl</label>
            <div className="text-white">{vehicle.year}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Şasi No</label>
            <div className="text-white">{vehicle.chassisNumber}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Son Bakım Tarihi</label>
            <input
              type="date"
              value={maintenanceDate}
              onChange={(e) => setMaintenanceDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sonraki Bakım Tarihi</label>
            <div className="text-white">
              {new Date(maintenanceDate).setMonth(new Date(maintenanceDate).getMonth() + 6)
                ? new Date(new Date(maintenanceDate).setMonth(new Date(maintenanceDate).getMonth() + 6)).toLocaleDateString('tr-TR')
                : 'Tarih seçilmedi'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
            >
              <option value="Aktif">Aktif</option>
              <option value="Bakımda">Bakımda</option>
              <option value="İnaktif">İnaktif</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Güncelle
          </button>
        </div>
      </div>
    </div>
  );
};

export const VehicleImport: React.FC<VehicleImportProps> = ({ onImport, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Lütfen geçerli bir Excel dosyası seçin (.xlsx veya .xls)');
        return;
      }
      setFile(selectedFile);
      setError('');
      handleFileRead(selectedFile);
    }
  };

  const normalizeVehicleType = (type: string): VehicleType => {
    type = type.trim().toUpperCase();
    if (type.includes('DAMPERLİ KAMYON')) return 'Kamyon';
    if (type.includes('CARGO')) return 'Kamyon';
    if (type.includes('AXOR')) return 'Çekici';
    if (type.includes('DODGE')) return 'Kamyon';
    return 'Kamyon'; // Varsayılan tip
  };

  const handleFileRead = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      if (workbook.SheetNames.length === 0) {
        setError('Excel dosyası boş');
        return;
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });

      if (jsonData.length === 0) {
        setError('Excel dosyasında veri bulunamadı');
        return;
      }

      // Excel verilerini dönüştür
      const vehicles: Vehicle[] = [];
      let hasErrors = false;
      const errors: string[] = [];

      // İlk satırı atla (başlık satırı)
      jsonData.slice(1).forEach((row: any, index) => {
        try {
          // A: Plaka, B: Tip, C: Model, D: Yıl, E: Şasi No
          const plate = (row['A']?.toString() || '').trim() || '?';
          const type = (row['B']?.toString() || '').trim() || '?';
          const model = (row['C']?.toString() || '').trim() || '?';
          const year = (row['D']?.toString() || '').trim() || '?';
          const chassisNumber = (row['E']?.toString() || '').trim() || '?';

          // Eğer tüm değerler "?" ise, bu satırı atla
          if (plate === '?' && type === '?' && model === '?' && year === '?' && chassisNumber === '?') {
            return;
          }

          // Bugünün tarihini al
          const today = new Date();
          const lastMaintenance = today.toISOString().split('T')[0];
          
          // 6 ay sonrasını hesapla
          const nextMaintenanceDate = new Date(today);
          nextMaintenanceDate.setMonth(today.getMonth() + 6);
          const nextMaintenance = nextMaintenanceDate.toISOString().split('T')[0];

          vehicles.push({
            id: crypto.randomUUID(),
            plate,
            model,
            type: normalizeVehicleType(type),
            year,
            chassisNumber,
            lastMaintenance,
            nextMaintenance,
            status: 'Aktif'
          });
        } catch (err) {
          hasErrors = true;
          errors.push(err instanceof Error ? err.message : `Satır ${index + 2}: Bilinmeyen hata`);
        }
      });

      if (vehicles.length === 0) {
        setError('Aktarılabilecek araç bulunamadı');
        return;
      }

      setPreview(vehicles);
      setError('');
    } catch (err) {
      console.error('Excel okuma hatası:', err);
      setError(
        'Excel dosyası okunurken bir hata oluştu. ' +
        'Lütfen dosyanın doğru formatta olduğundan emin olun:\n\n' +
        '1. Excel dosyası .xlsx veya .xls formatında olmalı\n' +
        '2. Sütun sıralaması şu şekilde olmalı:\n' +
        '   - 1. sütun: Plaka\n' +
        '   - 2. sütun: Tip\n' +
        '   - 3. sütun: Model\n' +
        '   - 4. sütun: Yıl\n' +
        '   - 5. sütun: Şasi Numarası\n\n' +
        'Not: Boş hücreler otomatik olarak "?" ile doldurulacaktır.'
      );
      setPreview([]);
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
    } else {
      setError('İçe aktarılacak veri bulunamadı');
    }
  };

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    setPreview(preview.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    setSelectedVehicle(null);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-[#2D333B] rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Excel'den Araç Yükle</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excel Dosyası
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600
                file:cursor-pointer"
            />
            <div className="mt-2 text-sm text-gray-400 space-y-1">
              <p>Excel dosyanızda sütunlar şu sırayla olmalıdır:</p>
              <ul className="list-decimal list-inside pl-4 space-y-1">
                <li>Plaka (zorunlu, boş ise "?" atanır)</li>
                <li>Tip (zorunlu, boş ise "?" atanır)</li>
                <li>Model (zorunlu, boş ise "?" atanır)</li>
                <li>Yıl (zorunlu, boş ise "?" atanır)</li>
                <li>Şasi Numarası (zorunlu, boş ise "?" atanır)</li>
              </ul>
              <p className="mt-2 text-yellow-500">Not: Boş hücreler otomatik olarak "?" ile doldurulacaktır.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded whitespace-pre-line">
              {error}
            </div>
          )}

          {preview.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-white mb-3">Önizleme ({preview.length} araç)</h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#1C2128]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Plaka</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tip</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Yıl</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Şasi No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Son Bakım</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#2D333B] divide-y divide-gray-700">
                    {preview.map((vehicle, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.plate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.chassisNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(vehicle.lastMaintenance).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'Aktif' 
                              ? 'bg-green-900/50 text-green-300'
                              : vehicle.status === 'Bakımda'
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : 'bg-red-900/50 text-red-300'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Detay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={preview.length === 0}
              className={`px-4 py-2 rounded-lg text-sm text-white ${
                preview.length > 0
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-blue-500/50 cursor-not-allowed'
              }`}
            >
              {preview.length > 0 ? `${preview.length} Aracı İçe Aktar` : 'İçe Aktar'}
            </button>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onUpdate={handleVehicleUpdate}
        />
      )}
    </div>
  );
}; 