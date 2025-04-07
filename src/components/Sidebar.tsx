import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Truck, Disc, Wrench, Activity, Clock, Car } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  title: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ title }) => {
  const { isAdmin } = useAuth();

  const navigation = [
    { name: 'Araçlar', href: '/vehicles', icon: Truck },
    { name: 'Lastikler', href: '/tires', icon: Disc },
    { name: 'Bakımlar', href: '/maintenance', icon: Wrench },
    { name: 'Sık Lastik Değişimi', href: '/frequent-tire-changes', icon: Activity },
    { name: 'Puantaj', href: '/attendance', icon: Clock },
    { name: 'Fazla Mesai', href: '/overtime', icon: Clock },
    { name: 'Yol Parası', href: '/travel-allowance', icon: Car },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#1C2128] border-r border-gray-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 bg-[#2D333B] border-b border-gray-700">
          <h1 className="text-lg font-semibold text-white text-center">{title}</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-[#2D333B] text-white'
                    : 'text-gray-300 hover:bg-[#2D333B] hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
          <Link to="/overtime" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <Clock className="w-5 h-5 mr-2" />
            Fazla Mesai
          </Link>
          <Link to="/daily-mileage" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Günlük Kilometre
          </Link>
        </nav>
      </div>
    </div>
  );
}; 