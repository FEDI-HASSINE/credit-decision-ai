import React, { useState } from 'react';
import Login from './components/Login';
import ClientApplicationForm from './components/client/ApplicationForm';
import ClientApplicationStatus from './components/client/ApplicationStatus';
import BankerDashboard from './components/banker/Dashboard';
import CaseDetail from './components/banker/CaseDetail';
import SimilarCases from './components/banker/SimilarCases';

type User = {
  role: 'client' | 'banker';
  email: string;
  name: string;
};

type Route = 'login' | 'client-apply' | 'client-status' | 'banker-dashboard' | 'case-detail' | 'similar-cases';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route>('login');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleLogin = (email: string, password: string, role: 'client' | 'banker') => {
    // Mock authentication
    setUser({
      role,
      email,
      name: role === 'client' ? 'John Doe' : 'Sarah Johnson'
    });
    
    if (role === 'client') {
      setCurrentRoute('client-status');
    } else {
      setCurrentRoute('banker-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoute('login');
    setSelectedCaseId(null);
  };

  const navigate = (route: Route, caseId?: string) => {
    setCurrentRoute(route);
    if (caseId) setSelectedCaseId(caseId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentRoute === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      
      {currentRoute === 'client-apply' && user?.role === 'client' && (
        <ClientApplicationForm 
          user={user} 
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      
      {currentRoute === 'client-status' && user?.role === 'client' && (
        <ClientApplicationStatus 
          user={user} 
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      
      {currentRoute === 'banker-dashboard' && user?.role === 'banker' && (
        <BankerDashboard 
          user={user} 
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      
      {currentRoute === 'case-detail' && user?.role === 'banker' && selectedCaseId && (
        <CaseDetail 
          user={user} 
          caseId={selectedCaseId}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      
      {currentRoute === 'similar-cases' && user?.role === 'banker' && selectedCaseId && (
        <SimilarCases 
          user={user} 
          caseId={selectedCaseId}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
