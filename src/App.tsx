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

const MainLayout: React.FC = () => {
  const { currentRoute, activeExam, loadingUser } = useApp();

  // If in an active exam session, show focused exam layout without standard nav distractions
  const isExamMode = !!activeExam && currentRoute.startsWith('/exam/') && !currentRoute.includes('/results') && !currentRoute.includes('/review');

  const renderActiveView = () => {
    if (loadingUser) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin" />
          <p className="text-xs text-[#A8969C]">Loading EXAMAI platform...</p>
        </div>
      );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#0f172a] text-[#F8FAFC] flex relative overflow-hidden">
      {/* Frosted Glass Ambient Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-[#FF6A00]/12 rounded-full blur-[150px]" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Desktop Sidebar (hidden during exam) */}
      {!isExamMode && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
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
