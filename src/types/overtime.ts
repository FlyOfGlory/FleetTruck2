export interface Overtime {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface OvertimeFormData {
  employeeId: string;
  date: string;
  hours: number;
  description?: string;
} 