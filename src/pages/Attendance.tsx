import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Users, Calendar } from 'lucide-react';

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

interface Employee {
  id: string;
  name: string;
  position: string;
  facility: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  date: string;
  status: 'X' | 'İ' | 'R' | 'B' | 'FM' | 'G' | 'GG';
  notes: string;
  lateTime?: string;
}

const Attendance: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [position, setPosition] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<string>(FACILITIES[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'X' | 'İ' | 'R' | 'B' | 'FM' | 'G'>('X');
  const [lateTime, setLateTime] = useState<string>('09:00');
  const [showLateTimeModal, setShowLateTimeModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{employeeId: string, date: string} | null>(null);

  // Örnek veri
  useEffect(() => {
    const mockEmployees: Employee[] = [
      { id: '1', name: 'Ahmet Yılmaz', position: 'Depo Elemanı', facility: 'İZMİR YOLU' },
      { id: '2', name: 'Mehmet Demir', position: 'Operatör', facility: 'İZMİR YOLU' },
      { id: '3', name: 'Ali Kaya', position: 'Şoför', facility: 'İZMİR YOLU' },
      { id: '4', name: 'Ayşe Yıldız', position: 'Muhasebe', facility: 'PANAYIR' },
      { id: '5', name: 'Fatma Şahin', position: 'Operatör', facility: 'PANAYIR' },
      { id: '6', name: 'Mustafa Öztürk', position: 'Şoför', facility: 'PANAYIR' },
      { id: '7', name: 'Zeynep Çelik', position: 'Depo Elemanı', facility: 'İNEGÖL' },
      { id: '8', name: 'Hüseyin Arslan', position: 'Operatör', facility: 'İNEGÖL' },
      { id: '9', name: 'İbrahim Yılmaz', position: 'Şoför', facility: 'PAMUKOVA' },
      { id: '10', name: 'Emine Kara', position: 'Muhasebe', facility: 'PAMUKOVA' },
      { id: '11', name: 'Osman Şahin', position: 'Operatör', facility: 'TEKNOSAB' },
      { id: '12', name: 'Hatice Demir', position: 'Şoför', facility: 'TEKNOSAB' }
    ];
    setEmployees(mockEmployees);

    const mockRecords: AttendanceRecord[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Ahmet Yılmaz',
        position: 'Depo Elemanı',
        date: '2024-03-01',
        status: 'X',
        notes: ''
      },
      {
        id: '2',
        employeeId: '1',
        employeeName: 'Ahmet Yılmaz',
        position: 'Depo Elemanı',
        date: '2024-03-04',
        status: 'İ',
        notes: 'Yıllık izin'
      }
    ];
    setAttendanceRecords(mockRecords);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonthName = (date: string) => {
    const [year, month] = date.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  };

  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: employeeName,
      position,
      facility: selectedFacility
    };

    setEmployees([...employees, newEmployee]);
    setShowEmployeeModal(false);
    setEmployeeName('');
    setPosition('');
  };

  const handleUpdateAttendance = (employeeId: string, date: string, status: 'X' | 'İ' | 'R' | 'B' | 'FM' | 'G') => {
    if (status === 'G') {
      setSelectedRecord({ employeeId, date });
      setShowLateTimeModal(true);
      return;
    }

    const existingRecord = attendanceRecords.find(
      record => record.employeeId === employeeId && record.date === date
    );

    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId,
      employeeName: employee.name,
      position: employee.position,
      date,
      status,
      notes: ''
    };

    if (existingRecord) {
      setAttendanceRecords(attendanceRecords.map(record =>
        record.id === existingRecord.id
          ? newRecord
          : record
      ));
    } else {
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
  };

  const handleLateTimeSubmit = () => {
    if (selectedRecord) {
      const existingRecord = attendanceRecords.find(
        record => record.employeeId === selectedRecord.employeeId && record.date === selectedRecord.date
      );

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: selectedRecord.employeeId,
        employeeName: employees.find(emp => emp.id === selectedRecord.employeeId)?.name || '',
        position: employees.find(emp => emp.id === selectedRecord.employeeId)?.position || '',
        date: selectedRecord.date,
        status: 'G',
        notes: `Geç geliş: ${lateTime}`,
        lateTime
      };

      if (existingRecord) {
        setAttendanceRecords(attendanceRecords.map(record =>
          record.id === existingRecord.id
            ? newRecord
            : record
        ));
      } else {
        setAttendanceRecords([...attendanceRecords, newRecord]);
      }
    }
    setShowLateTimeModal(false);
    setSelectedRecord(null);
  };

  const getEmployeeStats = (employeeId: string) => {
    const employeeRecords = attendanceRecords.filter(record => record.employeeId === employeeId);
    const totalDays = employeeRecords.length;
    const izinliGun = employeeRecords.filter(record => record.status === 'İ').length;
    const raporluGun = employeeRecords.filter(record => record.status === 'R').length;
    const fazlaMesai = employeeRecords.filter(record => record.status === 'FM').length * 2; // Örnek olarak her FM 2 saat

    return {
      totalDays,
      izinliGun,
      raporluGun,
      fazlaMesai
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'X':
        return 'bg-green-900 text-green-300';
      case 'İ':
        return 'bg-blue-900 text-blue-300';
      case 'R':
        return 'bg-red-900 text-red-300';
      case 'FM':
        return 'bg-yellow-900 text-yellow-300';
      case 'G':
        return 'bg-orange-900 text-orange-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <div className="p-0" style={{ transform: 'translateX(-200px)' }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Aylık Puantaj Cetveli</h1>
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
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'X' | 'İ' | 'R' | 'B' | 'FM' | 'G')}
            className="px-3 py-1.5 bg-[#1C2128] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="X">Çalıştı</option>
            <option value="İ">İzinli</option>
            <option value="R">Raporlu</option>
            <option value="B">Boş</option>
            <option value="FM">Fazla Mesai</option>
            <option value="G">Geç Geldi</option>
          </select>
          <button
            onClick={() => setShowEmployeeModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center text-sm"
          >
            <Users className="w-4 h-4 mr-1" />
            Personel Ekle
          </button>
        </div>
      </div>

      <div className="bg-[#2D333B] rounded-lg shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1C2128]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%]">
                Personel Adı
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">
                Görev
              </th>
              {Array.from({ length: getDaysInMonth(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1) }, (_, i) => (
                <th key={i} className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[3%]">
                  {i + 1}
                </th>
              ))}
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                Toplam Gün
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                İzinli Gün
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                Raporlu Gün
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                Fazla Mesai
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#2D333B] divide-y divide-gray-700">
            {employees
              .filter(employee => employee.facility === selectedFacility)
              .map((employee) => {
                const stats = getEmployeeStats(employee.id);
                return (
                  <tr key={employee.id} className="text-xs">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                      {employee.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                      {employee.position}
                    </td>
                    {Array.from({ length: getDaysInMonth(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1) }, (_, i) => {
                      const date = `${selectedMonth}-${String(i + 1).padStart(2, '0')}`;
                      const record = attendanceRecords.find(r => r.employeeId === employee.id && r.date === date);
                      return (
                        <td key={i} className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleUpdateAttendance(employee.id, date, selectedStatus)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record?.status || 'B')}`}
                          >
                            {record?.status || 'B'}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 whitespace-nowrap text-center text-gray-300">
                      {stats.totalDays}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-gray-300">
                      {stats.izinliGun}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-gray-300">
                      {stats.raporluGun}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-gray-300">
                      {stats.fazlaMesai}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-[#2D333B] rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Kodların Anlamı:</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">X</span>
            <span className="text-gray-300">Çalıştı</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">İ</span>
            <span className="text-gray-300">İzinli</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">R</span>
            <span className="text-gray-300">Raporlu</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-900 text-gray-300">B</span>
            <span className="text-gray-300">Boş</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">FM</span>
            <span className="text-gray-300">Fazla Mesai</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-900 text-orange-300">G</span>
            <span className="text-gray-300">Geç Geldi</span>
          </div>
        </div>
      </div>

      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#2D333B] rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-white mb-4">Personel Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Görev
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tesis
                </label>
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {FACILITIES.map((facility) => (
                    <option key={facility} value={facility}>
                      {facility}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                İptal
              </button>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {showLateTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#2D333B] rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-white mb-4">Geç Geliş Saati</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Saat
                </label>
                <input
                  type="time"
                  value={lateTime}
                  onChange={(e) => setLateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C2128] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLateTimeModal(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                İptal
              </button>
              <button
                onClick={handleLateTimeSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance; 