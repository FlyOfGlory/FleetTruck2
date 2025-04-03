import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/User';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('fleet-management-current-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('fleet-management-users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  useEffect(() => {
    // Kullanıcıları sadece ilk kez yükle
    const savedUsers = localStorage.getItem('fleet-management-users');
    if (!savedUsers) {
      const predefinedUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          fullName: 'Sistem Yöneticisi',
          role: 'admin',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '2',
          username: 'user1',
          password: 'user123',
          fullName: 'Ahmet Yılmaz',
          role: 'user',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '3',
          username: 'user2',
          password: 'user123',
          fullName: 'Mehmet Demir',
          role: 'user',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '4',
          username: 'user3',
          password: 'user123',
          fullName: 'Ayşe Kaya',
          role: 'user',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '5',
          username: 'user4',
          password: 'user123',
          fullName: 'Fatma Şahin',
          role: 'user',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '6',
          username: 'manager1',
          password: 'manager123',
          fullName: 'Ali Yıldız',
          role: 'admin',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '7',
          username: 'user5',
          password: 'user123',
          fullName: 'Zeynep Çelik',
          role: 'user',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '8',
          username: 'user6',
          password: 'user123',
          fullName: 'Mustafa Aydın',
          role: 'user',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '9',
          username: 'manager2',
          password: 'manager123',
          fullName: 'Hatice Özkan',
          role: 'admin',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        {
          id: '10',
          username: 'user7',
          password: 'user123',
          fullName: 'İbrahim Koç',
          role: 'user',
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
      ];
      localStorage.setItem('fleet-management-users', JSON.stringify(predefinedUsers));
      setUsers(predefinedUsers);
    }
  }, []);

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('fleet-management-current-user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fleet-management-current-user');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 