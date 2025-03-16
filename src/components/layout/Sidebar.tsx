import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Disc,
  Wrench,
  ClipboardCheck,
  FileText,
  Calendar,
  Users,
  Activity,
  Car,
  Upload,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navigation = [
    { name: 'Araçlara Takılı', href: '/', icon: LayoutDashboard },
    { name: 'Araçlar', href: '/vehicles', icon: Car },
    { name: 'Depodaki Lastikler', href: '/tires', icon: Disc },
    { name: 'Kaplamadaki Lastikler', href: '/coating', icon: Truck },
    { name: 'Dış Ayarmadaki Lastikler', href: '/external', icon: Wrench },
    { name: 'Tamirdeki Lastikler', href: '/repair', icon: ClipboardCheck },
    { name: 'Hurdadaki Lastikler', href: '/scrap', icon: FileText },
    { name: 'Satıldaki Lastikler', href: '/sold', icon: Calendar },
    { name: 'Kullanıcılar', href: '/users', icon: Users },
    { name: 'Km Bilgisi Ekleme', href: '/excel-upload', icon: Upload },
    { name: 'Arvento Test', href: '/arvento-test', icon: Activity },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#1C2128] text-white">
      <div className="flex h-16 items-center justify-center border-b border-[#2D333B]">
        <h1 className="text-xl font-semibold">Cihan Beton Araç Takip</h1>
      </div>
      <nav className="mt-5 px-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 ${
                isActive
                  ? 'bg-[#2D333B] text-white'
                  : 'text-gray-300 hover:bg-[#2D333B] hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/audit-logs"
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 text-gray-300 hover:bg-[#2D333B] hover:text-white"
          >
            <ClipboardList className="mr-3 h-5 w-5" />
            Denetim Kayıtları
          </Link>
        )}
      </nav>
    </div>
  );
};