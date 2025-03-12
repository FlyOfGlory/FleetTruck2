import React from 'react';
import { CostPerKm } from '../../types/Dashboard';

interface CostTableProps {
  costs: CostPerKm[];
}

export const CostTable: React.FC<CostTableProps> = ({ costs }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Cost per Kilometer (Last 3 Months)
        </h3>
        <div className="mt-4">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Vehicle
                </th>
                <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {costs.map((item) => (
                <tr key={item.licensePlate}>
                  <td className="py-4 text-sm text-gray-900 dark:text-white">
                    {item.vehicle} ({item.licensePlate})
                  </td>
                  <td className="py-4 text-right text-sm text-gray-900 dark:text-white">
                    ${item.cost.toFixed(2)}/km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 