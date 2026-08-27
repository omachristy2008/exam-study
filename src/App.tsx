import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, BottomNav } from './components/common/Sidebar';
import { Header, ToastContainer } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { PracticeHubView } from './components/practice/PracticeHubView';
import { PastQuestionsLibraryView } from './components/pastQuestions/PastQuestionsLibraryView';
import { AIGeneratorView } from './components/ai/AIGeneratorView';
import { AITutorView } from './components/ai/AITutorView';
import { AIStudyCoachView } from './components/ai/AIStudyCoachView';
import { ExamEngineView } from './components/exam/ExamEngineView';
import { ExamResultsView } from './components/exam/ExamResultsView';
import { QuestionReviewView } from './components/exam/QuestionReviewView';
import { ProgressView } from './components/progress/ProgressView';
import { AchievementsView } from './components/progress/AchievementsView';
import { UploadQuestionView } from './components/upload/UploadQuestionView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { OnboardingView } from './components/auth/OnboardingView';

const MainLayout: React.FC = () => {
  const { currentRoute, activeExam, loadingUser, user } = useApp();

  // Full-page focused modes without standard header/sidebar
  const isAuthRoute = currentRoute === '/login' || currentRoute === '/register' || currentRoute === '/onboarding';
  const isExamMode = !!activeExam && currentRoute.startsWith('/exam/') && !currentRoute.includes('/results') && !currentRoute.includes('/review');

  const renderActiveView = () => {
    if (loadingUser) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin" />
          <p className="text-xs text-[#A1A1AA]">Loading EXAMAI academic platform...</p>
        </div>
      );
    }

    // Dedicated Auth & Onboarding Routes
    if (currentRoute === '/login') {
      return <LoginView />;
    }
    if (currentRoute === '/register') {
      return <RegisterView />;
    }
    if (currentRoute === '/onboarding') {
      return <OnboardingView />;
    }

    // Protected Route check: If user not logged in, show login page
    if (!user) {
      return <LoginView />;
    }

    if (currentRoute === '/dashboard' || currentRoute === '/') {
      return <DashboardView />;
    }
    if (currentRoute.startsWith('/practice')) {
      return <PracticeHubView />;
    }
    if (currentRoute.startsWith('/past-questions')) {
      return <PastQuestionsLibraryView />;
    }
    if (currentRoute.startsWith('/ai-generator')) {
      return <AIGeneratorView />;
    }
    if (currentRoute.startsWith('/ai-tutor')) {
      return <AITutorView />;
    }
    if (currentRoute.startsWith('/study-coach')) {
      return <AIStudyCoachView />;
    }
    if (currentRoute.includes('/results')) {
      return <ExamResultsView />;
    }
    if (currentRoute.includes('/review')) {
      return <QuestionReviewView />;
    }
    if (currentRoute.startsWith('/exam/')) {
      return <ExamEngineView />;
    }
    if (currentRoute.startsWith('/progress')) {
      return <ProgressView />;
    }
    if (currentRoute.startsWith('/achievements')) {
      return <AchievementsView />;
    }
    if (currentRoute.startsWith('/upload-question')) {
      return <UploadQuestionView />;
    }
    if (currentRoute.startsWith('/profile')) {
      return <ProfileView />;
    }
    if (currentRoute.startsWith('/settings')) {
      return <SettingsView />;
    }
    if (currentRoute.startsWith('/admin')) {
      return <AdminDashboardView />;
    }

    return <DashboardView />;
  };

  if (isAuthRoute || (!user && !loadingUser)) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F5]">
        {renderActiveView()}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F5] flex relative">
      {/* Desktop Sidebar (hidden during exam) */}
      {!isExamMode && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {!isExamMode && <Header />}

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${isExamMode ? 'pt-6' : ''}`}>
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Navigation (hidden during exam) */}
        {!isExamMode && <BottomNav />}
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
