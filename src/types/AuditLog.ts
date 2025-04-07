export type ActionType = 
  | 'login'
  | 'logout'
  | 'create_vehicle'
  | 'update_vehicle'
  | 'delete_vehicle'
  | 'create_tire'
  | 'update_tire'
  | 'delete_tire'
  | 'assign_tire'
  | 'remove_tire'
  | 'create_maintenance'
  | 'update_maintenance'
  | 'delete_maintenance'
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'upload_excel'
  | 'delete_excel'
  | 'revert_vehicle_mileage'
  | 'reset_all_vehicles';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userFullName: string;
  actionType: ActionType;
  details: {
    entityId?: string;
    entityType?: string;
    description: string;
    oldValue?: any;
    newValue?: any;
  };
  ipAddress?: string;
  userAgent?: string;
} 