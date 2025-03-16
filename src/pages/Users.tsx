import React, { useState, useEffect } from 'react';
import { User } from '../types/User';
import { useAuth } from '../contexts/AuthContext';
import { auditLogService } from '../services/auditLogService';
import { AuditLog } from '../types/AuditLog';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp } from 'lucide-react';

const USERS_STORAGE_KEY = 'fleet-management-users';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userLogs, setUserLogs] = useState<Record<string, AuditLog[]>>({});
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'user'
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      
      // Her kullanıcı için son değişiklikleri yükle
      const allLogs = auditLogService.getLogs();
      const logsByUser = parsedUsers.reduce((acc: Record<string, AuditLog[]>, user: User) => {
        acc[user.id] = allLogs
          .filter(log => log.userId === user.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5); // Son 5 değişiklik
        return acc;
      }, {});
      
      setUserLogs(logsByUser);
    }
  }, []);

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      toast.error('Tüm alanları doldurunuz.');
      return;
    }

    const userExists = users.some(user => user.username === newUser.username);
    if (userExists) {
      toast.error('Bu kullanıcı adı zaten kullanılıyor.');
      return;
    }

    const user: User = {
      id: crypto.randomUUID(),
      username: newUser.username,
      password: newUser.password,
      fullName: newUser.fullName,
      role: newUser.role as 'admin' | 'user',
      createdAt: new Date().toLocaleDateString('tr-TR')
    };

    const updatedUsers = [...users, user];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Denetim kaydı oluştur
    if (currentUser) {
      auditLogService.createLog(currentUser, 'create_user', {
        entityId: user.id,
        entityType: 'user',
        description: `${user.fullName} (${user.username}) kullanıcısı oluşturuldu.`,
        newValue: {
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      });
    }

    setShowAddModal(false);
    setNewUser({ username: '', password: '', fullName: '', role: 'user' });
    toast.success('Kullanıcı başarıyla eklendi.');
  };

  const handleUpdateUser = () => {
    if (!selectedUser || !selectedUser.username || !selectedUser.fullName) {
      toast.error('Tüm alanları doldurunuz.');
      return;
    }

    const userExists = users.some(
      user => user.username === selectedUser.username && user.id !== selectedUser.id
    );
    if (userExists) {
      toast.error('Bu kullanıcı adı zaten kullanılıyor.');
      return;
    }

    const oldUser = users.find(u => u.id === selectedUser.id);
    const updatedUsers = users.map(user =>
      user.id === selectedUser.id ? selectedUser : user
    );

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Denetim kaydı oluştur
    if (currentUser && oldUser) {
      auditLogService.createLog(currentUser, 'update_user', {
        entityId: selectedUser.id,
        entityType: 'user',
        description: `${selectedUser.fullName} (${selectedUser.username}) kullanıcısı güncellendi.`,
        oldValue: {
          username: oldUser.username,
          fullName: oldUser.fullName,
          role: oldUser.role
        },
        newValue: {
          username: selectedUser.username,
          fullName: selectedUser.fullName,
          role: selectedUser.role
        }
      });
    }

    setShowEditModal(false);
    setSelectedUser(null);
    toast.success('Kullanıcı başarıyla güncellendi.');
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`${user.fullName} kullanıcısını silmek istediğinize emin misiniz?`)) {
      const updatedUsers = users.filter(u => u.id !== user.id);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      // Denetim kaydı oluştur
      if (currentUser) {
        auditLogService.createLog(currentUser, 'delete_user', {
          entityId: user.id,
          entityType: 'user',
          description: `${user.fullName} (${user.username}) kullanıcısı silindi.`,
          oldValue: {
            username: user.username,
            fullName: user.fullName,
            role: user.role
          }
        });
      }

      toast.success('Kullanıcı başarıyla silindi.');
    }
  };

  const getActionLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
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
      upload_excel: 'Excel Yükleme',
      login: 'Giriş',
      logout: 'Çıkış'
    };
    return labels[actionType] || actionType;
  };

  const toggleUserLogs = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Yeni Kullanıcı Ekle
        </button>
      </div>

      <div className="bg-[#1C2128] rounded-lg overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#2D333B]">
            <tr>
              <th className="w-8 px-6 py-3"></th>
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
                Oluşturulma Tarihi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#1C2128] divide-y divide-gray-700">
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <tr>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserLogs(user.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedUser === user.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
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
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
                {expandedUser === user.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-[#22272E]">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">
                          Son İşlemler
                        </h4>
                        {userLogs[user.id]?.length > 0 ? (
                          userLogs[user.id].map((log) => (
                            <div
                              key={log.id}
                              className="flex items-start space-x-4 text-sm text-gray-400 border-l-2 border-gray-700 pl-4"
                            >
                              <div className="w-32 flex-shrink-0">
                                {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm', {
                                  locale: tr
                                })}
                              </div>
                              <div className="flex-1">
                                <span className="text-gray-300">{getActionLabel(log.actionType)}</span>
                                <br />
                                <span className="text-gray-500">{log.details.description}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">Henüz işlem kaydı bulunmuyor.</div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Yeni Kullanıcı Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Yeni Kullanıcı Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUser({ username: '', password: '', fullName: '', role: 'user' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı Düzenleme Modalı */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1C2128] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Kullanıcı Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={selectedUser.username}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={selectedUser.fullName}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value as 'admin' | 'user'
                    })
                  }
                  className="w-full px-3 py-2 bg-[#2D333B] border border-gray-700 rounded-lg text-white"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 