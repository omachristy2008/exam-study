export type ExamType = 'waec' | 'university' | 'both';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuestionType = 'multiple_choice' | 'true_false' | 'calculation' | 'mixed';
export type SourceType = 'real_past_question' | 'ai_generated' | 'student_submitted';
export type VerificationStatus = 'verified' | 'pending_review' | 'rejected' | 'reported' | 'archived';
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  profile: StudentProfile;
}

export interface StudentProfile {
  education_type: ExamType;
  // University details (if university or both)
  university_id?: string | null;
  custom_university_name?: string | null;
  faculty_id?: string | null;
  custom_faculty_name?: string | null;
  department_id?: string | null;
  custom_department_name?: string | null;
  level?: string | null; // e.g., '100', '200', '300', '400', '500'
  semester?: '1st' | '2nd' | null;
  selected_courses: string[]; // course IDs or codes e.g. ['CSC 201', 'MTH 201']
  
  // WAEC details (if waec or both)
  waec_target_year?: number;
  selected_waec_subjects: string[]; // subject IDs or names e.g. ['Mathematics', 'English Language', 'Physics']

  // Stats and Progression
  xp: number;
  streak_days: number;
  last_active_date?: string;
  overall_mastery_percentage: number;
  total_questions_answered: number;
  total_tests_completed: number;
  average_score_percentage: number;
  best_score_percentage: number;
}

export interface University {
  id: string;
  name: string;
  short_name?: string;
  state?: string;
  country: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'archived';
  is_custom?: boolean;
  student_count?: number;
}

export interface Faculty {
  id: string;
  university_id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  is_custom?: boolean;
}

export interface Department {
  id: string;
  faculty_id: string;
  university_id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  is_custom?: boolean;
}

export interface Course {
  id: string;
  code: string; // e.g., "CSC 201"
  title: string; // e.g., "Data Structures and Algorithms"
  department_id?: string;
  faculty_id?: string;
  university_id?: string;
  level: string; // "100", "200", "300", "400", "500"
  semester: '1st' | '2nd';
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  mastery_percentage?: number;
  question_count?: number;
}

export interface Topic {
  id: string;
  course_id?: string;
  subject_id?: string;
  name: string;
  order_index?: number;
  mastery_percentage?: number;
  question_count?: number;
}

export interface WAECSubject {
  id: string;
  name: string; // e.g., "Mathematics", "English Language", "Physics"
  category: 'Science' | 'Arts' | 'Commercial' | 'General';
  code: string; // e.g., "MTH", "ENG", "PHY"
  description?: string;
  question_count?: number;
  topics_count?: number;
  mastery_percentage?: number;
  status: 'active' | 'inactive';
}

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D' or UUID
  text: string;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  source_type: SourceType; // 'real_past_question' | 'ai_generated' | 'student_submitted'
  verification_status: VerificationStatus;
  
  // Categorization
  exam_type: 'waec' | 'university';
  institution_id?: string | null;
  institution_name?: string | null;
  faculty_name?: string | null;
  department_name?: string | null;
  course_id?: string | null;
  course_code?: string | null;
  course_title?: string | null;
  subject_id?: string | null;
  subject_name?: string | null;
  topic_id?: string | null;
  topic_name: string;
  
  // Exam metadata
  year?: number | null;
  semester?: '1st' | '2nd' | null;
  level?: string | null;
  
  // Content
  options: QuestionOption[];
  correct_answer: string; // 'A', 'B', etc.
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Origin & Traceability
  source: string; // e.g., "WAEC May/June 2023 Paper 1", "UNILAG CSC 201 2024 Exam", "AI Generated - Topic Pattern Analysis"
  source_url?: string;
  ai_pattern_basis?: string; // If AI generated based on past question patterns
  created_at: string;
  updated_at?: string;
}

export interface ExamSession {
  id: string;
  user_id: string;
  title: string;
  exam_type: 'waec' | 'university';
  category_name: string; // e.g. "CSC 201: Data Structures" or "WAEC Mathematics"
  topic_filter?: string;
  difficulty: QuestionDifficulty;
  source_type: SourceType | 'mixed';
  questions: Question[];
  duration_seconds: number;
  time_remaining_seconds: number;
  started_at: string;
  user_answers: Record<string, string>; // questionId -> selectedOptionId
  flagged_questions: string[]; // questionIds marked for review
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface TopicPerformance {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface ExamResult {
  id: string;
  exam_session_id: string;
  user_id: string;
  title: string;
  exam_type: 'waec' | 'university';
  category_name: string;
  source_type: SourceType | 'mixed';
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  score_percentage: number;
  time_used_seconds: number;
  completed_at: string;
  topic_breakdown: TopicPerformance[];
  xp_earned: number;
  questions: Question[];
  user_answers: Record<string, string>;
}

export interface UploadRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  file_name: string;
  file_type?: string;
  file_size?: string;
  file_url?: string;
  exam_type: 'waec' | 'university';
  institution_name?: string;
  university_name?: string;
  faculty_name?: string;
  department_name?: string;
  level?: string;
  course_code?: string;
  course_title?: string;
  course_or_subject?: string;
  subject_name?: string;
  semester?: string;
  year: number;
  notes?: string;
  extracted_text?: string;
  question_count?: number;
  status: 'pending_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  moderator_notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_name?: string;
  icon?: string;
  category: 'tests' | 'streak' | 'mastery' | 'uploads' | 'special';
  xp_reward: number;
  is_unlocked?: boolean;
  unlocked?: boolean;
  unlocked_at?: string;
  progress?: number;
  max_progress?: number;
}

export interface StudyPlanItem {
  id: string;
  title: string;
  topic: string;
  course_or_subject: string;
  duration_minutes: number;
  type: 'review' | 'practice' | 'mini_test';
  action_label: string;
  action_url: string;
  completed: boolean;
}

export interface AITutorChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quick_prompts?: string[];
  referenced_question?: Partial<Question>;
}

export interface CustomInstitutionAggregate {
  name: string;
  type: 'university' | 'faculty' | 'department';
  parent_name?: string;
  student_count: number;
  first_submitted_at: string;
  last_submitted_at: string;
}
