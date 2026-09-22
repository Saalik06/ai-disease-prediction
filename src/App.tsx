import React, { useEffect, useState } from 'react';
import { Footer } from './components/Footer.js';
import { Navbar } from './components/Navbar.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { DiseaseInfoPage } from './pages/DiseaseInfoPage.js';
import { FindCarePage } from './pages/FindCarePage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { MLEvaluationPage } from './pages/MLEvaluationPage.js';
import { PredictionResultPage } from './pages/PredictionResultPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { SymptomCheckerPage } from './pages/SymptomCheckerPage.js';
import { api } from './services/api.js';
import { PredictionResponse, User } from './types/index.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePrediction, setActivePrediction] = useState<PredictionResponse | null>(null);
  const [pageParams, setPageParams] = useState<any>(null);
  const [loadingInitialUser, setLoadingInitialUser] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.warn('No active session token found.');
      } finally {
        setLoadingInitialUser(false);
      }
    }
    restoreSession();
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      handleNavigate('admin');
    } else {
      handleNavigate('dashboard');
    }
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    handleNavigate('dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handlePredictionComplete = (result: PredictionResponse) => {
    setActivePrediction(result);
    handleNavigate('result');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage currentUser={currentUser} onNavigate={handleNavigate} />;

      case 'checker':
        return (
          <SymptomCheckerPage
            onPredictionComplete={handlePredictionComplete}
            onNavigate={handleNavigate}
          />
        );

      case 'result':
        if (!activePrediction) {
          return (
            <SymptomCheckerPage
              onPredictionComplete={handlePredictionComplete}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <PredictionResultPage
            prediction={activePrediction}
            onNewPrediction={() => handleNavigate('checker')}
            onNavigate={handleNavigate}
          />
        );

      case 'dashboard':
        if (!currentUser) {
          return (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DashboardPage
            user={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );

      case 'history':
        return (
          <HistoryPage
            user={currentUser}
            openId={pageParams?.openId}
            onNavigate={handleNavigate}
          />
        );

      case 'diseases':
        return <DiseaseInfoPage onNavigate={handleNavigate} />;

      case 'ml-evaluation':
        return <MLEvaluationPage />;

      case 'find-care':
        return <FindCarePage />;

      case 'profile':
        if (!currentUser) {
          return (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <ProfilePage
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
          />
        );

      case 'admin':
        if (!currentUser || currentUser.role !== 'admin') {
          return (
            <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
              <p className="text-xs text-slate-500">
                You must be logged into an administrator account (e.g. admin@healthai.org) to view this console.
              </p>
              <button
                onClick={() => handleNavigate('login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          );
        }
        return (
          <AdminDashboardPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'login':
        return (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onNavigate={handleNavigate}
          />
        );

      default:
        return <HomePage currentUser={currentUser} onNavigate={handleNavigate} />;
    }
  };

  if (loadingInitialUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Initializing AI Disease Prediction System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full">
        {renderContent()}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
