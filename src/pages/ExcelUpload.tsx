import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Vehicle } from '../types/Vehicle';
import { toast } from 'react-toastify';
import { ExcelUploadHistory } from '../types/ExcelUpload';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, ChevronDown, ChevronRight, Calendar } from 'lucide-react';

interface VehicleData {
  kayitNo: string;
  cihazNo: string;
  plaka: string;
  surucu: string;
  ilkMesafe: number;
  ilkMesafeTarih: string;
  sonMesafe: number;
  sonMesafeTarih: string;
  toplamMesafe: number;
}

export const ExcelUpload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<ExcelUploadHistory[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<ExcelUploadHistory | null>(null);
  const [previewData, setPreviewData] = useState<VehicleData[] | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedHistory = localStorage.getItem('excel-upload-history');
    if (savedHistory) {
      setUploadHistory(JSON.parse(savedHistory));
    }
  }, []);

  const processExcelData = (data: VehicleData[], fileName: string) => {
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const updatedVehicles = [...vehicles];
    let updatedCount = 0;
    let warningCount = 0;

    // Verileri işle
    data.forEach((vehicleData) => {
      if (vehicleData.plaka || vehicleData.cihazNo) {
        const vehicleIndex = updatedVehicles.findIndex(
          (v: Vehicle) => v.plate === vehicleData.plaka
        );

        if (vehicleIndex !== -1) {
          const vehicle = updatedVehicles[vehicleIndex];
          if (vehicleData.toplamMesafe > vehicle.mileage) {
            vehicle.mileage = vehicleData.toplamMesafe;
            updatedCount++;
            
            if (vehicleData.toplamMesafe - (vehicle.lastMaintenance?.mileage || 0) >= 39000) {
              toast.warning(`${vehicleData.plaka} plakalı araç bakım kilometresine yaklaşıyor!`);
              warningCount++;
            }
          }
        }
      }
    });

    // Araç verilerini güncelle
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    
    // Yeni yükleme kaydı oluştur
    const newUpload: ExcelUploadHistory = {
      id: uuidv4(),
      uploadDate: new Date().toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fileName,
      data: data, // Tüm veriyi olduğu gibi kaydet
      updatedVehicles: updatedCount,
      warningCount
    };

    // Yükleme geçmişini güncelle
    const newHistory = [newUpload, ...uploadHistory];
    setUploadHistory(newHistory);
    localStorage.setItem('excel-upload-history', JSON.stringify(newHistory));
    
    toast.success(
      `Excel dosyası başarıyla işlendi:\n` +
      `• ${data.length} araç verisi okundu\n` +
      `• ${updatedCount} aracın kilometresi güncellendi\n` +
      `• ${warningCount} araç için bakım uyarısı mevcut`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { 
          type: 'binary',
          cellDates: true,
          dateNF: 'dd.mm.yyyy hh:mm:ss'
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Excel verilerini başlıklarla birlikte oku
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
          blankrows: false,
          header: 1
        }) as any[];

        if (rawData.length === 0) {
          toast.error('Excel dosyası boş veya okunamıyor');
          setPreviewData(null);
          return;
        }

        // İlk satırı başlık olarak al
        const headers = rawData[0];
        // Veri satırlarını al (başlık hariç)
        const rows = rawData.slice(1);

        // Excel'deki tam başlıklar
        const columnHeaders = {
          kayitNo: 'Kayıt No',
          cihazNo: 'Cihaz Numarası',
          plaka: 'Plaka',
          surucu: 'Sürücü',
          ilkMesafe: 'İlk Mesafe Sayacı Değ',
          ilkMesafeTarih: 'İlk Mesafe Sayacı Değeri Tarihi',
          sonMesafe: 'Son Mesafe Sayacı De',
          sonMesafeTarih: 'Son Mesafe Sayacı Değeri Tarihi',
          toplamMesafe: 'Toplam Mesafe (km)'
        };

        // Başlık indekslerini bul
        const headerIndexes = {
          kayitNo: headers.findIndex((h: string) => h?.trim() === columnHeaders.kayitNo),
          cihazNo: headers.findIndex((h: string) => h?.trim() === columnHeaders.cihazNo),
          plaka: headers.findIndex((h: string) => h?.trim() === columnHeaders.plaka),
          surucu: headers.findIndex((h: string) => h?.trim() === columnHeaders.surucu),
          ilkMesafe: headers.findIndex((h: string) => h?.trim() === columnHeaders.ilkMesafe),
          ilkMesafeTarih: headers.findIndex((h: string) => h?.trim() === columnHeaders.ilkMesafeTarih),
          sonMesafe: headers.findIndex((h: string) => h?.trim() === columnHeaders.sonMesafe),
          sonMesafeTarih: headers.findIndex((h: string) => h?.trim() === columnHeaders.sonMesafeTarih),
          toplamMesafe: headers.findIndex((h: string) => h?.trim() === columnHeaders.toplamMesafe)
        };

        console.log('Excel başlıkları:', headers);
        console.log('Bulunan indeksler:', headerIndexes);

        // Verileri dönüştür
        const data = rows.map((row, idx) => {
          const cleanNumber = (value: any): number => {
            if (!value) return 0;
            const cleaned = value.toString()
              .replace(/[^\d.,]/g, '')
              .replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          };

          const vehicleData: VehicleData = {
            kayitNo: row[headerIndexes.kayitNo]?.toString() || '',
            cihazNo: row[headerIndexes.cihazNo]?.toString() || '',
            plaka: row[headerIndexes.plaka]?.toString() || '',
            surucu: row[headerIndexes.surucu]?.toString() || '',
            ilkMesafe: cleanNumber(row[headerIndexes.ilkMesafe]),
            ilkMesafeTarih: row[headerIndexes.ilkMesafeTarih]?.toString() || '',
            sonMesafe: cleanNumber(row[headerIndexes.sonMesafe]),
            sonMesafeTarih: row[headerIndexes.sonMesafeTarih]?.toString() || '',
            toplamMesafe: cleanNumber(row[headerIndexes.toplamMesafe])
          };

          // Eğer toplam mesafe hesaplanmamışsa ve son mesafe ilk mesafeden büyükse
          if (vehicleData.toplamMesafe === 0 && vehicleData.sonMesafe > vehicleData.ilkMesafe) {
            vehicleData.toplamMesafe = vehicleData.sonMesafe - vehicleData.ilkMesafe;
          }

          if (idx === 0) {
            console.log('İlk satır verisi:', vehicleData);
          }

          return vehicleData;
        });
        
        setPreviewData(data);
        processExcelData(data, file.name);
      } catch (error) {
        console.error('Excel okuma hatası:', error);
        toast.error('Excel dosyası işlenirken bir hata oluştu');
        setPreviewData(null);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDelete = (id: string) => {
    const newHistory = uploadHistory.filter(upload => upload.id !== id);
    setUploadHistory(newHistory);
    localStorage.setItem('excel-upload-history', JSON.stringify(newHistory));
    toast.success('Yükleme kaydı başarıyla silindi');
  };

  // Tarihi formatlayan yardımcı fonksiyon
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    return {
      dayName: days[date.getDay()],
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Yükleme geçmişini tarihe göre gruplandıran fonksiyon
  const groupUploadsByDate = (uploads: ExcelUploadHistory[]) => {
    const groups: { [key: string]: ExcelUploadHistory[] } = {};
    
    uploads.forEach(upload => {
      if (!upload.uploadDate) return;
      
      const date = new Date(upload.uploadDate);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(upload);
    });
    
    // Tarihleri yeniden eskiye sırala
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: ExcelUploadHistory[] });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Km Bazında Takip</h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Araç kilometre verilerini güncellemek için Excel dosyanızı yükleyin.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-8 bg-gray-900 text-white">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          disabled={loading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-block"
        >
          {loading ? 'Yükleniyor...' : 'Excel Dosyası Seç'}
        </label>
        
        <p className="mt-4 text-sm text-gray-400">
          veya dosyayı bu alana sürükleyip bırakın
        </p>
      </div>

      {previewData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Yüklenen Veriler (Önizleme)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Kayıt No</th>
                  <th className="px-4 py-2 text-left">Cihaz Numarası</th>
                  <th className="px-4 py-2 text-left">Plaka</th>
                  <th className="px-4 py-2 text-left">Sürücü</th>
                  <th className="px-4 py-2 text-right">İlk Mesafe Sayacı Değ</th>
                  <th className="px-4 py-2 text-left">İlk Mesafe Sayacı Değeri Tarihi</th>
                  <th className="px-4 py-2 text-right">Son Mesafe Sayacı De</th>
                  <th className="px-4 py-2 text-left">Son Mesafe Sayacı Değeri Tarihi</th>
                  <th className="px-4 py-2 text-right">Toplam Mesafe (km)</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.kayitNo}</td>
                    <td className="px-4 py-2">{row.cihazNo}</td>
                    <td className="px-4 py-2">{row.plaka}</td>
                    <td className="px-4 py-2">{row.surucu}</td>
                    <td className="px-4 py-2 text-right">{row.ilkMesafe.toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-2">{row.ilkMesafeTarih}</td>
                    <td className="px-4 py-2 text-right">{row.sonMesafe.toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-2">{row.sonMesafeTarih}</td>
                    <td className="px-4 py-2 text-right">{row.toplamMesafe.toLocaleString('tr-TR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Yükleme Geçmişi</h2>
        <div className="space-y-6">
          {Object.entries(groupUploadsByDate(uploadHistory)).map(([dateKey, uploads]) => {
            const firstUpload = uploads[0];
            if (!firstUpload?.uploadDate) return null;
            
            const { dayName, day, month, year } = formatDate(firstUpload.uploadDate);
            
            return (
              <div key={dateKey} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {dayName}, {day} {month} {year}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {uploads.length} yükleme, toplam {uploads.reduce((sum, u) => sum + u.data.length, 0)} araç
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {uploads.reduce((sum, u) => sum + (u.warningCount || 0), 0)} uyarı
                  </div>
                </div>
                <div className="divide-y">
                  {uploads.map((upload) => (
                    <div 
                      key={upload.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedUpload(selectedUpload?.id === upload.id ? null : upload)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {formatDate(upload.uploadDate).time}
                            </span>
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              {upload.fileName}
                              {selectedUpload?.id === upload.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </p>
                          </div>
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              <span className="text-sm text-gray-600">
                                {upload.data.length} araç
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                              <span className="text-sm text-green-600">
                                {upload.updatedVehicles} güncelleme
                              </span>
                            </div>
                            {upload.warningCount > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                <span className="text-sm text-orange-600">
                                  {upload.warningCount} uyarı
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(upload.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Kaydı Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {selectedUpload?.id === upload.id && (
                        <div className="mt-4 border-t pt-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600">Kayıt No</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600">Cihaz Numarası</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600">Plaka</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600">Sürücü</th>
                                  <th className="px-4 py-2 text-right font-medium text-gray-600">İlk Mesafe</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600">İlk Mesafe Tarihi</th>
                                  <th className="px-4 py-2 text-right font-medium text-gray-600">Son Mesafe</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-600">Son Mesafe Tarihi</th>
                                  <th className="px-4 py-2 text-right font-medium text-gray-600">Toplam Mesafe</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {upload.data && upload.data.map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-900">{item.kayitNo}</td>
                                    <td className="px-4 py-2 text-gray-900">{item.cihazNo}</td>
                                    <td className="px-4 py-2 text-gray-900 font-medium">{item.plaka}</td>
                                    <td className="px-4 py-2 text-gray-900">{item.surucu}</td>
                                    <td className="px-4 py-2 text-right text-gray-900">
                                      {typeof item.ilkMesafe === 'number' 
                                        ? item.ilkMesafe.toLocaleString('tr-TR')
                                        : item.ilkMesafe}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900">{item.ilkMesafeTarih}</td>
                                    <td className="px-4 py-2 text-right text-gray-900">
                                      {typeof item.sonMesafe === 'number'
                                        ? item.sonMesafe.toLocaleString('tr-TR')
                                        : item.sonMesafe}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900">{item.sonMesafeTarih}</td>
                                    <td className="px-4 py-2 text-right text-gray-900 font-medium">
                                      {typeof item.toplamMesafe === 'number'
                                        ? `${item.toplamMesafe.toLocaleString('tr-TR')} km`
                                        : item.toplamMesafe}
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
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Önemli Notlar:</h2>
        <ul className="list-disc list-inside text-gray-600">
          <li>Excel dosyanızda tüm gerekli sütunlar bulunmalıdır</li>
          <li>Sistem, araçların mevcut kilometresinden düşük değerleri dikkate almaz</li>
          <li>Son bakımdan itibaren 39.000 km'yi geçen araçlar için uyarı verilir</li>
          <li>Tüm yükleme geçmişi ve veriler otomatik olarak kaydedilir</li>
        </ul>
      </div>
    </div>
  );
}; 