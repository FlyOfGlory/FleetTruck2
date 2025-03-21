import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Truck, 
  Disc, 
  Wrench, 
  Activity, 
  Clock, 
  Car,
  Upload,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  title: string;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ title, onThemeToggle, isDarkMode }) => {
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
    { name: 'Puantaj', href: '/attendance', icon: Clock },
    { name: 'Fazla Mesai', href: '/overtime', icon: Clock },
    { name: 'Yol Parası', href: '/travel-allowance', icon: Car },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#0d1117] border-r border-gray-800">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 bg-[#161b22] border-b border-gray-800">
          <h1 className="text-lg font-semibold text-white text-center">{title}</h1>
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-[#21262d] text-gray-400 hover:text-white"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto bg-[#0d1117]">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-[#21262d] text-white'
                    : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-[#21262d] text-white'
                    : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
                }`
              }
            >
              <ClipboardList className="w-5 h-5 mr-3" />
              Denetim Kayıtları
            </NavLink>
          )}
        </nav>
      </div>
    </div>
  );
};