import React from 'react';
import { SummaryCards } from './SummaryCards';
import { CostTable } from './CostTable';
import { InspectionTable } from './InspectionTable';
import { DashboardSummary, CostPerKm, UpcomingInspection } from '../../types/Dashboard';

// Örnek veriler
const dashboardData: DashboardSummary = {
  totalVehicles: {
    total: 15,
    active: 12,
    inactive: 3,
    changePercentage: 5,
  },
  maintenanceDue: {
    count: 4,
    daysAhead: 7,
    changePercentage: 15,
  },
  tiresToReplace: {
    count: 6,
    wearCondition: 40,
    changePercentage: 20,
  },
  fuelExpenses: {
    amount: 12540,
    period: 'This month',
    changePercentage: -8,
  },
};

const costData: CostPerKm[] = [
  { vehicle: 'Volvo FH16', licensePlate: 'ABC-1234', cost: 0.85 },
  { vehicle: 'Mercedes Actros', licensePlate: 'DEF-5678', cost: 0.92 },
  { vehicle: 'Scania R730', licensePlate: 'GHI-9012', cost: 0.78 },
];

const inspectionData: UpcomingInspection[] = [
  { vehicle: 'Volvo FH16', licensePlate: 'ABC-1234', dueDate: 'Nov 15, 2023' },
  { vehicle: 'Mercedes Actros', licensePlate: 'DEF-5678', dueDate: 'Dec 2, 2023' },
  { vehicle: 'Scania R730', licensePlate: 'GHI-9012', dueDate: 'Dec 18, 2023' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
      </div>

      <SummaryCards summary={dashboardData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostTable costs={costData} />
        <InspectionTable inspections={inspectionData} />
      </div>
    </div>
  );
}; 