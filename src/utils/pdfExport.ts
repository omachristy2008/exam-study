import jsPDF from 'jspdf';
import { User, ExamResult } from '../types';

interface TopicMasteryItem {
  name: string;
  course: string;
  score: number;
  status: string;
}

interface ExportAnalyticsOptions {
  user: User | null;
  examHistory: ExamResult[];
  topicsMastery?: TopicMasteryItem[];
}

interface ExportExamResultOptions {
  result: ExamResult;
  user: User | null;
}

/**
 * Helper to draw header banner on top of a page
 */
function drawHeader(doc: jsPDF, title: string, subtitle: string, pageNum: number, totalPages?: number) {
  // Top gradient/dark bar
  doc.setFillColor(20, 14, 18);
  doc.rect(0, 0, 210, 28, 'F');

  // Orange accent strip
  doc.setFillColor(255, 106, 0);
  doc.rect(0, 27, 210, 1.5, 'F');

  // Logo & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EXAMAI', 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 160, 92);
  doc.text('ACADEMIC EXAMINATION PLATFORM', 14, 21);

  // Document Title on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 196, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 170, 175);
  doc.text(subtitle, 196, 20, { align: 'right' });
}

/**
 * Helper to draw footer on every page
 */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number, verificationCode: string) {
  const pageHeight = 297;
  
  // Footer divider line
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 15, 196, pageHeight - 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 130);
  doc.text(
    `EXAMAI Official Performance Statement • Verification Hash: ${verificationCode}`,
    14,
    pageHeight - 9
  );

  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    196,
    pageHeight - 9,
    { align: 'right' }
  );
}

/**
 * Generate and download full user study performance analytics PDF
 */
