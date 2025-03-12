import React from 'react';
import { Truck, Users, Wrench, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Toplam Araç',
      value: '24',
      icon: <Truck className="h-6 w-6 text-blue-500" />,
      change: '+2 son 30 günde',
      changeType: 'increase'
    },
    {
      title: 'Aktif Kullanıcılar',
      value: '12',
      icon: <Users className="h-6 w-6 text-green-500" />,
      change: '+3 son 30 günde',
      changeType: 'increase'
    },
    {
      title: 'Bekleyen Bakımlar',
      value: '5',
      icon: <Wrench className="h-6 w-6 text-yellow-500" />,
      change: '-2 son 30 günde',
      changeType: 'decrease'
    },
    {
      title: 'Toplam Rapor',
      value: '45',
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      change: '+12 son 30 günde',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#2D333B] rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
              <div className="bg-[#1C2128] rounded-lg p-3">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm ${
                stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 