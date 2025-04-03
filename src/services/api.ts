import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fazla mesai verilerini localStorage'da saklayacağız
const OVERTIME_STORAGE_KEY = 'fleet-management-overtime';

// Fazla mesai verilerini localStorage'dan al
const getOvertimeData = () => {
  const data = localStorage.getItem(OVERTIME_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Fazla mesai verilerini localStorage'a kaydet
const saveOvertimeData = (data: any[]) => {
  localStorage.setItem(OVERTIME_STORAGE_KEY, JSON.stringify(data));
};

// API isteklerini localStorage ile simüle et
api.interceptors.request.use(async (config) => {
  if (config.url?.startsWith('/overtime')) {
    const method = config.method?.toLowerCase();
    const data = getOvertimeData();
    
    switch (method) {
      case 'get':
        if (config.url === '/overtime') {
          return Promise.resolve({ data });
        }
        if (config.url.startsWith('/overtime/employee/')) {
          const employeeId = config.url.split('/').pop();
          const filteredData = data.filter((item: any) => item.employeeId === employeeId);
          return Promise.resolve({ data: filteredData });
        }
        const id = config.url.split('/').pop();
        const item = data.find((item: any) => item.id === id);
        return Promise.resolve({ data: item });
        
      case 'post':
        const newItem = {
          ...config.data,
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.push(newItem);
        saveOvertimeData(data);
        return Promise.resolve({ data: newItem });
        
      case 'put':
        const updateId = config.url.split('/').pop();
        const updatedData = data.map((item: any) => 
          item.id === updateId 
            ? { ...item, ...config.data, updatedAt: new Date().toISOString() }
            : item
        );
        saveOvertimeData(updatedData);
        const updatedItem = updatedData.find((item: any) => item.id === updateId);
        return Promise.resolve({ data: updatedItem });
        
      case 'delete':
        const deleteId = config.url.split('/').pop();
        const filteredData = data.filter((item: any) => item.id !== deleteId);
        saveOvertimeData(filteredData);
        return Promise.resolve({ data: null });
    }
  }
  return config;
}); 