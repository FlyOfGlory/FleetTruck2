import React, { useState, useEffect } from 'react';
import { User } from '../types/User';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('fleet-management-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const handleDeleteUser = (username: string) => {
    const updatedUsers = users.filter(user => user.username !== username);
    setUsers(updatedUsers);
    localStorage.setItem('fleet-management-users', JSON.stringify(updatedUsers));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Kullanıcı Yönetimi</h2>
      <div className="bg-[#2D333B] rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1C2128]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Kullanıcı Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ad Soyad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Kayıt Tarihi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#2D333B] divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.username}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => handleDeleteUser(user.username)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 