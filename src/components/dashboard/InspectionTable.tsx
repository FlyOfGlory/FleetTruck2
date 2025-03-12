import React from 'react';
import { UpcomingInspection } from '../../types/Dashboard';

interface InspectionTableProps {
  inspections: UpcomingInspection[];
}

export const InspectionTable: React.FC<InspectionTableProps> = ({ inspections }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Upcoming Inspections
        </h3>
        <div className="mt-4">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Vehicle
                </th>
                <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {inspections.map((item) => (
                <tr key={item.licensePlate}>
                  <td className="py-4 text-sm text-gray-900 dark:text-white">
                    {item.vehicle} ({item.licensePlate})
                  </td>
                  <td className={`py-4 text-right text-sm ${
                    new Date(item.dueDate) < new Date() 
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {item.dueDate}
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