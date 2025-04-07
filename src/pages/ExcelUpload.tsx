import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Vehicle } from '../types/Vehicle';
import { toast } from 'react-toastify';
import { ExcelUploadHistory } from '../types/ExcelUpload';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, ChevronDown, ChevronRight, Upload, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auditLogService } from '../services/auditLogService';
import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface RawExcelData {
  "Kayıt No Cihaz Numarası"?: string;
  "Plaka"?: string;
  "Sürücü"?: string;
  "İlk Mesafe Sayacı Değ"?: string;
  "İlk Mesafe Sayacı Değeri Tarihi"?: string;
  "Son Mesafe Sayacı De"?: string;
  "Son Mesafe Sayacı Değeri Tarihi"?: string;
  "Toplam Mesafe (km)"?: string;
}

interface ExcelData {
  kayitNo: string;
  cihazNo: string;
  plaka: string;
  surucu: string;
  ilkKm: number;
  ilkTarih: string;
  sonKm: number;
  sonTarih: string;
  toplamMesafe: string;
}

interface UploadRecord {
  id: string;
  date: string;
  fileName: string;
  recordCount: number;
  updatedCount: number;
  unmatchedCount: number;
  data: ExcelData[];
}

const VEHICLES_STORAGE_KEY = 'fleet-management-vehicles';
const UPLOAD_HISTORY_KEY = 'excel-upload-history';
const fileTypes = ['.xlsx', '.xls'];

// Sayıyı Türkçe formatından JavaScript sayısına çevir (tr-TR kültürü)
const parseLocalizedNumber = (value: string): number => {
  if (!value) return 0;
  
  try {
    // Metin içindeki sayısal değeri çıkart (örn: "Toplam KM: 1255,00 km" -> "1255,00")
    const numberMatch = value.match(/\d+[,\.]?\d*/);
    if (!numberMatch) return 0;
    
    const numberOnly = numberMatch[0];
    console.log('Çıkarılan sayı:', numberOnly);
    
    // Türkçe kültür ayarlarına göre işle (tr-TR)
    // 1. Binlik ayracı olan noktaları kaldır
    const withoutThousands = numberOnly.replace(/\./g, '');
    // 2. Virgülü noktaya çevir (JavaScript ondalık ayracı)
    const normalized = withoutThousands.replace(',', '.');
    // 3. Sayıya çevir
    const parsed = parseFloat(normalized);
    console.log('Dönüştürülen sayı:', parsed);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Sayı çevirme hatası:', error);
    return 0;
  }
};

// JavaScript sayısını Türkçe formatına çevir (tr-TR kültürü)
const formatLocalizedNumber = (value: number): string => {
  if (value === 0) return '0';
  
  try {
    // Türkçe kültür ayarlarına göre formatla (tr-TR)
    // 1. Sayıyı string'e çevir ve 2 ondalık basamak kullan
    const parts = value.toFixed(2).split('.');
    // 2. Ondalık kısmı virgülle birleştir
    return parts[0] + ',' + (parts[1] || '00');
  } catch (error) {
    console.error('Sayı formatlama hatası:', error);
    return '0';
  }
};

