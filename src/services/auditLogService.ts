import { AuditLog, ActionType } from '../types/AuditLog';
import { User } from '../types/User';

const AUDIT_LOGS_STORAGE_KEY = 'fleet-management-audit-logs';

export const auditLogService = {
  createLog: (
    user: User,
    actionType: ActionType,
    details: {
      entityId?: string;
      entityType?: string;
      description: string;
      oldValue?: any;
      newValue?: any;
    }
  ): void => {
    const logs = getLogs();
    
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.username,
      userFullName: user.fullName,
      actionType,
      details,
      userAgent: navigator.userAgent,
    };

    logs.unshift(newLog); // Yeni logu başa ekle
    
    // Son 1000 logu tut
    const trimmedLogs = logs.slice(0, 1000);
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(trimmedLogs));
  },

  getLogs: (): AuditLog[] => {
    return getLogs();
  },

  getLogsByUser: (userId: string): AuditLog[] => {
    const logs = getLogs();
    return logs.filter(log => log.userId === userId);
  },

  getLogsByAction: (actionType: ActionType): AuditLog[] => {
    const logs = getLogs();
    return logs.filter(log => log.actionType === actionType);
  },

  getLogsByDateRange: (startDate: Date, endDate: Date): AuditLog[] => {
    const logs = getLogs();
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  },

  clearLogs: (): void => {
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Yardımcı fonksiyon
function getLogs(): AuditLog[] {
  const savedLogs = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
  return savedLogs ? JSON.parse(savedLogs) : [];
} 