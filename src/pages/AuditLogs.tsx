import React, { useState, useEffect } from 'react';
import { auditLogService } from '../services/auditLogService';
import { AuditLog, ActionType } from '../types/AuditLog';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const allLogs = auditLogService.getLogs();
    setLogs(allLogs);
    setFilteredLogs(allLogs);
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    if (userFilter) {
      filtered = filtered.filter(log => 
        log.username.toLowerCase().includes(userFilter.toLowerCase()) ||
        log.userFullName.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    if (actionFilter) {
      filtered = filtered.filter(log => log.actionType === actionFilter);
    }

    if (startDate) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(endDate + 'T23:59:59')
      );
    }

    setFilteredLogs(filtered);
  }, [logs, userFilter, actionFilter, startDate, endDate]);

  const getActionTypeLabel = (actionType: ActionType): string => {
    const labels: Record<ActionType, string> = {
      login: 'Giriş',
      logout: 'Çıkış',
      create_vehicle: 'Araç Oluşturma',
      update_vehicle: 'Araç Güncelleme',
      delete_vehicle: 'Araç Silme',
      create_tire: 'Lastik Oluşturma',
      update_tire: 'Lastik Güncelleme',
      delete_tire: 'Lastik Silme',
      assign_tire: 'Lastik Atama',
      remove_tire: 'Lastik Çıkarma',
      create_maintenance: 'Bakım Oluşturma',
      update_maintenance: 'Bakım Güncelleme',
      delete_maintenance: 'Bakım Silme',
      create_user: 'Kullanıcı Oluşturma',
      update_user: 'Kullanıcı Güncelleme',
      delete_user: 'Kullanıcı Silme',
      upload_excel: 'Excel Yükleme'
    };
    return labels[actionType];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Denetim Kayıtları</h1>

      {/* Filtreler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Kullanıcı Ara
          </label>
          <input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
            placeholder="Kullanıcı adı veya tam adı"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            İşlem Tipi
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActionType)}
            className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
          >
            <option value="">Tümü</option>
            {Object.entries(getActionTypeLabel).map(([key]) => (
              <option key={key} value={key}>
                {getActionTypeLabel(key as ActionType)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Kayıtlar Tablosu */}
      <div className="bg-[#1C2128] rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#2D333B]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tarih/Saat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                İşlem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Detaylar
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#1C2128] divide-y divide-gray-700">
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {format(new Date(log.timestamp), 'dd MMMM yyyy HH:mm:ss', { locale: tr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {log.userFullName}
                  <br />
                  <span className="text-gray-500">{log.username}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {getActionTypeLabel(log.actionType)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {log.details.description}
                  {log.details.entityId && (
                    <span className="text-gray-500">
                      <br />ID: {log.details.entityId}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 