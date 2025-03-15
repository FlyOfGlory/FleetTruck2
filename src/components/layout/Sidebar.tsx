import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Tool,
  ClipboardCheck,
  FileBarChart,
  Calendar as CalendarIcon,
  Users,
  FileUp,
  Brush,
  ExternalLink,
  Wrench,
  Trash,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
  const { currentUser } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#1C2128] text-gray-400 p-4 pt-16">
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/vehicles"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <Truck className="w-5 h-5" />
          <span>Araçlar</span>
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <Tool className="w-5 h-5" />
          <span>Bakım</span>
        </NavLink>

        <NavLink
          to="/inspections"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>Muayene</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <FileBarChart className="w-5 h-5" />
          <span>Raporlar</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Takvim</span>
        </NavLink>

        <NavLink
          to="/coating"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <Brush className="w-5 h-5" />
          <span>Kaplama</span>
        </NavLink>

        <NavLink
          to="/external"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <ExternalLink className="w-5 h-5" />
          <span>Dış Servis</span>
        </NavLink>

        <NavLink
          to="/repair"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <Wrench className="w-5 h-5" />
          <span>Tamir</span>
        </NavLink>

        <NavLink
          to="/scrap"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <Trash className="w-5 h-5" />
          <span>Hurda</span>
        </NavLink>

        <NavLink
          to="/sold"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
              isActive ? 'bg-[#2D333B] text-white' : ''
            }`
          }
        >
          <DollarSign className="w-5 h-5" />
          <span>Satılan</span>
        </NavLink>

        {currentUser?.role === 'admin' && (
          <>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
                  isActive ? 'bg-[#2D333B] text-white' : ''
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>Kullanıcılar</span>
            </NavLink>

            <NavLink
              to="/excel-upload"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg hover:bg-[#2D333B] hover:text-white ${
                  isActive ? 'bg-[#2D333B] text-white' : ''
                }`
              }
            >
              <FileUp className="w-5 h-5" />
              <span>Excel Yükle</span>
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
};