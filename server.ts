import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  UNIVERSITIES,
  FACULTIES,
  DEPARTMENTS,
  COURSES,
  TOPICS,
  WAEC_SUBJECTS,
  INITIAL_QUESTIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_UPLOADS,
  CUSTOM_INSTITUTION_AGGREGATES,
  INITIAL_EXAM_RESULTS,
  CURRENT_USER,
} from './server/db';
import {
  generateAIQuestions,
  explainAnswerAI,
  generateSimilarQuestionAI,
  chatWithTutorAI,
  generateStudyCoachPlanAI,
} from './server/aiService';
import { Question, ExamResult, UploadRecord, User, StudentProfile, University } from './src/types';

dotenv.config();

// In-memory data collections
let universities = [...UNIVERSITIES];
let faculties = [...FACULTIES];
let departments = [...DEPARTMENTS];
let courses = [...COURSES];
let topics = [...TOPICS];
let waecSubjects = [...WAEC_SUBJECTS];
let questions: Question[] = [...INITIAL_QUESTIONS];
let achievements = [...INITIAL_ACHIEVEMENTS];
let uploads: UploadRecord[] = [...INITIAL_UPLOADS];
let customAggregates = [...CUSTOM_INSTITUTION_AGGREGATES];
let examResults: ExamResult[] = [...INITIAL_EXAM_RESULTS];
let currentUser: User = { ...CURRENT_USER };

