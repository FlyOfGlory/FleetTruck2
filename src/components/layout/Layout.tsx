import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { User } from '../../types/User';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#22272E]">
      <Sidebar />
      <div className="ml-64">
        <Header currentUser={currentUser} onLogout={onLogout} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}; 