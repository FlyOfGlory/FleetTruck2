import React, { useState, useEffect } from 'react';
import { Truck, Wrench, FileText, Calendar, Upload, Plus, ArrowLeft, Edit2, Trash2, Bell, Edit, PenSquare } from 'lucide-react';
import { Vehicle, VehicleFormData, Tire, MaintenanceRecord, MaintenanceType, TireLocation } from '../types/Vehicle';
import { VehicleForm } from '../components/vehicles/VehicleForm';
import { VehicleImport } from '../components/vehicles/VehicleImport';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, Link } from 'react-router-dom';

const VEHICLES_STORAGE_KEY = 'fleet-management-vehicles';

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [plateFilter, setPlateFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showVehicleDetail, setShowVehicleDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('lastikler');
  const [loading, setLoading] = useState(true);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState<MaintenanceRecord | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [technicalInspectionDate, setTechnicalInspectionDate] = useState('');
  const [showTireAssignModal, setShowTireAssignModal] = useState(false);
  const [availableTires, setAvailableTires] = useState<Tire[]>([]);
  const [selectedTireId, setSelectedTireId] = useState('');
  const [tirePosition, setTirePosition] = useState('');
  const [installationMileage, setInstallationMileage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadVehicles = () => {
      try {
        const savedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
        if (savedVehicles) {
          setVehicles(JSON.parse(savedVehicles));
        } else {
          // Örnek veriler
          const initialVehicles: Vehicle[] = [
            { 
              id: '1', 
              plate: 'ABC 1234',
              brand: 'Volvo',
              model: 'FH16', 
              type: 'Çekici',
              year: 2020,
              mileage: 0,
              chassisNumber: 'YV2RT40A8LB123456',
              lastMaintenance: '2023-10-15',
              nextMaintenance: '2024-04-15',
              lastInspection: '2023-06-15',
              nextInspection: '2024-06-15',
              technicalInspectionDate: '2024-06-15',
              status: 'Aktif',
              tires: [],
              maintenanceHistory: []
            },
            { 
              id: '2', 
              plate: 'DEF 5678',
              brand: 'Mercedes',
              model: 'Actros', 
              type: 'Çekici',
              year: 2021,
              mileage: 0,
              chassisNumber: 'WDB96340310123456',
              lastMaintenance: '2023-11-01',
              nextMaintenance: '2024-05-01',
              lastInspection: '2023-07-01',
              nextInspection: '2024-07-01',
              technicalInspectionDate: '2024-07-01',
              status: 'Yetkili Servis' as Vehicle['status'],
              tires: [],
              maintenanceHistory: []
            },
            { 
              id: '3', 
              plate: 'GHI 9012',
              brand: 'Scania',
              model: 'R750', 
              type: 'Çekici',
              year: 2022,
              mileage: 0,
              chassisNumber: 'YS2R4X20002123456',
              lastMaintenance: '2023-11-20',
              nextMaintenance: '2024-05-20',
              lastInspection: '2023-08-20',
              nextInspection: '2024-08-20',
              technicalInspectionDate: '2024-08-20',
              status: 'Aktif',
              tires: [],
              maintenanceHistory: []
            },
          ];
          setVehicles(initialVehicles);
          localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(initialVehicles));
        }
      } catch (err) {
        setError('Araçlar yüklenirken bir hata oluştu');
        console.error('Hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  useEffect(() => {
    const loadTires = () => {
      const savedTires = localStorage.getItem('fleet-management-tires');
      if (savedTires) {
        const tires: Tire[] = JSON.parse(savedTires);
        // Sadece depodaki lastikleri filtrele
        const storageTires = tires.filter(tire => tire.location === 'Depo');
        setAvailableTires(storageTires);
      }
    };
    loadTires();
  }, []);

  // Bakım tarihlerini kontrol eden fonksiyon
  const checkMaintenanceDates = () => {
    const today = new Date();
    const newNotifications: string[] = [];

    vehicles.forEach(vehicle => {
      const nextMaintenance = new Date(vehicle.nextMaintenance);
      const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Bakım tarihi yaklaşanlar için bildirimler
      if (daysUntilMaintenance <= 30 && daysUntilMaintenance > 15) {
        newNotifications.push(`${vehicle.plate} plakalı aracın bakımına ${daysUntilMaintenance} gün kaldı.`);
      } else if (daysUntilMaintenance <= 15 && daysUntilMaintenance > 7) {
        newNotifications.push(`⚠️ ${vehicle.plate} plakalı aracın bakımına ${daysUntilMaintenance} gün kaldı!`);
      } else if (daysUntilMaintenance <= 7 && daysUntilMaintenance > 0) {
        newNotifications.push(`🚨 ACİL: ${vehicle.plate} plakalı aracın bakımına sadece ${daysUntilMaintenance} gün kaldı!`);
      } else if (daysUntilMaintenance <= 0) {
        newNotifications.push(`❌ ${vehicle.plate} plakalı aracın bakım tarihi ${Math.abs(daysUntilMaintenance)} gün geçti!`);
      }

      // Kilometre kontrolü
      if (vehicle.mileage && vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0) {
        const lastMaintenance = vehicle.maintenanceHistory[vehicle.maintenanceHistory.length - 1];
        const kmUntilMaintenance = lastMaintenance.nextMaintenanceMileage - vehicle.mileage;
        
        if (kmUntilMaintenance <= 1000 && kmUntilMaintenance > 0) {
          newNotifications.push(`⚠️ ${vehicle.plate} plakalı araç bakım kilometresine ${kmUntilMaintenance} km kaldı!`);
        } else if (kmUntilMaintenance <= 0) {
          newNotifications.push(`❌ ${vehicle.plate} plakalı araç bakım kilometresini ${Math.abs(kmUntilMaintenance)} km geçti!`);
        }
      }
    });

    setNotifications(newNotifications);
  };

  // Bildirim kontrolü için interval
  useEffect(() => {
    checkMaintenanceDates();
    const interval = setInterval(checkMaintenanceDates, 1000 * 60 * 60); // Her saat kontrol et
    return () => clearInterval(interval);
  }, [vehicles]);

  const handleAddVehicle = (data: VehicleFormData) => {
    // Plaka kontrolü
    const plateExists = vehicles.some(vehicle => 
      vehicle.plate.toLowerCase() === data.plate.toLowerCase()
    );

    if (plateExists) {
      setError(`${data.plate} plakalı araç zaten sistemde kayıtlı!`);
      return;
    }

    const today = new Date();
    const nextMaintenanceDate = new Date(today);
    nextMaintenanceDate.setMonth(today.getMonth() + 6);

    const nextInspectionDate = new Date(today);
    nextInspectionDate.setFullYear(today.getFullYear() + 1);

    const newVehicle: Vehicle = {
      id: uuidv4(),
      ...data,
      brand: data.model.split(' ')[0],
      model: data.model.split(' ').slice(1).join(' '),
      year: parseInt(data.year),
      mileage: 0,
      lastMaintenance: today.toISOString().split('T')[0],
      nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0],
      lastInspection: today.toISOString().split('T')[0],
      nextInspection: nextInspectionDate.toISOString().split('T')[0],
      technicalInspectionDate: nextInspectionDate.toISOString().split('T')[0],
      status: 'Aktif',
      tires: [],
      maintenanceHistory: []
    };
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    setShowForm(false);
    setError(null);
  };

  const handleImportVehicles = (importedVehicles: Vehicle[]) => {
    const updatedVehicles = [...vehicles, ...importedVehicles];
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    setShowImport(false);
  };

  const handleDeleteVehicle = (id: string) => {
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
      setVehicles(updatedVehicles);
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    }
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    console.log('Araç güncelleniyor:', updatedVehicle);
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    );
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
    setSelectedVehicle(null);
    console.log('Araç güncellendi');
  };

  const handleAddTire = (vehicleId: string, tire: Tire) => {
    const newTire: Tire = {
      ...tire,
      size: '315/80R22.5',
      installationMileage: 0
    };
    
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === vehicleId) {
        return {
          ...vehicle,
          tires: [...(vehicle.tires || []), newTire]
        };
      }
      return vehicle;
    });
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
  };

  const handleUpdateTire = (vehicleId: string, updatedTire: Tire) => {
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === vehicleId) {
        return {
          ...vehicle,
          tires: vehicle.tires.map(tire => 
            tire.id === updatedTire.id ? updatedTire : tire
          )
        };
      }
      return vehicle;
    });
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
  };

  const handleDeleteTire = (vehicleId: string, tireId: string) => {
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === vehicleId) {
        return {
          ...vehicle,
          tires: vehicle.tires.filter(tire => tire.id !== tireId)
        };
      }
      return vehicle;
    });
    setVehicles(updatedVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(updatedVehicles));
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle && vehicle.plate ? vehicle.plate.toLowerCase().includes(plateFilter.toLowerCase()) : false
  );

  const stats = [
    {
      title: 'Toplam Araç',
      value: vehicles.length.toString(),
      icon: <Truck className="h-6 w-6 text-blue-500" />,
      description: `${vehicles.filter(v => v.status === 'Aktif').length} aktif, ${vehicles.filter(v => v.status === 'Kademe').length} kademede, ${vehicles.filter(v => v.status === 'Yetkili Servis').length} serviste`,
      changeType: 'increase',
      change: '+1 son ayda'
    },
    {
      title: 'Bakım Bekleyen',
      value: '4',
      icon: <Wrench className="h-6 w-6 text-yellow-500" />,
      description: 'Gelecek 7 gün içinde',
      changeType: 'increase',
      change: '+2 son ayda'
    },
    {
      title: 'Muayene Bekleyen',
      value: '2',
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      description: 'Bu ay içinde',
      changeType: 'decrease',
      change: '-1 son ayda'
    },
    {
      title: 'Planlı Görev',
      value: '8',
      icon: <Calendar className="h-6 w-6 text-green-500" />,
      description: 'Aktif görevler',
      changeType: 'increase',
      change: '+3 son ayda'
    }
  ];

  // Bakım kaydı eklendiğinde otomatik tarih ayarlama
  const handleAddMaintenance = () => {
    if (newMaintenance && selectedVehicle) {
      const maintenanceDate = new Date(newMaintenance.date);
      const nextMaintenanceDate = new Date(maintenanceDate);
      nextMaintenanceDate.setMonth(maintenanceDate.getMonth() + 6);

      const updatedMaintenance = {
        ...newMaintenance,
        nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
        nextMaintenanceMileage: (newMaintenance.mileage || 0) + 20000,
        type: 'Periyodik Bakım' as MaintenanceType,
        description: 'Periyodik Bakım',
        cost: 0
      };

      const updatedVehicle = {
        ...selectedVehicle,
        maintenanceHistory: [...(selectedVehicle.maintenanceHistory || []), updatedMaintenance],
        lastMaintenance: newMaintenance.date,
        nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0]
      };

      handleUpdateVehicle(updatedVehicle);
      setShowMaintenanceForm(false);
      setNewMaintenance(null);
    }
  };

  const handleMaintenanceUpdate = () => {
    if (selectedVehicle) {
      const nextMaintenanceDate = new Date(maintenanceDate);
      nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);

      const updatedVehicle = {
        ...selectedVehicle,
        lastMaintenance: maintenanceDate,
        nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0],
        technicalInspectionDate: technicalInspectionDate
      };

      handleUpdateVehicle(updatedVehicle);
      setShowMaintenanceModal(false);
    }
  };

  // Bildirim butonu ve paneli için JSX
  const notificationButton = (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="text-gray-400 hover:text-white relative"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-96 bg-[#2D333B] rounded-lg shadow-lg z-50 border border-gray-700">
          <div className="p-4">
            <h3 className="text-white font-medium mb-2">Bakım Bildirimleri</h3>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="p-2 bg-[#1C2128] rounded text-sm text-gray-300">
                  {notification}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Lastik atama işlemi
  const handleTireAssignment = () => {
    if (!selectedVehicle || !selectedTireId) return;

    const tire = availableTires.find(t => t.id === selectedTireId);
    if (!tire) return;

    // Lastiği güncelle
    const updatedTire: Tire = {
      ...tire,
      location: 'Takılı',
      position: tirePosition,
      installationDate: new Date().toISOString().split('T')[0],
      installationMileage: installationMileage
    };

    // Aracı güncelle
    const updatedVehicle = {
      ...selectedVehicle,
      tires: [...selectedVehicle.tires, updatedTire]
    };

    // Lastik veritabanını güncelle
    const savedTires = localStorage.getItem('fleet-management-tires');
    if (savedTires) {
      const tires: Tire[] = JSON.parse(savedTires);
      const updatedTires = tires.map(t => t.id === selectedTireId ? updatedTire : t);
      localStorage.setItem('fleet-management-tires', JSON.stringify(updatedTires));
      setAvailableTires(updatedTires.filter(t => t.location === 'Depo'));
    }

    // Araç veritabanını güncelle
    handleUpdateVehicle(updatedVehicle);
    setShowTireAssignModal(false);
    setSelectedTireId('');
    setTirePosition('');
    setInstallationMileage(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-white">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-900 text-red-300 rounded-lg">
            {error}
          </div>
        )}
        <VehicleForm onSubmit={handleAddVehicle} onCancel={() => {
          setShowForm(false);
          setError(null);
        }} />
      </div>
    );
  }

  if (showImport) {
    return <VehicleImport onImport={handleImportVehicles} onCancel={() => setShowImport(false)} />;
  }

  if (showVehicleDetail && selectedVehicle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setShowVehicleDetail(false);
                setSelectedVehicle(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-semibold text-white">
              {selectedVehicle.plate} - Lastik Yönetimi
            </h2>
          </div>
        </div>

        <div className="bg-[#1C2128] rounded-lg mb-6">
          <div className="border-b border-gray-700">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('bakim-gecmisi')}
                className="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 border-blue-500 text-blue-500"
              >
                Bakım Geçmişi
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'bakim-gecmisi' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Bakım Geçmişi</h3>
              <button
                onClick={() => {
                  const defaultMaintenance: MaintenanceRecord = {
                    id: uuidv4(),
                    date: new Date().toISOString().split('T')[0],
                    type: 'Periyodik Bakım' as MaintenanceType,
                    mileage: selectedVehicle.mileage,
                    description: '',
                    cost: 0,
                    location: '',
                    technician: '',
                    parts: [],
                    nextMaintenanceMileage: selectedVehicle.mileage + 20000,
                    nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
                  };
                  setShowMaintenanceForm(true);
                  setNewMaintenance(defaultMaintenance);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Yeni Bakım Kaydı
              </button>
            </div>

            {showMaintenanceForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#2D333B] rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-semibold text-white mb-4">Periyodik Bakım Kaydı</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                      <input
                        type="date"
                        value={newMaintenance?.date || ''}
                        onChange={(e) => {
                          if (newMaintenance) {
                            const nextDate = new Date(e.target.value);
                            nextDate.setMonth(nextDate.getMonth() + 6);
                            setNewMaintenance({
                              ...newMaintenance,
                              date: e.target.value,
                              nextMaintenanceDate: nextDate.toISOString().split('T')[0],
                              type: 'Periyodik Bakım' as MaintenanceType
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Kilometre</label>
                      <input
                        type="number"
                        value={newMaintenance?.mileage || 0}
                        onChange={(e) => {
                          if (newMaintenance) {
                            const mileage = parseInt(e.target.value);
                            setNewMaintenance({
                              ...newMaintenance,
                              mileage: mileage,
                              nextMaintenanceMileage: mileage + 20000,
                              type: 'Periyodik Bakım' as MaintenanceType,
                              description: 'Periyodik Bakım',
                              cost: 0
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Sonraki Bakım Tarihi (Opsiyonel)</label>
                        <span className="text-xs text-gray-400">Varsayılan: 6 ay sonra</span>
                      </div>
                      <input
                        type="date"
                        value={newMaintenance?.nextMaintenanceDate || ''}
                        onChange={(e) => {
                          if (newMaintenance) {
                            setNewMaintenance({
                              ...newMaintenance,
                              nextMaintenanceDate: e.target.value
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => {
                          setShowMaintenanceForm(false);
                          setNewMaintenance(null);
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleAddMaintenance}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#1C2128] rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">KM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sonraki Bakım</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {(selectedVehicle.maintenanceHistory || [])
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(record.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {record.mileage ? record.mileage.toLocaleString() : '0'} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {record.nextMaintenanceMileage.toLocaleString()} km / {new Date(record.nextMaintenanceDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <button
                            onClick={() => {
                              const updatedVehicle = {
                                ...selectedVehicle,
                                maintenanceHistory: selectedVehicle.maintenanceHistory.filter(r => r.id !== record.id)
                              };
                              handleUpdateVehicle(updatedVehicle);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-medium text-white mb-4">Bakım İstatistikleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1C2128] rounded-lg p-6">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Ortalama Bakım Aralığı</h5>
                  <p className="text-2xl font-semibold text-white">
                    {(() => {
                      const history = selectedVehicle.maintenanceHistory || [];
                      if (history.length < 2) return "Yetersiz Veri";
                      const intervals = history
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .reduce((acc, curr, idx, arr) => {
                          if (idx === 0) return acc;
                          const diff = curr.mileage - arr[idx - 1].mileage;
                          return [...acc, Math.abs(diff)];
                        }, [] as number[]);
                      const average = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
                      return `${Math.round(average).toLocaleString()} km`;
                    })()}
                  </p>
                </div>
                <div className="bg-[#1C2128] rounded-lg p-6">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Son Bakımdan Bu Yana</h5>
                  <p className="text-2xl font-semibold text-white">
                    {(() => {
                      const lastMaintenance = [...(selectedVehicle.maintenanceHistory || [])].sort((a, b) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      )[0];
                      if (!lastMaintenance) return "Bakım Kaydı Yok";
                      const kmSince = selectedVehicle.mileage - lastMaintenance.mileage;
                      return `${kmSince.toLocaleString()} km`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Araçlar</h1>
        <div className="flex items-center space-x-4">
          {notificationButton}
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Araç
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Excel'den Yükle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#2D333B] rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
              <div className="bg-[#1C2128] rounded-lg p-3">
                {stat.icon}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-400">{stat.description}</p>
            </div>
            <div className="mt-4">
              <span className={`text-sm ${
                stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#2D333B] rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1C2128]">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Araç Listesi</h3>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Plaka ile filtrele..."
                value={plateFilter}
                onChange={(e) => setPlateFilter(e.target.value)}
                className="px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1C2128]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Plaka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tip
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Yıl
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Şasi No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Son Bakım
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Fenni Muayene
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#2D333B] divide-y divide-gray-700">
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => {
                      navigate(`/vehicles/${vehicle.id}/tires`);
                    }}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {vehicle.plate}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.chassisNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {vehicle.lastMaintenance}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(vehicle.lastInspection).toLocaleDateString('tr-TR')} - {new Date(vehicle.nextInspection).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Mevcut durum:', vehicle.status);
                      
                      // Basit döngüsel durum değişimi
                      const newStatus: Vehicle['status'] = vehicle.status === 'Aktif' 
                        ? 'Kademe' 
                        : vehicle.status === 'Kademe'
                        ? 'Yetkili Servis'
                        : 'Aktif';
                      
                      console.log('Yeni durum:', newStatus);
                      
                      const updatedVehicle = {
                        ...vehicle,
                        status: newStatus
                      };
                      handleUpdateVehicle(updatedVehicle);
                    }}
                    className={`w-28 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer ${
                      vehicle.status === 'Aktif' 
                        ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                        : vehicle.status === 'Kademe'
                        ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                        : 'bg-red-900 text-red-300 hover:bg-red-800'
                    }`}
                  >
                    {vehicle.status}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowVehicleDetail(true);
                        setActiveTab('bakim-gecmisi');
                      }}
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <Wrench className="w-5 h-5 mr-1" />
                      Bakım Geçmişi
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setMaintenanceDate(vehicle.lastMaintenance || '');
                        setTechnicalInspectionDate(vehicle.technicalInspectionDate || '');
                        setShowMaintenanceModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 relative group"
                    >
                      <Calendar className="w-5 h-5" />
                      <PenSquare className="w-3 h-3 absolute -top-1 -right-1 text-blue-400 group-hover:text-blue-300" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedVehicle && !showVehicleDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2D333B] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Araç Düzenle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Plaka</label>
                <div className="text-white">{selectedVehicle.plate}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                <div className="text-white">{selectedVehicle.model}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tip</label>
                <div className="text-white">{selectedVehicle.type}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Yıl</label>
                <div className="text-white">{selectedVehicle.year}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Şasi No</label>
                <div className="text-white">{selectedVehicle.chassisNumber}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Son Bakım Tarihi</label>
                <input
                  type="date"
                  value={selectedVehicle.lastMaintenance}
                  onChange={(e) => {
                    const nextMaintenanceDate = new Date(e.target.value);
                    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);
                    
                    setSelectedVehicle({
                      ...selectedVehicle,
                      lastMaintenance: e.target.value,
                      nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0]
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sonraki Bakım Tarihi</label>
                <div className="text-white">
                  {new Date(selectedVehicle.nextMaintenance).toLocaleDateString('tr-TR')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Son Fenni Muayene Tarihi</label>
                <input
                  type="date"
                  value={selectedVehicle.lastInspection}
                  onChange={(e) => {
                    const nextInspectionDate = new Date(e.target.value);
                    nextInspectionDate.setFullYear(nextInspectionDate.getFullYear() + 1);
                    
                    setSelectedVehicle({
                      ...selectedVehicle,
                      lastInspection: e.target.value,
                      nextInspection: nextInspectionDate.toISOString().split('T')[0]
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sonraki Fenni Muayene Tarihi</label>
                <div className="text-white">
                  {new Date(selectedVehicle.nextInspection).toLocaleDateString('tr-TR')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
                <select
                  value={selectedVehicle.status}
                  onChange={(e) => setSelectedVehicle({
                    ...selectedVehicle,
                    status: e.target.value as Vehicle['status']
                  })}
                  className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded-lg text-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Kademe">Kademe</option>
                  <option value="Yetkili Servis">Yetkili Servis</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                İptal
              </button>
              <button
                onClick={() => handleUpdateVehicle(selectedVehicle)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bakım Tarihi Düzenleme Modalı */}
      {showMaintenanceModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Bakım Tarihlerini Güncelle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Son Bakım Tarihi</label>
                <input
                  type="date"
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fenni Muayene Tarihi</label>
                <input
                  type="date"
                  value={technicalInspectionDate}
                  onChange={(e) => setTechnicalInspectionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleMaintenanceUpdate}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lastik Atama Modalı */}
      {showTireAssignModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              {selectedVehicle.plate} - Lastik Ata
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
    </div>
  );
}; 