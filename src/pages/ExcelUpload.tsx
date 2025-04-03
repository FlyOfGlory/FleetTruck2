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
  toplamMesafe: number;
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

          const ilkKm = parseFloat(String(getColumnValue("İlk Mesafe Sayacı Değ") || '0').replace(/[^0-9.]/g, ''));
          const sonKm = parseFloat(String(getColumnValue("Son Mesafe Sayacı De") || '0').replace(/[^0-9.]/g, ''));
          const toplamMesafe = parseFloat(String(getColumnValue("Toplam Mesafe") || '0').replace(/[^0-9.]/g, ''));

          // Kayıt No ve Cihaz Numarası aynı sütunda
          const kayitNoCihazNo = String(getColumnValue("Kayıt No Cihaz") || '').trim().split(' ');
          const kayitNo = kayitNoCihazNo[0] || '';
          const cihazNo = kayitNoCihazNo[1] || '';

          return {
            kayitNo: kayitNo,
            cihazNo: cihazNo,
            plaka: String(getColumnValue("Plaka") || '').trim(),
            surucu: String(getColumnValue("Sürücü") || '').trim(),
            ilkKm: ilkKm,
            ilkTarih: String(getColumnValue("İlk Mesafe Sayacı Değeri Tarihi") || '').trim(),
            sonKm: sonKm,
            sonTarih: String(getColumnValue("Son Mesafe Sayacı Değeri Tarihi") || '').trim(),
            toplamMesafe: toplamMesafe
          };
        }).filter(row => row.plaka && (row.sonKm > 0 || row.ilkKm > 0));

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
            const oldMileage = vehicle.mileage || 0;
            const newMileage = row.sonKm || row.ilkKm;
            
            if (newMileage > oldMileage) {
              updatedVehicles[vehicleIndex] = {
                ...vehicle,
                mileage: newMileage,
                lastMileageUpdate: row.sonTarih || row.ilkTarih,
                driver: row.surucu || vehicle.driver
              };
              
              updateCount++;

              if (currentUser) {
                auditLogService.createLog(
                  currentUser,
                  'update_vehicle',
                  {
                    entityId: vehicle.id,
                    entityType: 'vehicle',
                    description: `${vehicle.plate} plakalı aracın kilometresi güncellendi. Sürücü: ${row.surucu}`,
                    oldValue: { mileage: oldMileage },
                    newValue: { mileage: newMileage }
                  }
                );
              }
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

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">Kilometre Bilgisi Yükleme</h1>
        
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
                        {row.ilkKm?.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.ilkTarih}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-300">
                        {row.sonKm?.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.sonTarih}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-300">
                        {row.toplamMesafe?.toLocaleString('tr-TR')}
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
                                {row.ilkKm?.toLocaleString('tr-TR')}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-300">{row.ilkTarih}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-300">
                                {row.sonKm?.toLocaleString('tr-TR')}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-300">{row.sonTarih}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-300">
                                {row.toplamMesafe?.toLocaleString('tr-TR')}
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