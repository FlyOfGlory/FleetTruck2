import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { VehicleEdit } from './pages/VehicleEdit';
import { Tires } from './pages/Tires';
import { Maintenance } from './pages/Maintenance';
import { Inspections } from './pages/Inspections';
import { Reports } from './pages/Reports';
import { Calendar } from './pages/Calendar';
import { Users } from './pages/Users';
import { Login } from './pages/Login';
import { User } from './types/User';
import { Layout } from './components/layout/Layout';
import { Coating } from './pages/Coating';
import { External } from './pages/External';
import { Repair } from './pages/Repair';
import { Scrap } from './pages/Scrap';
import { Sold } from './pages/Sold';
import { VehicleNew } from './pages/VehicleNew';
import { ExcelUpload } from "./pages/ExcelUpload";
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { VehicleTires } from './pages/VehicleTires';
import { AuditLogs } from './pages/AuditLogs';
import { auditLogService } from './services/auditLogService';
import { VehicleList } from './components/VehicleList';
import { VehicleForm } from './components/VehicleForm';
import { FrequentTireChanges } from './pages/FrequentTireChanges';
import Attendance from './pages/Attendance';
import TravelAllowance from './pages/TravelAllowance';
import OvertimePage from './pages/OvertimePage';

const CURRENT_USER_KEY = 'fleet-management-current-user';
const USERS_STORAGE_KEY = 'fleet-management-users';

// Önceden tanımlı kullanıcılar
const predefinedUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    fullName: 'Sistem Yöneticisi',
    role: 'admin',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '2',
    username: 'user1',
    password: 'user123',
    fullName: 'Ahmet Yılmaz',
    role: 'user',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '3',
    username: 'user2',
    password: 'user123',
    fullName: 'Mehmet Demir',
    role: 'user',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '4',
    username: 'user3',
    password: 'user123',
    fullName: 'Ayşe Kaya',
    role: 'user',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '5',
    username: 'user4',
    password: 'user123',
    fullName: 'Fatma Şahin',
    role: 'user',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '6',
    username: 'manager1',
    password: 'manager123',
    fullName: 'Ali Yıldız',
    role: 'admin',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '7',
    username: 'user5',
    password: 'user123',
    fullName: 'Zeynep Çelik',
    role: 'user',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '8',
    username: 'user6',
    password: 'user123',
    fullName: 'Mustafa Aydın',
    role: 'user',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '9',
    username: 'manager2',
    password: 'manager123',
    fullName: 'Hatice Özkan',
    role: 'admin',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
  {
    id: '10',
    username: 'user7',
    password: 'user123',
    fullName: 'İbrahim Koç',
    role: 'user',
    createdAt: new Date().toLocaleDateString('tr-TR'),
  },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Kullanıcıları sadece ilk kez yükle
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!savedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(predefinedUsers));
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]') as User[];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      // Denetim kaydı oluştur
      auditLogService.createLog(user, 'login', {
        description: `${user.fullName} sisteme giriş yaptı.`
      });

      return true;
    }
    return false;
  };

  const handleLogout = () => {
    if (currentUser) {
      // Denetim kaydı oluştur
      auditLogService.createLog(currentUser, 'logout', {
        description: `${currentUser.fullName} sistemden çıkış yaptı.`
      });
    }

    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  if (!currentUser) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <Login onLogin={handleLogin} />
        </AuthProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout currentUser={currentUser} onLogout={handleLogout}>
            <div className={`min-h-screen ${darkMode ? 'dark bg-[#0d1117]' : 'bg-gray-100'}`}>
              <div className="flex">
                <Sidebar title="Cihan Beton Araç Takip Sistemi V.0.1" onThemeToggle={toggleTheme} isDarkMode={darkMode} />
                <div className="flex-1 overflow-auto">
                  <Header currentUser={currentUser} onLogout={handleLogout} />
                  <div className="ml-64 pt-16 p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="vehicles" element={<Vehicles />} />
                      <Route path="vehicles/new" element={<VehicleNew />} />
                      <Route path="vehicles/:id" element={<VehicleEdit />} />
                      <Route path="vehicles/:id/tires" element={<VehicleTires />} />
                      <Route path="tires" element={<Tires />} />
                      <Route path="maintenance" element={<Maintenance />} />
                      <Route path="inspections" element={<Inspections />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="coating" element={<Coating />} />
                      <Route path="external" element={<External />} />
                      <Route path="repair" element={<Repair />} />
                      <Route path="scrap" element={<Scrap />} />
                      <Route path="sold" element={<Sold />} />
                      <Route path="overtime" element={<OvertimePage />} />
                      <Route 
                        path="users" 
                        element={
                          currentUser.role === 'admin' 
                            ? <Users /> 
                            : <Navigate to="/" replace />
                        } 
                      />
                      <Route 
                        path="excel-upload" 
                        element={
                          currentUser.role === 'admin' 
                            ? <ExcelUpload /> 
                            : <Navigate to="/" replace />
                        } 
                      />
                      <Route 
                        path="audit-logs" 
                        element={
                          currentUser.role === 'admin' 
                            ? <AuditLogs /> 
                            : <Navigate to="/" replace />
                        } 
                      />
                      <Route path="/vehicles" element={<VehicleList />} />
                      <Route path="/vehicles/new" element={<VehicleForm />} />
                      <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
                      <Route path="/frequent-tire-changes" element={<FrequentTireChanges />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/travel-allowance" element={<TravelAllowance />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </div>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;