import React, { useState, useEffect } from 'react';
import { Overtime, OvertimeFormData } from '../types/overtime';
import { overtimeService } from '../services/overtimeService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Employee {
  id: string;
  name: string;
  position: string;
  facility: string;
}

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

const OvertimePage: React.FC = () => {
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const [formData, setFormData] = useState<OvertimeFormData>({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: 0,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>(FACILITIES[0]);

  useEffect(() => {
    loadOvertimes();
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    // Örnek personel verileri
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
  };

  const loadOvertimes = async () => {
    try {
      setLoading(true);
      const data = await overtimeService.getAll();
      setOvertimes(data);
    } catch (error) {
      console.error('Fazla mesai verileri yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
      if (!selectedEmployee) {
        alert('Lütfen bir personel seçin');
        return;
      }

      const newOvertime: Overtime = {
        id: Date.now().toString(),
        employeeId: formData.employeeId,
        date: formData.date,
        hours: formData.hours,
        description: formData.description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await overtimeService.create(newOvertime);
      setFormData({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: 0,
        description: ''
      });
      loadOvertimes();
    } catch (error) {
      console.error('Fazla mesai kaydedilirken hata oluştu:', error);
      alert('Fazla mesai kaydedilirken bir hata oluştu');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' ? Number(value) : value
    }));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : employeeId;
  };

  const filteredEmployees = employees.filter(emp => emp.facility === selectedFacility);
  const filteredOvertimes = overtimes.filter(overtime => {
    const employee = employees.find(emp => emp.id === overtime.employeeId);
    return employee?.facility === selectedFacility;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Fazla Mesai Yönetimi</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Tesis
        </label>
        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="w-full md:w-auto p-2 border border-gray-700 rounded-md bg-[#0d1117] text-white"
        >
          {FACILITIES.map((facility) => (
            <option key={facility} value={facility}>
              {facility}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#161b22] p-6 rounded-lg shadow-md mb-8 border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Personel
            </label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-700 rounded-md bg-[#0d1117] text-white"
              required
            >
              <option value="">Personel Seçin</option>
              {filteredEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tarih
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-700 rounded-md bg-[#0d1117] text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fazla Mesai Saati
            </label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-700 rounded-md bg-[#0d1117] text-white"
              min="0"
              step="0.5"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-700 rounded-md bg-[#0d1117] text-white"
              rows={3}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Kaydet
        </button>
      </form>

      <div className="bg-[#161b22] rounded-lg shadow-md overflow-hidden border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#0d1117]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Personel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Saat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#161b22] divide-y divide-gray-800">
            {filteredOvertimes.map((overtime) => (
              <tr key={overtime.id} className="hover:bg-[#21262d]">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {getEmployeeName(overtime.employeeId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {format(new Date(overtime.date), 'dd MMMM yyyy', { locale: tr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {overtime.hours} saat
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    overtime.status === 'approved' ? 'bg-green-900 text-green-200' :
                    overtime.status === 'rejected' ? 'bg-red-900 text-red-200' :
                    'bg-yellow-900 text-yellow-200'
                  }`}>
                    {overtime.status === 'approved' ? 'Onaylandı' :
                     overtime.status === 'rejected' ? 'Reddedildi' :
                     'Beklemede'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {overtime.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OvertimePage; 