export const ExcelUpload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<UploadRecord | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [unmatchedPlates, setUnmatchedPlates] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelData[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    }

    const savedHistory = localStorage.getItem(UPLOAD_HISTORY_KEY);
    if (savedHistory) {
      setUploadHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (!fileTypes.some(type => file.name.toLowerCase().endsWith(type))) {
      toast.error('Lütfen geçerli bir Excel dosyası seçin (.xlsx veya .xls)');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Dosya okunamadı');
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<RawExcelData>(worksheet, { 
          raw: false,
          dateNF: 'dd.mm.yyyy',
          defval: '',
          blankrows: false,
          header: 1
        });

        if (jsonData.length === 0) {
          throw new Error('Excel dosyasında veri bulunamadı');
        }

        console.log('Ham Excel verisi:', jsonData);

        // İlk satırı başlık olarak kullan
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        // Excel verilerini önizleme için ayarla
        const previewRows: ExcelData[] = rows.map(row => {
          const rowData = row as any[];
          const getColumnValue = (columnName: string) => {
            const index = headers.findIndex(h => h.includes(columnName));
            return index >= 0 ? rowData[index] : '';
          };

          // Toplam mesafe değerini direkt olarak al
          const toplamMesafe = String(getColumnValue("Toplam Mesafe (km)") || '0');
          console.log('Ham toplam mesafe değeri:', toplamMesafe);

          // Kayıt No ve Cihaz Numarası aynı sütunda
          const kayitNoCihazNo = String(getColumnValue("Kayıt No Cihaz") || '').trim().split(' ');
          const kayitNo = kayitNoCihazNo[0] || '';
          const cihazNo = kayitNoCihazNo[1] || '';

          return {
            kayitNo: kayitNo,
            cihazNo: cihazNo,
            plaka: String(getColumnValue("Plaka") || '').trim(),
            surucu: String(getColumnValue("Sürücü") || '').trim(),
            ilkKm: 0,
            ilkTarih: String(getColumnValue("İlk Mesafe Sayacı Değeri Tarihi") || ''),
            sonKm: 0,
            sonTarih: String(getColumnValue("Son Mesafe Sayacı Değeri Tarihi") || ''),
            toplamMesafe: toplamMesafe
          };
        }).filter(row => row.plaka && row.toplamMesafe !== '0');

        console.log('Önizleme verileri:', previewRows);
        setPreviewData(previewRows);

        const unmatched: string[] = [];
        const updatedVehicles = [...vehicles];
        let updateCount = 0;

        previewRows.forEach((row) => {
          if (!row.plaka) return;

          // Plakadaki tüm boşlukları kaldır ve büyük harfe çevir
          const normalizedPlate = row.plaka.trim().toUpperCase().replace(/\s+/g, '');
          const vehicleIndex = updatedVehicles.findIndex(v => 
            v.plate.trim().toUpperCase().replace(/\s+/g, '') === normalizedPlate
          );

          if (vehicleIndex !== -1) {
            const vehicle = updatedVehicles[vehicleIndex];
            const currentMileage = vehicle.mileage || '0';
            
            // Excel'den gelen toplam mesafe değerini direkt olarak al
            const newMileage = row.toplamMesafe;
            console.log('Excel\'den gelen kilometre:', newMileage);
            
            // Mevcut kilometre ve yeni kilometre değerlerini virgüle kadar al
            const currentMileageInt = parseInt(currentMileage.split(',')[0]) || 0;
            const newMileageInt = parseInt(newMileage.split(',')[0]) || 0;
            
            // Toplam kilometreyi hesapla
            const totalMileage = currentMileageInt + newMileageInt;
            console.log('Toplam kilometre:', totalMileage);
            
            // Toplam kilometreyi string'e çevir
            const totalMileageStr = totalMileage.toString();
            
            // Toplam mesafe değerini güncelle
            updatedVehicles[vehicleIndex] = {
              ...vehicle,
              mileage: totalMileageStr,
              lastMileageUpdate: new Date().toISOString(),
              driver: row.surucu || vehicle.driver
            };
            
            updateCount++;
            
            // Denetim kaydı oluştur
            if (currentUser) {
              auditLogService.createLog(currentUser, 'update_vehicle', {
                description: `${vehicle.plate} plakalı aracın kilometresi güncellendi: ${currentMileage} -> ${totalMileageStr} km (Eklenen: ${newMileage} km)`,
                entityType: 'vehicle',
                entityId: vehicle.id,
                oldValue: { mileage: currentMileage },
                newValue: { mileage: totalMileageStr }
              });
            }
          } else {
            unmatched.push(normalizedPlate);
          }
        });

        // Yükleme kaydını oluştur
        const uploadRecord: UploadRecord = {
          id: uuidv4(),
          date: new Date().toISOString(),
          fileName: file.name,
          recordCount: previewRows.length,
          updatedCount: updateCount,
          unmatchedCount: unmatched.length,
          data: previewRows
        };

        const newHistory = [uploadRecord, ...uploadHistory];
        setUploadHistory(newHistory);
        localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(newHistory));

        if (updateCount > 0) {
          localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
          setVehicles(updatedVehicles);
          toast.success(`${updateCount} aracın kilometre bilgisi güncellendi.`);
        }

        if (unmatched.length > 0) {
          setUnmatchedPlates(unmatched);
          toast.warning(`${unmatched.length} plaka sistemde bulunamadı.`);
        }

      } catch (error) {
        console.error('Excel dosyası işlenirken hata oluştu:', error);
        toast.error(error instanceof Error ? error.message : 'Excel dosyası işlenirken bir hata oluştu.');
        setPreviewData([]);
        setSelectedUpload(null);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Dosya okuma hatası.');
      setLoading(false);
      setPreviewData([]);
      setSelectedUpload(null);
    };

    reader.readAsBinaryString(file);
  }, [vehicles, currentUser, uploadHistory]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  }, [handleFileUpload]);

  const handleDeleteHistory = useCallback((id: string) => {
    if (window.confirm('Bu yükleme kaydını silmek istediğinize emin misiniz?')) {
      const newHistory = uploadHistory.filter(record => record.id !== id);
      setUploadHistory(newHistory);
      localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(newHistory));
      if (selectedUpload?.id === id) {
        setSelectedUpload(null);
      }
      toast.success('Yükleme kaydı silindi.');
    }
  }, [uploadHistory, selectedUpload]);

  const groupByDate = useCallback((records: UploadRecord[]) => {
    const groups: { [key: string]: UploadRecord[] } = {};
    records.forEach(record => {
      try {
        if (!record?.date) {
          console.warn('Kayıt için tarih bilgisi bulunamadı:', record);
          return;
        }

        let dateToUse: Date;
        try {
          dateToUse = parseISO(record.date);
          if (!isValid(dateToUse)) {
            console.warn('Geçersiz tarih formatı:', record.date);
            return;
          }
        } catch (error) {
          console.warn('Tarih ayrıştırma hatası:', record.date);
          return;
        }

        const dateKey = format(dateToUse, 'yyyy-MM-dd');
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(record);
      } catch (error) {
        console.error('Kayıt işlenirken hata oluştu:', error);
      }
    });

    // Tarihe göre sırala (en yeni en üstte)
    const sortedGroups: { [key: string]: UploadRecord[] } = {};
    Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .forEach(key => {
        sortedGroups[key] = groups[key].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

    return sortedGroups;
  }, []);

  // Sayfa yüklendiğinde geçersiz kayıtları temizle
  useEffect(() => {
    const cleanUploadHistory = () => {
      const validRecords = uploadHistory.filter(record => {
        try {
          if (!record?.date) return false;
          const date = parseISO(record.date);
          return isValid(date);
        } catch {
          return false;
        }
      });

      if (validRecords.length !== uploadHistory.length) {
        setUploadHistory(validRecords);
        localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(validRecords));
        console.info('Geçersiz kayıtlar temizlendi.');
      }
    };

    cleanUploadHistory();
  }, [uploadHistory]);

  // Tüm araçların kilometre bilgilerini sıfırla
  const resetAllVehicleMileage = useCallback(() => {
    if (!currentUser) {
      toast.error('Bu işlem için yetkiniz yok.');
      return;
    }

    if (!window.confirm('Tüm araçların kilometre bilgilerini sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    const updatedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      mileage: '0',
      lastMileageUpdate: new Date().toISOString()
    }));

    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));

    // Denetim kaydı oluştur
    auditLogService.createLog(currentUser, 'reset_all_vehicles', {
      description: 'Tüm araçların kilometre bilgileri sıfırlandı.',
      entityType: 'vehicle',
      entityId: 'all',
      oldValue: { vehicles: vehicles.map(v => ({ id: v.id, plate: v.plate, mileage: v.mileage })) },
      newValue: { vehicles: updatedVehicles.map(v => ({ id: v.id, plate: v.plate, mileage: v.mileage })) }
    });

    toast.success('Tüm araçların kilometre bilgileri sıfırlandı.');
  }, [vehicles, currentUser]);

  return (
    <div className="p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Kilometre Bilgisi Yükleme</h1>
          <button
            onClick={resetAllVehicleMileage}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tüm Kilometreleri Sıfırla
          </button>
        </div>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-300 mb-2">Excel dosyasını sürükleyip bırakın veya seçin</p>
            <p className="text-gray-400 text-sm">(.xlsx veya .xls)</p>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleChange}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
            >
              Dosya Seç
            </label>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-300">Dosya işleniyor...</p>
        </div>
      )}

      {previewData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Önizleme</h2>
          <div className="bg-[#161b22] rounded-lg shadow-md overflow-hidden border border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#0d1117]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Kayıt No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cihaz No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Plaka
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Sürücü
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      İlk Km
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      İlk Tarih
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Son Km
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Son Tarih
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Toplam Mesafe
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#161b22] divide-y divide-gray-800">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-[#21262d]">
                      <td className="px-4 py-2 text-sm text-gray-300">{row.kayitNo}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.cihazNo}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.plaka}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.surucu}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-300">
                        {row.ilkKm > 0 ? formatLocalizedNumber(row.ilkKm) : ''}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.ilkTarih}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-300">
                        {row.sonKm > 0 ? formatLocalizedNumber(row.sonKm) : ''}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.sonTarih}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-300">
                        {row.toplamMesafe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {unmatchedPlates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Eşleşmeyen Plakalar</h2>
          <div className="bg-[#161b22] rounded-lg shadow-md p-4 border border-gray-800">
            <div className="text-gray-300">
              {unmatchedPlates.map((plate, index) => (
                <span key={index} className="inline-block bg-red-900/50 text-red-200 rounded px-2 py-1 text-sm mr-2 mb-2">
                  {plate}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {uploadHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Yükleme Geçmişi</h2>
          <div className="space-y-4">
            {uploadHistory.map((record) => (
              <div key={record.id} className="bg-[#161b22] rounded-lg shadow-md border border-gray-800">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {format(parseISO(record.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {record.fileName} • {record.recordCount} kayıt • {record.updatedCount} güncelleme
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedUpload(selectedUpload?.id === record.id ? null : record)}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/30"
                    >
                      {selectedUpload?.id === record.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(record.id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700/30"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {selectedUpload?.id === record.id && (
                  <div className="border-t border-gray-800">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-[#0d1117]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Kayıt No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Cihaz No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Plaka
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Sürücü
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                              İlk Km
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              İlk Tarih
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Son Km
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Son Tarih
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Toplam Mesafe
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#161b22] divide-y divide-gray-800">
                          {record.data.map((row, index) => (
                            <tr key={index} className="hover:bg-[#21262d]">
                              <td className="px-4 py-2 text-sm text-gray-300">{row.kayitNo}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">{row.cihazNo}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">{row.plaka}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">{row.surucu}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-300">
                                {row.ilkKm > 0 ? formatLocalizedNumber(row.ilkKm) : ''}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-300">{row.ilkTarih}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-300">
                                {row.sonKm > 0 ? formatLocalizedNumber(row.sonKm) : ''}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-300">{row.sonTarih}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-300">
                                {row.toplamMesafe}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 