export interface DashboardSummary {
  totalVehicles: {
    total: number;
    active: number;
    inactive: number;
    changePercentage: number;
  };
  maintenanceDue: {
    count: number;
    daysAhead: number;
    changePercentage: number;
  };
  tiresToReplace: {
    count: number;
    wearCondition: number;
    changePercentage: number;
  };
  fuelExpenses: {
    amount: number;
    period: string;
    changePercentage: number;
  };
}

export interface CostPerKm {
  vehicle: string;
  licensePlate: string;
  cost: number;
}

export interface UpcomingInspection {
  vehicle: string;
  licensePlate: string;
  dueDate: string;
} 