import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { User, ExamSession, Question, ExamResult, StudentProfile } from '../types';
import { api } from '../services/api';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  loadingUser: boolean;
  currentRoute: string;
  routeParams: Record<string, any>;
  navigate: (route: string, params?: Record<string, any>) => void;
  activeExam: ExamSession | null;
  startExamSession: (session: Omit<ExamSession, 'id' | 'status' | 'user_answers' | 'flagged_questions' | 'time_remaining_seconds'>) => void;
  updateExamAnswer: (questionId: string, optionId: string) => void;
  toggleFlagQuestion: (questionId: string) => void;
  finishExamSession: (timeUsedSeconds?: number) => Promise<ExamResult | null>;
  cancelExamSession: () => void;
  latestResult: ExamResult | null;
  setLatestResult: (res: ExamResult | null) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshUser: () => Promise<void>;
  switchRole: (role: 'student' | 'admin') => Promise<void>;
  updateAcademicProfile: (profileUpdates: Partial<StudentProfile>) => Promise<void>;
  celebrate: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  const [activeExam, setActiveExam] = useState<ExamSession | null>(null);
  const [latestResult, setLatestResult] = useState<ExamResult | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load initial user session
  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data);
    } catch (e) {
      console.error('Failed to load user:', e);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const navigate = (route: string, params: Record<string, any> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const celebrate = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6A00', '#FFA040', '#FFFFFF', '#FF3D00'],
      });
    } catch {
      // Ignore if canvas not accessible
    }
  };

  const switchRole = async (role: 'student' | 'admin') => {
    try {
      const updated = await api.switchUserRole(role);
      setUser(updated);
      showToast(`Switched to ${role === 'admin' ? 'Admin Portal' : 'Student Mode'}`, 'info');
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      showToast('Could not switch role', 'error');
    }
  };

  const updateAcademicProfile = async (profileUpdates: Partial<StudentProfile>) => {
    try {
      const resp = await api.updateProfile({ profile: profileUpdates });
      if (resp.success && resp.user) {
        setUser(resp.user);
        showToast('Academic profile updated successfully! Past test history preserved.', 'success');
      }
    } catch (e) {
      showToast('Failed to save profile changes.', 'error');
    }
  };

  // Exam engine management
  const startExamSession = (sessionData: Omit<ExamSession, 'id' | 'status' | 'user_answers' | 'flagged_questions' | 'time_remaining_seconds'>) => {
    const newSession: ExamSession = {
      ...sessionData,
      id: `exam_${Date.now()}`,
      status: 'in_progress',
      user_answers: {},
      flagged_questions: [],
      time_remaining_seconds: sessionData.duration_seconds,
    };
    setActiveExam(newSession);
    navigate(`/exam/${newSession.id}`);
  };

  const updateExamAnswer = (questionId: string, optionId: string) => {
    if (!activeExam) return;
    setActiveExam(prev => {
      if (!prev) return null;
      return {
        ...prev,
        user_answers: {
          ...prev.user_answers,
          [questionId]: optionId,
        },
      };
    });
  };

  const toggleFlagQuestion = (questionId: string) => {
    if (!activeExam) return;
    setActiveExam(prev => {
      if (!prev) return null;
      const isFlagged = prev.flagged_questions.includes(questionId);
      return {
        ...prev,
        flagged_questions: isFlagged
          ? prev.flagged_questions.filter(id => id !== questionId)
          : [...prev.flagged_questions, questionId],
      };
    });
  };

  const finishExamSession = async (timeUsedSeconds?: number): Promise<ExamResult | null> => {
    if (!activeExam) return null;
    const finalTimeUsed = timeUsedSeconds ?? (activeExam.duration_seconds - activeExam.time_remaining_seconds);

    try {
      const resp = await api.submitExam({
        title: activeExam.title,
        exam_type: activeExam.exam_type,
        category_name: activeExam.category_name,
        source_type: activeExam.source_type,
        questions: activeExam.questions,
        user_answers: activeExam.user_answers,
        duration_seconds: activeExam.duration_seconds,
        time_used_seconds: Math.max(15, finalTimeUsed),
      });

      if (resp.success && resp.result) {
        setLatestResult(resp.result);
        setActiveExam(null);
        await refreshUser();
        if (resp.result.score_percentage >= 75) {
          celebrate();
        }
        navigate(`/exam/${resp.result.id}/results`, { result: resp.result });
        return resp.result;
      }
    } catch (e) {
      showToast('Error submitting examination. Answers are preserved.', 'error');
    }
    return null;
  };

  const cancelExamSession = () => {
    setActiveExam(null);
    navigate('/practice');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        currentRoute,
        routeParams,
        navigate,
        activeExam,
        startExamSession,
        updateExamAnswer,
        toggleFlagQuestion,
        finishExamSession,
        cancelExamSession,
        latestResult,
        setLatestResult,
        toasts,
        showToast,
        refreshUser,
        switchRole,
        updateAcademicProfile,
        celebrate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
