import React, { useState, useEffect } from 'react';
import { Car, Plus } from 'lucide-react';

interface TravelAllowanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  facility: string;
  date: string;
  amount: number;
  distance: number;
  reason: string;
}

interface Employee {
  id: string;
  name: string;
  facility: string;
  position: string;
}

const TravelAllowance: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [travelRecords, setTravelRecords] = useState<TravelAllowanceRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('İZMİR YOLU');

  const FACILITIES = [
    'İZMİR YOLU',
    'PANAYIR',
    'İNEGÖL',
    'PAMUKOVA',
    'TEKNOSAB',
    'TOKİ',
    'YENİ KADEME',
    'HAMZABEY (İNEGÖL) OSB',
    'GÜRSU TOKİ',
    'DEMİRTAŞ (AVDANCIK)',
    'MEKECE-1',
    'MEKECE-2',
    'KAYAPA',
    'İNEGÖL CİHANTAŞ'
  ];

  // Örnek veri
  useEffect(() => {
    const mockEmployees: Employee[] = [
      { id: '1', name: 'Ahmet Yılmaz', facility: 'İZMİR YOLU', position: 'Operatör' },
      { id: '2', name: 'Mehmet Demir', facility: 'İZMİR YOLU', position: 'Teknisyen' },
      { id: '3', name: 'Ali Kaya', facility: 'PANAYIR', position: 'Şoför' }
    ];
    setEmployees(mockEmployees);

    const mockRecords: TravelAllowanceRecord[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Ahmet Yılmaz',
        facility: 'İZMİR YOLU',
        date: '2024-03-01',
        amount: 100,
        distance: 50,
        reason: 'Şantiye ziyareti'
      }
    ];
    setTravelRecords(mockRecords);
  }, []);

  const handleAddTravel = () => {
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;

    const newRecord: TravelAllowanceRecord = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: employee.name,
      facility: selectedFacility,
      date: selectedDate,
      amount: parseFloat(amount),
      distance: parseFloat(distance),
      reason
    };

    setTravelRecords([...travelRecords, newRecord]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedDate('');
    setAmount('');
    setDistance('');
    setReason('');
  };

  const filteredRecords = travelRecords.filter(record => record.facility === selectedFacility);

  return (
    <div className="p-0" style={{ transform: 'translateX(-200px)' }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Yol Parası Takibi</h1>
        <div className="flex items-center space-x-2">
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="px-3 py-1.5 bg-[#1C2128] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
          >
            {FACILITIES.map((facility) => (
              <option key={facility} value={facility}>
                {facility}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-[#1C2128] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Yol Parası Ekle
          </button>
        </div>
      </div>

      <div className="bg-[#2D333B] rounded-lg shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1C2128]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Personel Adı
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Mesafe (km)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tutar (₺)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Sebep
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#2D333B] divide-y divide-gray-700">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="text-sm">
                <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                  {record.employeeName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                  {new Date(record.date).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                  {record.distance}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                  {record.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                  {record.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2D333B] rounded w-[550px] h-auto">
            <div className="flex justify-between items-center px-2 py-1.5 border-b border-gray-700">
              <h2 className="text-xs font-medium text-white">Yol Parası Ekle</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="p-2">
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <div className="mb-1.5">
                    <label className="block text-[11px] font-medium text-gray-400">Personel</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="mt-0.5 w-full h-6 px-1.5 bg-[#1C2128] border border-gray-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Seçiniz</option>
                      {employees
                        .filter(emp => emp.facility === selectedFacility)
                        .map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-1.5">
                    <label className="block text-[11px] font-medium text-gray-400">Tarih</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-0.5 w-full h-6 px-1.5 bg-[#1C2128] border border-gray-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400">Mesafe (km)</label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      min="0"
                      step="0.1"
                      className="mt-0.5 w-full h-6 px-1.5 bg-[#1C2128] border border-gray-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5">
                    <label className="block text-[11px] font-medium text-gray-400">Tutar (₺)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="mt-0.5 w-full h-6 px-1.5 bg-[#1C2128] border border-gray-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400">Sebep</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-0.5 w-full h-[52px] px-1.5 py-1 bg-[#1C2128] border border-gray-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      placeholder="Yol parası sebebini giriniz..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-1.5 px-2 py-1.5 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-2 h-5 text-[11px] text-gray-300 hover:text-white bg-[#1C2128] rounded hover:bg-[#21262d]"
              >
                İptal
              </button>
              <button
                onClick={handleAddTravel}
                className="px-2 h-5 text-[11px] bg-green-500 text-white rounded hover:bg-green-600"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelAllowance; 