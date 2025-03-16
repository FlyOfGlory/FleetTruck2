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
  "Plaka "?: string;
  "İlk Mesafe Sayacı Değeri (km)"?: string;
  "İlk Mesafe Sayacı Değeri Tarihi "?: string;
  "Son Mesafe Sayacı Değeri (km)"?: string;
  "Son Mesafe Sayacı Değeri Tarihi "?: string;
  "Toplam Mesafe (km)"?: string;
}

interface ExcelData {
  Plaka: string;
  Kilometre: number;
  Tarih: string;
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
          dateNF: 'dd.mm.yyyy'
        });

        if (jsonData.length === 0) {
          throw new Error('Excel dosyasında veri bulunamadı');
        }

        console.log('Excel verisi:', jsonData);

        // Excel verilerini önizleme için ayarla
        const previewRows: ExcelData[] = jsonData.map(row => {
          console.log('İşlenen satır:', row);
          const kilometre = row["İlk Mesafe Sayacı Değeri (km)"] || row["Son Mesafe Sayacı Değeri (km)"] || '0';
          return {
            Plaka: String(row["Plaka "] || '').trim(),
            Kilometre: parseInt(String(kilometre).replace(/[^0-9.]/g, '')),
            Tarih: String(row["İlk Mesafe Sayacı Değeri Tarihi "] || row["Son Mesafe Sayacı Değeri Tarihi "] || '').trim()
          };
        }).filter(row => row.Plaka && row.Kilometre > 0);

        console.log('Önizleme verileri:', previewRows);
        setPreviewData(previewRows);

        const unmatched: string[] = [];
        const updatedVehicles = [...vehicles];
        let updateCount = 0;

        previewRows.forEach((row) => {
          if (!row.Plaka || !row.Kilometre) {
            return;
          }

          const plate = row.Plaka.trim().toUpperCase();
          const vehicleIndex = updatedVehicles.findIndex(v => v.plate.trim().toUpperCase() === plate);

          if (vehicleIndex !== -1) {
            const vehicle = updatedVehicles[vehicleIndex];
            const oldMileage = vehicle.mileage || 0;
            
            if (row.Kilometre > oldMileage) {
              updatedVehicles[vehicleIndex] = {
                ...vehicle,
                mileage: row.Kilometre
              };
              
              updateCount++;

              if (currentUser) {
                auditLogService.createLog(
                  currentUser,
                  'update_vehicle',
                  {
                    entityId: vehicle.id,
                    entityType: 'vehicle',
                    description: `${vehicle.plate} plakalı aracın kilometresi güncellendi.`,
                    oldValue: { mileage: oldMileage },
                    newValue: { mileage: row.Kilometre }
                  }
                );
              }
            }
          } else {
            unmatched.push(plate);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Kilometre Verisi Yükle</h1>

      <div className="bg-[#1C2128] rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-white mb-2">Excel Dosyası Yükle</h2>
          <p className="text-gray-400 text-sm mb-4">
            Excel dosyanızda "Plaka", "Kilometre" ve "Tarih" sütunları bulunmalıdır.
          </p>
          <form
            onDragEnter={handleDrag}
            onSubmit={(e) => e.preventDefault()}
            className="w-full"
          >
            <label
              className={`
                relative flex flex-col items-center justify-center w-full p-6 
                border-2 border-dashed rounded-lg cursor-pointer
                transition-colors duration-200 ease-in-out
                ${dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 hover:border-gray-500'
                }
              `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload 
                  className={`w-12 h-12 mb-3 ${loading ? 'animate-bounce' : ''} ${
                    dragActive ? 'text-blue-500' : 'text-gray-400'
                  }`}
                />
                <p className="mb-2 text-sm text-gray-300">
                  {loading 
                    ? 'Yükleniyor...' 
                    : <span>Excel dosyasını sürükleyin veya <span className="text-blue-500">seçmek için tıklayın</span></span>
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Desteklenen formatlar: XLSX, XLS
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleChange}
                disabled={loading}
              />
              {dragActive && (
                <div
                  className="absolute inset-0 rounded-lg"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                />
              )}
            </label>
          </form>
        </div>

        {/* Excel Önizleme */}
        {previewData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-2">Excel Önizleme</h3>
            <div className="bg-[#2D333B] rounded-lg p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Plaka</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Kilometre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-700/30">
                      <td className="px-4 py-2 text-sm text-gray-300">{row.Plaka}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-300">
                        {row.Kilometre?.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">{row.Tarih}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {unmatchedPlates.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-2">Eşleşmeyen Plakalar</h3>
            <div className="bg-[#2D333B] rounded-lg p-4">
              <p className="text-gray-400 mb-2">
                Aşağıdaki plakalar sistemde bulunamadı:
              </p>
              <div className="space-y-1">
                {unmatchedPlates.map((plate, index) => (
                  <div key={index} className="text-red-400">
                    {plate}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Yükleme Geçmişi */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-white mb-4">Yükleme Geçmişi</h2>
          <div className="space-y-4">
            {Object.entries(groupByDate(uploadHistory)).map(([date, records]) => (
              <div key={date} className="bg-[#2D333B] rounded-lg overflow-hidden">
                <div className="bg-[#22272E] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      {(() => {
                        try {
                          const parsedDate = parseISO(date);
                          return isValid(parsedDate) 
                            ? format(parsedDate, 'd MMMM yyyy', { locale: tr })
                            : 'Geçersiz Tarih';
                        } catch {
                          return 'Geçersiz Tarih';
                        }
                      })()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {records.length} yükleme
                  </span>
                </div>
                <div className="divide-y divide-gray-700">
                  {records.map((record) => (
                    <div key={record.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedUpload(selectedUpload?.id === record.id ? null : record)}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300">
                              {(() => {
                                try {
                                  const parsedDate = parseISO(record.date);
                                  return isValid(parsedDate)
                                    ? format(parsedDate, 'HH:mm', { locale: tr })
                                    : '--:--';
                                } catch {
                                  return '--:--';
                                }
                              })()}
                            </span>
                            <h3 className="text-sm font-medium text-gray-200">
                              {record.fileName}
                            </h3>
                            {selectedUpload?.id === record.id ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-xs">
                            <span className="text-gray-400">
                              {record.recordCount} kayıt
                            </span>
                            <span className="text-green-400">
                              {record.updatedCount} güncelleme
                            </span>
                            {record.unmatchedCount > 0 && (
                              <span className="text-red-400">
                                {record.unmatchedCount} eşleşmeyen
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteHistory(record.id)}
                          className="p-1 hover:bg-red-500/10 rounded-full transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>

                      {selectedUpload?.id === record.id && (
                        <div className="mt-4 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Plaka</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Kilometre</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Tarih</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {record.data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-700/30">
                                  <td className="px-4 py-2 text-sm text-gray-300">{row.Plaka}</td>
                                  <td className="px-4 py-2 text-sm text-right text-gray-300">
                                    {row.Kilometre?.toLocaleString('tr-TR')}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-300">{row.Tarih}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3 text-white">Önemli Notlar:</h2>
        <ul className="list-disc list-inside text-gray-400">
          <li>Excel dosyanızda tüm gerekli sütunlar bulunmalıdır</li>
          <li>Sistem, araçların mevcut kilometresinden düşük değerleri dikkate almaz</li>
          <li>Son bakımdan itibaren 39.000 km'yi geçen araçlar için uyarı verilir</li>
          <li>Tüm yükleme geçmişi ve veriler otomatik olarak kaydedilir</li>
        </ul>
      </div>
    </div>
  );
}; 