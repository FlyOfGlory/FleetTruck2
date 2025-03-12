import React from 'react';
import { Truck, Wrench, Disc, Fuel } from 'lucide-react';
import { DashboardSummary } from '../../types/Dashboard';

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Vehicles',
      value: summary.totalVehicles.total,
      subtitle: `${summary.totalVehicles.active} active, ${summary.totalVehicles.inactive} inactive`,
      change: summary.totalVehicles.changePercentage,
      icon: <Truck className="w-6 h-6 text-blue-500" />,
    },
    {
      title: 'Maintenance Due',
      value: summary.maintenanceDue.count,
      subtitle: `Scheduled in next ${summary.maintenanceDue.daysAhead} days`,
      change: summary.maintenanceDue.changePercentage,
      icon: <Wrench className="w-6 h-6 text-orange-500" />,
    },
    {
      title: 'Tires to Replace',
      value: summary.tiresToReplace.count,
      subtitle: `Below ${summary.tiresToReplace.wearCondition}% wear condition`,
      change: summary.tiresToReplace.changePercentage,
      icon: <Disc className="w-6 h-6 text-red-500" />,
    },
    {
      title: 'Fuel Expenses',
      value: `$${summary.fuelExpenses.amount.toLocaleString()}`,
      subtitle: summary.fuelExpenses.period,
      change: summary.fuelExpenses.changePercentage,
      icon: <Fuel className="w-6 h-6 text-green-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {card.subtitle}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-full p-3">
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`inline-flex items-center text-sm ${
                card.change >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}% from last month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}; 