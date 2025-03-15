import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Araç Takip Sistemi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/vehicles"
          className="bg-[#1C2128] hover:bg-[#2D333B] rounded-lg p-6 flex items-center space-x-4"
        >
          <div className="bg-blue-500 rounded-lg p-3">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Araçlar</h2>
            <p className="text-sm text-gray-400">Araç listesi ve detayları</p>
          </div>
        </Link>
      </div>
    </div>
  );
}; 