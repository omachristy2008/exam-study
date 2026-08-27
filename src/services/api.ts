import {
  User,
  University,
  Faculty,
  Department,
  Course,
  Topic,
  WAECSubject,
  Question,
  ExamResult,
  UploadRecord,
  Achievement,
  CustomInstitutionAggregate,
  ExamType,
  QuestionDifficulty,
  QuestionType,
} from '../types';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth & Profile
  getMe: () => fetchJSON<User>('/api/auth/me'),
  login: (email: string) => fetchJSON<{ success: boolean; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  register: (payload: any) => fetchJSON<{ success: boolean; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateProfile: (payload: { profile?: any; name?: string; avatar_url?: string }) =>
    fetchJSON<{ success: boolean; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  switchUserRole: (role: 'student' | 'admin') => fetchJSON<User>('/api/auth/switch-user', {
    method: 'POST',
    body: JSON.stringify({ role }),
  }),

  // Academic Structure
  getUniversities: (search?: string) =>
    fetchJSON<University[]>(`/api/universities${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getFaculties: (university_id?: string) =>
    fetchJSON<Faculty[]>(`/api/faculties${university_id ? `?university_id=${university_id}` : ''}`),
  getDepartments: (faculty_id?: string, university_id?: string) => {
    const params = new URLSearchParams();
    if (faculty_id) params.append('faculty_id', faculty_id);
    if (university_id) params.append('university_id', university_id);
    return fetchJSON<Department[]>(`/api/departments?${params.toString()}`);
  },
  getCourses: (params?: { department_id?: string; level?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.department_id) q.append('department_id', params.department_id);
    if (params?.level) q.append('level', params.level);
    if (params?.search) q.append('search', params.search);
    return fetchJSON<Course[]>(`/api/courses?${q.toString()}`);
  },
  getCourseDetail: (id: string) => fetchJSON<Course & { topics: Topic[]; questions_count: number }>(`/api/courses/${id}`),
  getSubjects: () => fetchJSON<WAECSubject[]>('/api/subjects'),
  getSubjectDetail: (id: string) => fetchJSON<WAECSubject & { topics: Topic[]; questions_count: number }>(`/api/subjects/${id}`),
  getTopics: (params?: { course_id?: string; subject_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.course_id) q.append('course_id', params.course_id);
    if (params?.subject_id) q.append('subject_id', params.subject_id);
    return fetchJSON<Topic[]>(`/api/topics?${q.toString()}`);
  },

  // Questions
  getQuestions: (params?: {
    exam_type?: string;
    subject_id?: string;
    subject_name?: string;
    course_id?: string;
    course_code?: string;
    topic_name?: string;
    source_type?: string;
    verification_status?: string;
    year?: number;
    search?: string;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
      });
    }
    return fetchJSON<Question[]>(`/api/questions?${q.toString()}`);
  },
  getQuestion: (id: string) => fetchJSON<Question>(`/api/questions/${id}`),

  // AI Service
  generateQuestions: (payload: {
    exam_type: ExamType;
    subject_or_course: string;
    course_code?: string;
    topic?: string;
    difficulty: QuestionDifficulty;
    question_count: number;
    question_type: QuestionType;
    pattern_mode?: boolean;
  }) => fetchJSON<{ success: boolean; count: number; questions: Question[]; source_type: string; pattern_mode: boolean }>('/api/ai/generate-questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  explainAnswer: (payload: {
    question_text: string;
    student_answer: string;
    correct_answer: string;
    options: { id: string; text: string }[];
    topic: string;
  }) => fetchJSON<{ explanation: string }>('/api/ai/explain', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  generateSimilarQuestion: (payload: {
    original_question: string;
    topic: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => fetchJSON<{ question: Question }>('/api/ai/similar-question', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  tutorChat: (payload: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    user_context?: any;
  }) => fetchJSON<{ reply: string; quick_prompts: string[] }>('/api/ai/tutor-chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getStudyCoachPlan: (payload?: {
    weak_topics?: string[];
    target_courses?: string[];
  }) => fetchJSON<{ summary: string; plan: any[] }>('/api/ai/study-coach', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  }),

  // Exam Sessions & Results
  submitExam: (payload: {
    title: string;
    exam_type: 'waec' | 'university';
    category_name: string;
    source_type: string;
    questions: Question[];
    user_answers: Record<string, string>;
    duration_seconds: number;
    time_used_seconds: number;
  }) => fetchJSON<{ success: boolean; result: ExamResult }>('/api/exams/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getExamResults: () => fetchJSON<ExamResult[]>('/api/exams/results'),
  getExamResult: (id: string) => fetchJSON<ExamResult>(`/api/exams/results/${id}`),

  // Student Uploads
  getUploads: () => fetchJSON<UploadRecord[]>('/api/uploads'),
  submitUpload: (payload: Partial<UploadRecord>) =>
    fetchJSON<{ success: boolean; message: string; upload: UploadRecord }>('/api/uploads', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Achievements
  getAchievements: () => fetchJSON<Achievement[]>('/api/achievements'),

  // Admin
  getAdminStats: () => fetchJSON<any>('/api/admin/stats'),
  getAdminUploads: () => fetchJSON<UploadRecord[]>('/api/admin/uploads'),
  moderateUpload: (id: string, payload: { status: 'approved' | 'rejected'; moderator_notes?: string }) =>
    fetchJSON<{ success: boolean; upload: UploadRecord }>(`/api/admin/uploads/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCustomInstitutions: () => fetchJSON<CustomInstitutionAggregate[]>('/api/admin/custom-institutions'),
  promoteCustomInstitution: (payload: { name: string; short_name?: string; state?: string }) =>
    fetchJSON<{ success: boolean; university: University }>('/api/admin/custom-institutions/promote', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  addUniversity: (payload: Partial<University>) =>
    fetchJSON<{ success: boolean; university: University }>('/api/admin/universities', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdminUsers: () => fetchJSON<User[]>('/api/admin/users'),
};