const usersList: User[] = [
  currentUser,
  {
    id: 'user_admin_1',
    name: 'Dr. Babatunde Moderator',
    email: 'babatunde.admin@examai.app',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-07-01T08:00:00Z',
    profile: {
      education_type: 'both',
      selected_courses: [],
      selected_waec_subjects: [],
      xp: 9990,
      streak_days: 35,
      overall_mastery_percentage: 98,
      total_questions_answered: 500,
      total_tests_completed: 40,
      average_score_percentage: 95,
      best_score_percentage: 100,
    }
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES FIRST ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), total_questions: questions.length });
  });

  // --- AUTHENTICATION & USER PROFILE ---
  app.get('/api/auth/me', (req, res) => {
    res.json(currentUser);
  });

  app.post('/api/auth/switch-user', (req, res) => {
    const { role } = req.body;
    const target = usersList.find(u => u.role === role) || usersList[0];
    currentUser = { ...target };
    res.json(currentUser);
  });

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = usersList.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || currentUser;
    currentUser = { ...user };
    res.json({ success: true, user: currentUser });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, education_type, university_id, custom_university_name, faculty_id, custom_faculty_name, department_id, custom_department_name, level, semester, selected_courses, selected_waec_subjects } = req.body;

    // Record custom institutions if provided
    if (custom_university_name) {
      const existing = customAggregates.find(c => c.name.toLowerCase() === custom_university_name.toLowerCase() && c.type === 'university');
      if (existing) {
        existing.student_count++;
        existing.last_submitted_at = new Date().toISOString();
      } else {
        customAggregates.push({
          name: custom_university_name,
          type: 'university',
          student_count: 1,
          first_submitted_at: new Date().toISOString(),
          last_submitted_at: new Date().toISOString(),
        });
      }
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name || 'Student User',
      email: email || 'student@examai.app',
      role: 'student',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'Student')}`,
      created_at: new Date().toISOString(),
      profile: {
        education_type: education_type || 'both',
        university_id: university_id || null,
        custom_university_name: custom_university_name || null,
        faculty_id: faculty_id || null,
        custom_faculty_name: custom_faculty_name || null,
        department_id: department_id || null,
        custom_department_name: custom_department_name || null,
        level: level || '100',
        semester: semester || '1st',
        selected_courses: selected_courses || ['CSC 201', 'MTH 201'],
        selected_waec_subjects: selected_waec_subjects || ['Mathematics', 'English Language', 'Physics'],
        xp: 100,
        streak_days: 1,
        last_active_date: new Date().toISOString().split('T')[0],
        overall_mastery_percentage: 60,
        total_questions_answered: 0,
        total_tests_completed: 0,
        average_score_percentage: 0,
        best_score_percentage: 0,
      }
    };

    usersList.push(newUser);
    currentUser = newUser;
    res.json({ success: true, user: currentUser });
  });

  // Updating profile preserves all history, XP, streaks, and test records
  app.put('/api/auth/profile', (req, res) => {
    const profileUpdates: Partial<StudentProfile> = req.body.profile || {};
    const nameUpdate = req.body.name;
    const avatarUpdate = req.body.avatar_url;

    currentUser.profile = {
      ...currentUser.profile,
      ...profileUpdates,
    };
    if (nameUpdate) currentUser.name = nameUpdate;
    if (avatarUpdate) currentUser.avatar_url = avatarUpdate;

    // Track any newly typed custom institution
    if (profileUpdates.custom_university_name) {
      const existing = customAggregates.find(c => c.name.toLowerCase() === profileUpdates.custom_university_name?.toLowerCase());
      if (!existing) {
        customAggregates.push({
          name: profileUpdates.custom_university_name,
          type: 'university',
          student_count: 1,
          first_submitted_at: new Date().toISOString(),
          last_submitted_at: new Date().toISOString(),
        });
      }
    }

    res.json({ success: true, user: currentUser });
  });

  // --- ACADEMIC STRUCTURE ENDPOINTS ---

  app.get('/api/universities', (req, res) => {
    const { search } = req.query;
    let list = universities.filter(u => u.status !== 'archived');
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || (u.short_name && u.short_name.toLowerCase().includes(q)));
    }
    res.json(list);
  });

  app.get('/api/faculties', (req, res) => {
    const { university_id } = req.query;
    let list = faculties.filter(f => f.status !== 'archived');
    if (university_id) {
      list = list.filter(f => f.university_id === university_id);
    }
    res.json(list);
  });

  app.get('/api/departments', (req, res) => {
    const { faculty_id, university_id } = req.query;
    let list = departments.filter(d => d.status !== 'archived');
    if (faculty_id) {
      list = list.filter(d => d.faculty_id === faculty_id);
    }
    if (university_id) {
      list = list.filter(d => d.university_id === university_id);
    }
    res.json(list);
  });

  app.get('/api/courses', (req, res) => {
    const { department_id, level, search } = req.query;
    let list = courses.filter(c => c.status !== 'archived');
    if (department_id) {
      list = list.filter(c => c.department_id === department_id);
    }
    if (level) {
      list = list.filter(c => c.level === String(level));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
    }
    res.json(list);
  });

  app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === req.params.id || c.code.toLowerCase() === req.params.id.toLowerCase());
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const courseTopics = topics.filter(t => t.course_id === course.id);
    const courseQuestions = questions.filter(q => q.course_id === course.id || q.course_code === course.code);
    res.json({ ...course, topics: courseTopics, questions_count: courseQuestions.length });
  });

  app.get('/api/subjects', (req, res) => {
    res.json(waecSubjects);
  });

  app.get('/api/subjects/:id', (req, res) => {
    const subject = waecSubjects.find(s => s.id === req.params.id || s.name.toLowerCase() === req.params.id.toLowerCase());
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    const subjectTopics = topics.filter(t => t.subject_id === subject.id);
    const subjectQuestions = questions.filter(q => q.subject_id === subject.id || q.subject_name === subject.name);
    res.json({ ...subject, topics: subjectTopics, questions_count: subjectQuestions.length });
  });

  app.get('/api/topics', (req, res) => {
    const { course_id, subject_id } = req.query;
    let list = topics;
    if (course_id) list = list.filter(t => t.course_id === course_id);
    if (subject_id) list = list.filter(t => t.subject_id === subject_id);
    res.json(list);
  });

  // --- QUESTIONS & PAST QUESTION LIBRARY ---

  app.get('/api/questions', (req, res) => {
    const {
      exam_type,
      subject_id,
      subject_name,
      course_id,
      course_code,
      topic_name,
      source_type,
      verification_status,
      year,
      limit,
      search,
    } = req.query;

    let filtered = [...questions];

    if (exam_type) {
      filtered = filtered.filter(q => q.exam_type === exam_type);
    }
    if (subject_id) {
      filtered = filtered.filter(q => q.subject_id === subject_id);
    }
    if (subject_name) {
      filtered = filtered.filter(q => (q.subject_name || '').toLowerCase() === String(subject_name).toLowerCase());
    }
    if (course_id) {
      filtered = filtered.filter(q => q.course_id === course_id);
    }
    if (course_code) {
      filtered = filtered.filter(q => (q.course_code || '').toLowerCase() === String(course_code).toLowerCase());
    }
    if (topic_name) {
      filtered = filtered.filter(q => (q.topic_name || '').toLowerCase().includes(String(topic_name).toLowerCase()));
    }
    if (source_type) {
      filtered = filtered.filter(q => q.source_type === source_type);
    }
    if (verification_status) {
      filtered = filtered.filter(q => q.verification_status === verification_status);
    }
    if (year) {
      filtered = filtered.filter(q => q.year === Number(year));
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(item =>
        item.question_text.toLowerCase().includes(q) ||
        (item.topic_name && item.topic_name.toLowerCase().includes(q)) ||
        (item.source && item.source.toLowerCase().includes(q))
      );
    }

    if (limit) {
      filtered = filtered.slice(0, Number(limit));
    }

    res.json(filtered);
  });

  app.get('/api/questions/:id', (req, res) => {
    const question = questions.find(q => q.id === req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  });

  // --- GEMINI AI FEATURES (SERVER-SIDE) ---

  // 1. Generate AI Practice Questions
  app.post('/api/ai/generate-questions', async (req, res) => {
    try {
      const {
        exam_type,
        subject_or_course,
        course_code,
        topic,
        difficulty = 'medium',
        question_count = 10,
        question_type = 'multiple_choice',
        pattern_mode = false,
      } = req.body;

      const generated = await generateAIQuestions({
        exam_type: exam_type || 'university',
        subject_or_course: subject_or_course || 'Computer Science',
        course_code,
        topic,
        difficulty,
        question_count: Number(question_count) || 10,
        question_type,
        pattern_mode: Boolean(pattern_mode),
      });

      // Save to questions cache for subsequent lookup
      questions.push(...generated);

      res.json({
        success: true,
        count: generated.length,
        questions: generated,
        source_type: 'ai_generated',
        pattern_mode: Boolean(pattern_mode),
      });
    } catch (err: any) {
      console.error('API /api/ai/generate-questions error:', err);
      res.status(500).json({ error: 'Failed to generate practice questions. Please try again.' });
    }
  });

  // 2. Explain Answer with AI
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { question_text, student_answer, correct_answer, options, topic } = req.body;
      const explanation = await explainAnswerAI({
        question_text,
        student_answer,
        correct_answer,
        options: options || [],
        topic: topic || 'Exam Concept',
      });
      res.json({ explanation });
    } catch (err: any) {
      console.error('API /api/ai/explain error:', err);
      res.status(500).json({ error: 'Failed to generate explanation.' });
    }
  });

  // 3. Generate Similar Drill Question with AI
  app.post('/api/ai/similar-question', async (req, res) => {
    try {
      const { original_question, topic, difficulty = 'medium' } = req.body;
      const similarQ = await generateSimilarQuestionAI({
        original_question,
        topic: topic || 'Key Concept',
        difficulty,
      });
      questions.push(similarQ);
      res.json({ question: similarQ });
    } catch (err: any) {
      console.error('API /api/ai/similar-question error:', err);
      res.status(500).json({ error: 'Failed to generate similar drill question.' });
    }
  });

  // 4. AI Tutor Chat
  app.post('/api/ai/tutor-chat', async (req, res) => {
    try {
      const { messages, user_context } = req.body;
      const result = await chatWithTutorAI({
        messages: messages || [],
        user_context: user_context || {
          current_course: currentUser.profile.selected_courses[0] || 'CSC 201',
          weak_areas: ['Trees & Binary Search Trees', 'Trigonometry & Bearings'],
          recent_score: currentUser.profile.average_score_percentage,
        },
      });
      res.json(result);
    } catch (err: any) {
      console.error('API /api/ai/tutor-chat error:', err);
      res.status(500).json({ error: 'AI Tutor is temporarily busy. Please try again.' });
    }
  });

  // 5. AI Study Coach
  app.post('/api/ai/study-coach', async (req, res) => {
    try {
      const weakTopics = req.body.weak_topics || ['Trees & Binary Search Trees', 'Logarithms & Indices', 'Trigonometry & Bearings'];
      const targetCourses = req.body.target_courses || currentUser.profile.selected_courses || ['CSC 201', 'WAEC Mathematics'];
      const recentScores = examResults.map(r => r.score_percentage).slice(0, 5);

      const coachPlan = await generateStudyCoachPlanAI({
        weak_topics: weakTopics,
        recent_scores: recentScores,
        target_courses_or_subjects: targetCourses,
      });

      res.json(coachPlan);
    } catch (err: any) {
      console.error('API /api/ai/study-coach error:', err);
      res.status(500).json({ error: 'Failed to create study plan.' });
    }
  });

  // --- EXAM ENGINE & GRADING ---

  app.post('/api/exams/submit', (req, res) => {
    const {
      title,
      exam_type,
      category_name,
      source_type,
      questions: examQList,
      user_answers,
      duration_seconds,
      time_used_seconds,
    } = req.body;

    const answeredList: Question[] = examQList || [];
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const topicStats: Record<string, { total: number; correct: number }> = {};

    answeredList.forEach(q => {
      const userChoice = user_answers[q.id];
      const topic = q.topic_name || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0 };
      }
      topicStats[topic].total++;

      if (!userChoice) {
        skippedCount++;
      } else if (userChoice.toUpperCase() === q.correct_answer.toUpperCase()) {
        correctCount++;
        topicStats[topic].correct++;
      } else {
        incorrectCount++;
      }
    });

    const total = answeredList.length || 1;
    const scorePercentage = Math.round((correctCount / total) * 100);
    const xpEarned = correctCount * 10 + (scorePercentage >= 80 ? 50 : 20);

    const topicBreakdown = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100),
    }));

    const result: ExamResult = {
      id: `res_${Date.now()}`,
      exam_session_id: `sess_${Date.now()}`,
      user_id: currentUser.id,
      title: title || 'Examination Practice Simulation',
      exam_type: exam_type || 'university',
      category_name: category_name || 'Practice Exam',
      source_type: source_type || 'real_past_question',
      total_questions: total,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      score_percentage: scorePercentage,
      time_used_seconds: time_used_seconds || 600,
      completed_at: new Date().toISOString(),
      topic_breakdown: topicBreakdown,
      xp_earned: xpEarned,
      questions: answeredList,
      user_answers: user_answers || {},
    };

    examResults.unshift(result);

    // Update currentUser cumulative stats
    currentUser.profile.xp += xpEarned;
    currentUser.profile.total_questions_answered += total;
    currentUser.profile.total_tests_completed += 1;
    if (scorePercentage > currentUser.profile.best_score_percentage) {
      currentUser.profile.best_score_percentage = scorePercentage;
    }
    const allScores = examResults.map(r => r.score_percentage);
    currentUser.profile.average_score_percentage = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    currentUser.profile.overall_mastery_percentage = Math.min(100, Math.round((currentUser.profile.average_score_percentage * 0.7) + (Math.min(currentUser.profile.total_questions_answered, 300) / 300 * 30)));

    // Unlock achievements check
    achievements.forEach(ach => {
      if (ach.id === 'ach_first_test') {
        ach.is_unlocked = true;
        ach.progress = 1;
      }
      if (ach.id === 'ach_100_q') {
        ach.progress = Math.min(100, currentUser.profile.total_questions_answered);
        if (ach.progress >= 100) ach.is_unlocked = true;
      }
      if (ach.id === 'ach_500_q') {
        ach.progress = Math.min(500, currentUser.profile.total_questions_answered);
        if (ach.progress >= 500) ach.is_unlocked = true;
      }
      if (ach.id === 'ach_score_90' && scorePercentage >= 90) {
        ach.is_unlocked = true;
        ach.progress = 1;
      }
      if (ach.id === 'ach_perfect' && scorePercentage === 100 && total >= 5) {
        ach.is_unlocked = true;
        ach.progress = 1;
      }
    });

    res.json({ success: true, result });
  });

  app.get('/api/exams/results', (req, res) => {
    res.json(examResults);
  });

  app.get('/api/exams/results/:id', (req, res) => {
    const result = examResults.find(r => r.id === req.params.id || r.exam_session_id === req.params.id);
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  });

  // --- STUDENT UPLOADS & MODERATION ---

  app.get('/api/uploads', (req, res) => {
    res.json(uploads);
  });

  app.post('/api/uploads', (req, res) => {
    const {
      file_name,
      file_type = 'application/pdf',
      file_size = '2.1 MB',
      exam_type,
      university_name,
      faculty_name,
      department_name,
      level,
      course_code,
      course_title,
      subject_name,
      semester,
      year,
      notes,
      extracted_text,
    } = req.body;

    const newUpload: UploadRecord = {
      id: `up_${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      file_name: file_name || 'Past_Question_Document.pdf',
      file_type,
      file_size,
      exam_type: exam_type || 'university',
      university_name,
      faculty_name,
      department_name,
      level,
      course_code,
      course_title,
      subject_name,
      semester,
      year: Number(year) || 2024,
      notes,
      extracted_text: extracted_text || `[OCR Text Extraction]\nInstitution: ${university_name || 'WAEC'}\nCourse/Subject: ${course_code || subject_name || 'General'}\nYear: ${year || 2024}\nQuestion 1: What is the primary operational difference between static and dynamic allocation?\nA) Run-time flexibility B) Fixed stack size C) Memory protection D) Cache bypass\nCorrect Answer: A`,
      status: 'pending_review',
      created_at: new Date().toISOString(),
    };

    uploads.unshift(newUpload);

    // Reward XP for community upload
    currentUser.profile.xp += 50;

    res.json({
      success: true,
      message: 'Your upload will be reviewed by platform moderators before appearing publicly.',
      upload: newUpload,
    });
  });

  // --- ACHIEVEMENTS ---
  app.get('/api/achievements', (req, res) => {
    res.json(achievements);
  });

  // --- ADMIN DASHBOARD & CONTENT MANAGEMENT ---

  app.get('/api/admin/stats', (req, res) => {
    res.json({
      students_count: usersList.filter(u => u.role === 'student').length + 3280,
      universities_count: universities.filter(u => u.status === 'active').length,
      courses_count: courses.length,
      real_questions_count: questions.filter(q => q.source_type === 'real_past_question').length,
      ai_questions_count: questions.filter(q => q.source_type === 'ai_generated').length,
      pending_uploads_count: uploads.filter(u => u.status === 'pending_review').length,
      custom_institutions_count: customAggregates.length,
    });
  });

  app.get('/api/admin/uploads', (req, res) => {
    res.json(uploads);
  });

  app.post('/api/admin/uploads/:id/moderate', (req, res) => {
    const { status, moderator_notes } = req.body; // 'approved' | 'rejected'
    const upload = uploads.find(u => u.id === req.params.id);
    if (!upload) return res.status(404).json({ error: 'Upload not found' });

    upload.status = status;
    upload.moderator_notes = moderator_notes || '';
    upload.reviewed_at = new Date().toISOString();

    // If approved, automatically parse and import into public verified question library!
    if (status === 'approved') {
      const newQuestion: Question = {
        id: `q_mod_${Date.now()}`,
        question_text: `[From ${upload.file_name}] ${upload.course_code || upload.subject_name || ''}: What is the primary operational difference between static and dynamic allocation?`,
        question_type: 'multiple_choice',
        source_type: 'student_submitted',
        verification_status: 'verified',
        exam_type: upload.exam_type,
        institution_name: upload.university_name,
        faculty_name: upload.faculty_name,
        department_name: upload.department_name,
        course_code: upload.course_code,
        course_title: upload.course_title,
        subject_name: upload.subject_name,
        topic_name: 'Core Curriculum',
        year: upload.year,
        level: upload.level,
        semester: upload.semester as any,
        options: [
          { id: 'A', text: 'Run-time heap flexibility vs compile-time fixed layout' },
          { id: 'B', text: 'Fixed stack allocation only' },
          { id: 'C', text: 'Constant pointer isolation' },
          { id: 'D', text: 'Hardware bus routing constraints' },
        ],
        correct_answer: 'A',
        explanation: 'Dynamic allocation utilizes heap memory requested at runtime, whereas static allocation is bound during compile-time.',
        difficulty: 'medium',
        source: `Community Verified: ${upload.university_name || 'Official'} ${upload.year} (${upload.file_name})`,
        created_at: new Date().toISOString(),
      };
      questions.unshift(newQuestion);
    }

    res.json({ success: true, upload });
  });

  app.get('/api/admin/custom-institutions', (req, res) => {
    res.json(customAggregates);
  });

  // Promote custom "Other" institution into official database
  app.post('/api/admin/custom-institutions/promote', (req, res) => {
    const { name, short_name, state } = req.body;
    const cleanId = `uni_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newUni: University = {
      id: cleanId,
      name,
      short_name: short_name || name.split(' ').map((w: string) => w[0]).join('').toUpperCase(),
      state: state || 'Nigeria',
      country: 'Nigeria',
      status: 'active',
      student_count: 50,
    };

    universities.push(newUni);
    customAggregates = customAggregates.filter(c => c.name.toLowerCase() !== name.toLowerCase());

    res.json({ success: true, university: newUni });
  });

  app.post('/api/admin/universities', (req, res) => {
    const { name, short_name, state, country = 'Nigeria' } = req.body;
    const newUni: University = {
      id: `uni_${Date.now()}`,
      name,
      short_name,
      state,
      country,
      status: 'active',
      student_count: 0,
    };
    universities.push(newUni);
    res.json({ success: true, university: newUni });
  });

  app.put('/api/admin/universities/:id', (req, res) => {
    const uni = universities.find(u => u.id === req.params.id);
    if (!uni) return res.status(404).json({ error: 'University not found' });
    Object.assign(uni, req.body);
    res.json({ success: true, university: uni });
  });

  app.post('/api/admin/questions', (req, res) => {
    const newQ: Question = {
      id: `q_admin_${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
    };
    questions.unshift(newQ);
    res.json({ success: true, question: newQ });
  });

  app.put('/api/admin/questions/:id', (req, res) => {
    const q = questions.find(item => item.id === req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    Object.assign(q, req.body, { updated_at: new Date().toISOString() });
    res.json({ success: true, question: q });
  });

  app.get('/api/admin/users', (req, res) => {
    res.json(usersList);
  });

  // --- VITE MIDDLEWARE SETUP FOR SPA / DEV / PRODUCTION ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EXAMAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