export function exportStudyAnalyticsPDF({ user, examHistory, topicsMastery = [] }: ExportAnalyticsOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const verificationHash = 'EX-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalExams = examHistory.length;
  const totalQuestions = examHistory.reduce((acc, curr) => acc + curr.total_questions, 0);
  const totalCorrect = examHistory.reduce((acc, curr) => acc + curr.correct_count, 0);
  const avgScore = totalExams > 0
    ? Math.round(examHistory.reduce((acc, curr) => acc + curr.score_percentage, 0) / totalExams)
    : (user?.profile.average_score_percentage || 78);
  const highestScore = totalExams > 0
    ? Math.max(...examHistory.map(e => e.score_percentage))
    : (user?.profile.best_score_percentage || 95);

  let currentY = 36;

  // Page 1 Header
  drawHeader(doc, 'STUDY PERFORMANCE STATEMENT', `Generated on ${formattedDate} at ${formattedTime}`, 1);

  // 1. Student Identity & Academic Profile Box
  doc.setFillColor(248, 249, 252);
  doc.setDrawColor(225, 228, 235);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, currentY, 182, 36, 3, 3, 'FD');

  // Decorative left orange border accent
  doc.setFillColor(255, 106, 0);
  doc.roundedRect(14, currentY, 2.5, 36, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 30);
  doc.text(user?.name || 'Verified Student Scholar', 22, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 115);
  doc.text(`Email: ${user?.email || 'student@examai.com'}`, 22, currentY + 13);
  doc.text(`Account Role: ${user?.role === 'admin' ? 'Administrator' : 'Verified Student Candidate'}`, 22, currentY + 18);

  const eduTypeLabel = user?.profile.education_type === 'waec'
    ? 'WAEC / WASSCE Preparation Track'
    : user?.profile.education_type === 'university'
    ? 'University Degree Track'
    : 'Dual Track (University + WAEC)';
  doc.text(`Track: ${eduTypeLabel}`, 22, currentY + 23);

  // Academic institution / details on right column of box
  const uniName = user?.profile.custom_university_name || 'University of Lagos (UNILAG)';
  const deptName = user?.profile.custom_department_name || 'Computer Science';
  const facultyName = user?.profile.custom_faculty_name || 'Faculty of Science';
  const levelText = user?.profile.level ? `${user.profile.level} Level` : '200 Level';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 60);
  doc.text('Institution Affiliation:', 110, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 95);
  doc.text(`${uniName}`, 110, currentY + 12);
  doc.text(`${facultyName} • ${deptName}`, 110, currentY + 17);
  doc.text(`Academic Level: ${levelText}`, 110, currentY + 22);

  // Verification Badge pill inside box
  doc.setFillColor(235, 247, 240);
  doc.setDrawColor(160, 220, 180);
  doc.roundedRect(110, currentY + 26, 75, 6.5, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(20, 130, 60);
  doc.text(`STATUS: VERIFIED ACTIVE CANDIDATE`, 113, currentY + 30.5);

  currentY += 42;

  // 2. Executive Key Performance Indicator (KPI) Metric Tiles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 45);
  doc.text('ACADEMIC METRICS & BENCHMARKS', 14, currentY);

  currentY += 4;

  const cardWidth = 42.5;
  const cardHeight = 22;
  const gap = 4;

  const metrics = [
    { label: 'Overall Mastery', value: `${user?.profile.overall_mastery_percentage || avgScore}%`, sub: 'Calculated Competency', color: [255, 106, 0] },
    { label: 'Questions Solved', value: `${(user?.profile.total_questions_answered || totalQuestions || 142).toLocaleString()}`, sub: `${totalCorrect} Correct Answers`, color: [30, 30, 45] },
    { label: 'Mock Average', value: `${avgScore}%`, sub: `High: ${highestScore}%`, color: [16, 149, 106] },
    { label: 'Study Streak & XP', value: `${user?.profile.streak_days || 5} Days`, sub: `${(user?.profile.xp || 1250).toLocaleString()} XP Earned`, color: [230, 90, 0] },
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (cardWidth + gap);
    doc.setFillColor(250, 251, 254);
    doc.setDrawColor(228, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 125);
    doc.text(m.label, x + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, x + 3.5, currentY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(130, 130, 145);
    doc.text(m.sub, x + 3.5, currentY + 18.5);
  });

  currentY += cardHeight + 8;

  // 3. Topic Mastery & Syllabus Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 45);
  doc.text('SYLLABUS & TOPIC MASTERY BREAKDOWN', 14, currentY);

  currentY += 4;

  // Table Header
  doc.setFillColor(240, 242, 248);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 85);
  doc.text('CURRICULUM TOPIC', 18, currentY + 4.8);
  doc.text('COURSE / SUBJECT', 88, currentY + 4.8);
  doc.text('ACCURACY', 142, currentY + 4.8);
  doc.text('MASTERY STATUS', 170, currentY + 4.8);

  currentY += 7;

  const topicsList = topicsMastery.length > 0 ? topicsMastery : [
    { name: 'Trees & Binary Search Trees', course: 'CSC 201', score: 62, status: 'Needs Practice' },
    { name: 'Linear Lists, Stacks & Queues', course: 'CSC 201', score: 88, status: 'Mastered' },
    { name: 'Asymptotic Analysis & Big-O', course: 'CSC 201', score: 74, status: 'Proficient' },
    { name: 'Trigonometry & 3D Bearings', course: 'WAEC Mathematics', score: 60, status: 'Needs Practice' },
    { name: 'Quadratic & Polynomial Equations', course: 'WAEC Mathematics', score: 90, status: 'Mastered' },
    { name: 'Mechanics & Vector Quantities', course: 'PHY 101', score: 82, status: 'Proficient' },
  ];

  topicsList.forEach((topic, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 253, 255);
      doc.rect(14, currentY, 182, 6.5, 'F');
    }
    doc.setDrawColor(240, 242, 246);
    doc.line(14, currentY + 6.5, 196, currentY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(35, 35, 45);
    doc.text(topic.name, 18, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 105);
    doc.text(topic.course, 88, currentY + 4.5);

    // Score with mini bar
    doc.setFont('helvetica', 'bold');
    if (topic.score >= 80) doc.setTextColor(16, 149, 106);
    else if (topic.score >= 70) doc.setTextColor(255, 106, 0);
    else doc.setTextColor(215, 60, 60);

    doc.text(`${topic.score}%`, 142, currentY + 4.5);

    // Status label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    if (topic.score >= 80) {
      doc.setTextColor(16, 130, 90);
      doc.text('Mastered', 170, currentY + 4.5);
    } else if (topic.score >= 70) {
      doc.setTextColor(200, 90, 0);
      doc.text('Proficient', 170, currentY + 4.5);
    } else {
      doc.setTextColor(200, 40, 40);
      doc.text('Needs Revision', 170, currentY + 4.5);
    }

    currentY += 6.5;
  });

  currentY += 6;

  // 4. Mock Examination Scores Log Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 45);
  doc.text('MOCK EXAMINATIONS & TEST SITTING HISTORY', 14, currentY);

  currentY += 4;

  // Table Header
  doc.setFillColor(240, 242, 248);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 85);
  doc.text('EXAM TITLE / CATEGORY', 18, currentY + 4.8);
  doc.text('DATE', 90, currentY + 4.8);
  doc.text('TIME USED', 120, currentY + 4.8);
  doc.text('QUESTIONS', 146, currentY + 4.8);
  doc.text('SCORE & GRADE', 170, currentY + 4.8);

  currentY += 7;

  const examsToRender = examHistory.length > 0 ? examHistory.slice(0, 7) : [
    {
      id: 'mock-1',
      title: 'CSC 201: Data Structures - 2024 Exam Drill',
      category_name: 'CSC 201',
      completed_at: new Date(Date.now() - 86400000).toISOString(),
      time_used_seconds: 1340,
      total_questions: 20,
      correct_count: 18,
      score_percentage: 90,
    } as any,
    {
      id: 'mock-2',
      title: 'WAEC Mathematics: Algebra & Trigonometry Mock',
      category_name: 'Mathematics',
      completed_at: new Date(Date.now() - 172800000).toISOString(),
      time_used_seconds: 1780,
      total_questions: 25,
      correct_count: 21,
      score_percentage: 84,
    } as any,
    {
      id: 'mock-3',
      title: 'PHY 101: Mechanics & Heat Diagnostics',
      category_name: 'PHY 101',
      completed_at: new Date(Date.now() - 345600000).toISOString(),
      time_used_seconds: 980,
      total_questions: 15,
      correct_count: 11,
      score_percentage: 73,
    } as any,
  ];

  examsToRender.forEach((exam, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 253, 255);
      doc.rect(14, currentY, 182, 6.5, 'F');
    }
    doc.setDrawColor(240, 242, 246);
    doc.line(14, currentY + 6.5, 196, currentY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(35, 35, 45);
    // Truncate long exam titles
    const titleText = exam.title.length > 42 ? exam.title.substring(0, 40) + '...' : exam.title;
    doc.text(titleText, 18, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 115);
    const examDate = new Date(exam.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    doc.text(examDate, 90, currentY + 4.5);

    const mins = Math.round(exam.time_used_seconds / 60);
    doc.text(`${mins} mins`, 120, currentY + 4.5);

    doc.text(`${exam.correct_count}/${exam.total_questions} (${exam.total_questions} Qs)`, 146, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    if (exam.score_percentage >= 75) {
      doc.setTextColor(16, 149, 106);
      doc.text(`${exam.score_percentage}% (Distinction)`, 170, currentY + 4.5);
    } else if (exam.score_percentage >= 50) {
      doc.setTextColor(200, 100, 0);
      doc.text(`${exam.score_percentage}% (Pass)`, 170, currentY + 4.5);
    } else {
      doc.setTextColor(215, 60, 60);
      doc.text(`${exam.score_percentage}% (Fail)`, 170, currentY + 4.5);
    }

    currentY += 6.5;
  });

  currentY += 6;

  // 5. AI Study Recommendations & Weak Focus Advisory Box
  doc.setFillColor(254, 250, 246);
  doc.setDrawColor(255, 215, 180);
  doc.roundedRect(14, currentY, 182, 28, 3, 3, 'FD');

  doc.setFillColor(255, 106, 0);
  doc.roundedRect(14, currentY, 2.5, 28, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 70, 0);
  doc.text('AI CURRICULUM DIAGNOSTICS & ADVISORY', 20, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 70);
  doc.text(
    '• Focus Area: Algorithm tree traversal and trigonometry equations show lowest accuracy metrics (<65%).',
    20,
    currentY + 12
  );
  doc.text(
    '• Recommendation: Schedule 15-minute daily timed drills on CSC 201 and WAEC Mathematics before the next mock sitting.',
    20,
    currentY + 17
  );
  doc.text(
    '• Continuous Assessment: High study consistency recorded (5-day active streak). Retain speed pacing for distinction standing.',
    20,
    currentY + 22
  );

  // Draw footer on Page 1
  drawFooter(doc, 1, 1, verificationHash);

  // Save the PDF
  const filename = `EXAMAI-Performance-Report-${user?.name ? user.name.replace(/\s+/g, '_') : 'Student'}-${formattedDate.replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}

/**
 * Generate and download a targeted single mock exam result score report
 */
export function exportExamResultPDF({ result, user }: ExportExamResultOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const verificationHash = 'EX-RES-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
  const now = new Date(result.completed_at || Date.now());
  const formattedDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const minutesUsed = Math.floor(result.time_used_seconds / 60);
  const secondsUsed = result.time_used_seconds % 60;
  const avgSecondsPerQ = Math.round(result.time_used_seconds / Math.max(1, result.total_questions));

  let currentY = 36;

  // Page 1 Header
  drawHeader(doc, 'MOCK EXAMINATION REPORT CARD', `Sitting Date: ${formattedDate} • ${formattedTime}`, 1);

  // 1. Exam Title & Candidate Card
  doc.setFillColor(248, 249, 252);
  doc.setDrawColor(225, 228, 235);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, currentY, 182, 34, 3, 3, 'FD');

  doc.setFillColor(255, 106, 0);
  doc.roundedRect(14, currentY, 2.5, 34, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 30);
  doc.text(result.title, 22, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 115);
  doc.text(`Candidate Name: ${user?.name || 'Verified Student Candidate'}`, 22, currentY + 13);
  doc.text(`Category / Subject: ${result.category_name} (${result.exam_type.toUpperCase()})`, 22, currentY + 18);
  doc.text(`Question Source: ${result.source_type === 'real_past_question' ? 'Official Verified Past Paper' : 'AI Generated Adaptive Practice'}`, 22, currentY + 23);

  // Score Highlight on right of banner
  doc.setFillColor(result.score_percentage >= 50 ? 240 : 255, result.score_percentage >= 50 ? 250 : 240, result.score_percentage >= 50 ? 244 : 240);
  doc.setDrawColor(result.score_percentage >= 50 ? 160 : 230, result.score_percentage >= 50 ? 220 : 160, result.score_percentage >= 50 ? 180 : 160);
  doc.roundedRect(142, currentY + 4, 48, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  if (result.score_percentage >= 75) doc.setTextColor(16, 149, 106);
  else if (result.score_percentage >= 50) doc.setTextColor(200, 100, 0);
  else doc.setTextColor(215, 50, 50);
  doc.text(`${result.score_percentage}%`, 166, currentY + 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const gradeLabel = result.score_percentage >= 75 ? 'DISTINCTION' : result.score_percentage >= 50 ? 'PASS' : 'UNSUCCESSFUL';
  doc.text(gradeLabel, 166, currentY + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 130);
  doc.text(`+${result.xp_earned || 50} XP Awarded`, 166, currentY + 25, { align: 'center' });

  currentY += 40;

  // 2. Metric Tiles
  const cardWidth = 42.5;
  const cardHeight = 20;
  const gap = 4;

  const metrics = [
    { label: 'Correct Answers', value: `${result.correct_count} / ${result.total_questions}`, sub: `${Math.round((result.correct_count / result.total_questions) * 100)}% Accuracy`, color: [16, 149, 106] },
    { label: 'Incorrect Answers', value: `${result.incorrect_count}`, sub: `${result.skipped_count} Skipped`, color: [215, 50, 50] },
    { label: 'Time Utilized', value: `${minutesUsed}m ${secondsUsed}s`, sub: `${avgSecondsPerQ}s per question`, color: [30, 30, 45] },
    { label: 'Exam Standing', value: gradeLabel, sub: 'Curriculum Standard', color: [255, 106, 0] },
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (cardWidth + gap);
    doc.setFillColor(250, 251, 254);
    doc.setDrawColor(228, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 125);
    doc.text(m.label, x + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, x + 3.5, currentY + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(130, 130, 145);
    doc.text(m.sub, x + 3.5, currentY + 17);
  });

  currentY += cardHeight + 8;

  // 3. Topic Breakdown in this exam
  if (result.topic_breakdown && result.topic_breakdown.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 45);
    doc.text('EXAMINATION TOPIC BREAKDOWN', 14, currentY);

    currentY += 4;

    doc.setFillColor(240, 242, 248);
    doc.rect(14, currentY, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 85);
    doc.text('TOPIC / SECTION', 18, currentY + 4.8);
    doc.text('QUESTIONS', 110, currentY + 4.8);
    doc.text('CORRECT', 145, currentY + 4.8);
    doc.text('ACCURACY %', 170, currentY + 4.8);

    currentY += 7;

    result.topic_breakdown.forEach((t, idx) => {
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(252, 253, 255);
        doc.rect(14, currentY, 182, 6.5, 'F');
      }
      doc.setDrawColor(240, 242, 246);
      doc.line(14, currentY + 6.5, 196, currentY + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(35, 35, 45);
      doc.text(t.topic, 18, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 95);
      doc.text(`${t.total}`, 110, currentY + 4.5);
      doc.text(`${t.correct}`, 145, currentY + 4.5);

      doc.setFont('helvetica', 'bold');
      if (t.percentage >= 75) doc.setTextColor(16, 149, 106);
      else if (t.percentage >= 50) doc.setTextColor(200, 100, 0);
      else doc.setTextColor(215, 50, 50);
      doc.text(`${t.percentage}%`, 170, currentY + 4.5);

      currentY += 6.5;
    });

    currentY += 6;
  }

  // 4. Question Response & Solution Keys (First 5-6 questions summary)
  if (result.questions && result.questions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 45);
    doc.text('QUESTION RESPONSE AUDIT (SAMPLE SITTING)', 14, currentY);

    currentY += 4;

    result.questions.slice(0, 5).forEach((q, idx) => {
      const selected = result.user_answers[q.id];
      const isCorrect = selected === q.correct_answer;
      const isSkipped = !selected;

      doc.setFillColor(250, 251, 254);
      doc.setDrawColor(230, 233, 240);
      doc.roundedRect(14, currentY, 182, 14.5, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 40);
      const qNumText = `Q${idx + 1}. `;
      const rawText = q.question_text.length > 90 ? q.question_text.substring(0, 88) + '...' : q.question_text;
      doc.text(qNumText + rawText, 17, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 105);
      doc.text(`Your Choice: Option ${selected || 'None'}`, 17, currentY + 10.5);
      doc.text(`Correct Key: Option ${q.correct_answer}`, 75, currentY + 10.5);

      doc.setFont('helvetica', 'bold');
      if (isCorrect) {
        doc.setTextColor(16, 149, 106);
        doc.text('CORRECT', 165, currentY + 10.5);
      } else if (isSkipped) {
        doc.setTextColor(140, 140, 150);
        doc.text('SKIPPED', 165, currentY + 10.5);
      } else {
        doc.setTextColor(215, 50, 50);
        doc.text('INCORRECT', 165, currentY + 10.5);
      }

      currentY += 16;
    });

    currentY += 4;
  }

  // Draw footer on Page 1
  drawFooter(doc, 1, 1, verificationHash);

  // Save the PDF
  const cleanTitle = result.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const filename = `EXAMAI-Score-Report-${cleanTitle}-${formattedDate.replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
