import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="bg-white h-full w-64 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 mt-2 text-gray-600 ${
              isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`
          }
        >
          <span className="mx-4">Ana Sayfa</span>
        </NavLink>

        <NavLink
          to="/vehicles"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 mt-2 text-gray-600 ${
              isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`
          }
        >
          <span className="mx-4">Araçlar</span>
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 mt-2 text-gray-600 ${
              isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`
          }
        >
          <span className="mx-4">Bakım</span>
        </NavLink>

        <NavLink
          to="/tires"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 mt-2 text-gray-600 ${
              isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`
          }
        >
          <span className="mx-4">Lastikler</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/excel-upload"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-2 text-gray-600 ${
                isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`
            }
          >
            <span className="mx-4">Kilometre Verisi Yükle</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-2 text-gray-600 ${
                isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`
            }
          >
            <span className="mx-4">Kullanıcılar</span>
          </NavLink>
        )}
      </div>
    </div>
  );
}; 