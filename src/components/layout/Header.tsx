import React from 'react';
import { User } from '../../types/User';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-0 left-64 right-0 h-16 bg-[#1C2128] border-b border-[#2D333B] flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-lg font-medium text-white">Cihan Beton Araç Takip</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-300">
          {currentUser.fullName} ({currentUser.role === 'admin' ? 'Yönetici' : 'Kullanıcı'})
        </span>
        <button
          onClick={toggleTheme}
          className="text-gray-300 hover:text-white transition-colors"
          title="Tema Değiştir"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={onLogout}
          className="text-gray-300 hover:text-white transition-colors"
          title="Çıkış Yap"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};