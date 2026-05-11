import express from 'express';


import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as Models from './src/db/models.js';
const { User, Course, Topic, Question, TestSession, Result, Announcement, Incident } = Models as any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_testus_key';
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      try {
        await mongoose.connection.collection('users').dropIndex('matric_no_1');
        console.log('Dropped matric_no_1 index');
      } catch (e) {
        // Ignore if it doesn't exist
      }
      
      // Seed default admin and default student if none exist
      try {
        // --- FRESH START: Clear all existing modules as requested (DONE) ---
        // await Course.deleteMany({});
        // await Topic.deleteMany({});
        // await Question.deleteMany({});
        // await TestSession.deleteMany({});
        // await Result.deleteMany({});
        // await Announcement.deleteMany({});
        // await Incident.deleteMany({});
        
        if (await User.countDocuments() === 0) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('password123', salt);
          
          await User.create([
            {
              name: 'System Admin',
              email: 'admin@testus.com',
              password: hashedPassword,
              matric_no: 'ADMIN-001',
              department: 'Administration',
              role: 'admin'
            },
            {
              name: 'Jane Doe',
              email: 'student@testus.com',
              password: hashedPassword,
              matric_no: 'MED/2026/001',
              department: 'Medicine',
              role: 'student'
            }
          ]);
          console.log('Default users seeded: admin@testus.com and student@testus.com (Password: password123)');
        }
      } catch (seedErr) {
        console.error('Error seeding users:', seedErr);
      }
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not found. Tests will fail.');
}

// --- Middleware ---
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.jwtPayload = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req: any, res: any, next: any) => {
  const payload = req.jwtPayload;
  if (payload.role !== 'admin') {
    return res.status(401).json({ error: 'Admin access required' });
  }
  next();
};

// --- Helper Functions ---
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  let currentIndex = arr.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

function calculateGrade(percentage: number) {
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
}

// --- API Routes ---

// Auth Routes
app.post('/api/auth/register', async (req: any, res: any) => {
  if (!MONGODB_URI) return res.status(401).json({ error: 'DB not connected' });
  try {
    const { name, email, matric_no, password, department, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(401).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, matric_no: matric_no || email, password: hashedPassword, department: department || 'General', role: role || 'student'
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: { id: user._id, name: user.name, role: user.role, matricNo: user.matric_no, department: user.department }, token });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  if (!MONGODB_URI) return res.status(401).json({ error: 'DB not connected' });
  try {
    const { email, password } = req.body;
    // Allow login by matric_no or email
    const user = await User.findOne({ $or: [{ email }, { matric_no: email }] });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role || 'student' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: { id: user._id, name: user.name, role: user.role || 'student', matricNo: user.matric_no, department: user.department }, token });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

// Student Routes
app.get('/api/student/dashboard', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json({ student: null, results: [], recommendedCourses: [] });
  const payload = req.jwtPayload;
  try {
    const student = await User.findById(payload.id).select('-password');
    const results = await Result.find({ user_id: payload.id }).sort({ created_at: -1 }).limit(5).populate('course_id');
    const recommendedCourses = await Course.find({ status: 'published' }).limit(3);
    
    return res.json({
      student,
      results,
      recommendedCourses
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/student/leaderboard', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json({ leaderboard: [], currentUserRank: null });
  const payload = req.jwtPayload;
  try {
    const students = await User.find({ role: 'student' })
      .select('name matric_no department avg_score tests_taken')
      .sort({ avg_score: -1 });
      
    const leaderboard = students.map((s: any) => ({
      _id: s._id,
      name: s.name,
      matricNo: s.matric_no,
      department: s.department,
      strength: s.avg_score || 0
    }));
    
    const currentUserIndex = leaderboard.findIndex(s => s._id.toString() === payload.id);
    const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
    
    return res.json({ leaderboard, currentUserRank });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/student/results', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json([]);
  const payload = req.jwtPayload;
  if (payload.id === 'mock123') return res.json([]);
  const results = await Result.find({ user_id: payload.id }).populate('course_id', 'title code duration is_mock');
  return res.json(results);
});
app.get('/api/courses', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json([]);
  let query: any = {};
  if (req.jwtPayload?.role !== 'admin') {
    query = { 
      status: 'published',
      $or: [
        { end_date: { $exists: false } },
        { end_date: null },
        { end_date: { $gt: new Date() } }
      ]
    };
  } else {
    // Admin gets all courses, so query is empty
  }
  const courses = await Course.find(query);
  return res.json(courses);
});

// Monitor / Telemetry
app.get('/api/admin/overview', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json({ total_users: 1024, total_tests: 5420, active_sessions: 12 });
  const users = await User.countDocuments();
  const activeSessions = await TestSession.countDocuments({ status: 'active' });
  const resultsCount = await Result.countDocuments();
  return res.json({ total_users: users, total_tests: resultsCount, active_sessions: activeSessions });
});
app.get('/api/admin/telemetry', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json([]);
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const sessions = await TestSession.find({ start_time: { $gte: oneDayAgo } })
    .populate('user_id', 'name matric_no')
    .populate('course_id', 'title code questions')
    .sort({ start_time: -1 });
  return res.json(sessions);
});
app.get('/api/admin/incidents', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json([]);
  const incidents = await Incident.find()
    .populate('user_id', 'name matric_no')
    .populate({ 
       path: 'session_id', 
       populate: { path: 'course_id', select: 'code' }
    })
    .sort({ created_at: -1 }).limit(50);
  return res.json(incidents);
});

app.delete('/api/admin/incidents', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json({ success: true });
  await Incident.deleteMany({});
  return res.json({ success: true });
});

// Student Registry
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json([]);
  const query = req.query.q || '';
  const searchFilter = query ? { $or: [{ name: { $regex: query, $options: 'i' } }, { matric_no: { $regex: query, $options: 'i' } }] } : {};
  const users = await User.find(searchFilter);
  return res.json(users);
});

// Test Execution Engine
app.post('/api/test/start', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.status(401).json({ error: 'DB not connected', questions: [], sessionId: 'mock-session-123' });
  const payload = req.jwtPayload;
  const { courseId, limit } = req.body;
  
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(401).json({ error: 'Course not found' });
    if (course.status !== 'published') return res.status(401).json({ error: 'Course is not active' });
    if (course.end_date && new Date(course.end_date) < new Date()) {
       return res.status(401).json({ error: 'Test time has elapsed' });
    }

    let questions = await Question.find({ course_id: courseId });
    questions = shuffle(questions).slice(0, limit || 10);
    
    // Create new session
    const session = await TestSession.create({
      user_id: payload.id,
      course_id: courseId,
      status: 'active',
      start_time: new Date(),
      violations: 0
    });

    // Remove correct_option from questions sent to client
    const safeQuestions = questions.map(q => ({
      _id: q._id,
      text: q.question_text,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      diagramUrl: q.diagram_url
    }));

    return res.json({ questions: safeQuestions, sessionId: session._id });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

app.post('/api/security/incident', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json({ success: true });
  const payload = req.jwtPayload;
  const { sessionId, violation, details, snapshot_at_time } = req.body;
  
  try {
    const session = await TestSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (session.incidents && session.incidents.length > 0) {
      const lastIncident = session.incidents[session.incidents.length - 1];
      if (lastIncident.violation === violation) {
        const timeDiff = new Date().getTime() - new Date(lastIncident.timestamp).getTime();
        if (timeDiff < 5000) {
          return res.json({ success: true, ignored: true });
        }
      }
    }
    
    const inc = { violation, details, snapshot_at_time, timestamp: new Date() };
    const newCount = (session.incidents ? session.incidents.length : 0) + 1;
    const updatePayload: any = { $push: { incidents: inc } };
    if (newCount >= 3) {
       updatePayload.$set = { status: 'terminated_by_system' };
    }
    await TestSession.findByIdAndUpdate(sessionId, updatePayload);
    
    await Incident.create({
      user_id: payload.id,
      session_id: sessionId,
      type: violation,
      details
    });
    
    return res.json({ success: true });
  } catch(e: any) {
    return res.status(401).json({ error: e.message });
  }
});

app.post('/api/security/snapshot', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json({ success: true });
  const { sessionId, current_snapshot } = req.body;
  try {
    await TestSession.findByIdAndUpdate(sessionId, { current_snapshot });
    return res.json({ success: true });
  } catch(e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/test/submit', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.status(401).json({ score: 0, percentage: 0, grade: 'F', time_spent: 0, detailedReview: [] });
  const payload = req.jwtPayload;
  const { sessionId, answers, forced } = req.body;

  try {
    const session = await TestSession.findById(sessionId).populate('course_id');
    if (!session || session.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const duration = session.course_id.duration;
    
    // Calculate result
    let correctCount = 0;
    const questions = await Question.find({ course_id: session.course_id._id });
    const detailedReview: any[] = [];

    // Map A, B, C, D to 0, 1, 2, 3
    const optMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

    for (const q of questions) {
      if (answers[q._id.toString()] !== undefined) {
        const studentAnswerIdx = answers[q._id.toString()];
        const correctAnsIdx = optMap[q.correct_option];
        const isCorrect = studentAnswerIdx === correctAnsIdx;
        if (isCorrect) correctCount++;
        
        detailedReview.push({
          questionText: q.question_text,
          studentAnswer: [q.option_a, q.option_b, q.option_c, q.option_d][studentAnswerIdx],
          correctAnswer: [q.option_a, q.option_b, q.option_c, q.option_d][correctAnsIdx],
          isCorrect
        });
      }
    }

    const percentage = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    const timeSpent = Math.floor((Date.now() - session.start_time.getTime()) / 1000); // seconds
    const grade = calculateGrade(percentage);

    session.status = 'completed';
    session.end_time = new Date();
    await session.save();

    await Result.create({
      user_id: payload.id,
      course_id: session.course_id._id,
      session_id: session._id,
      score: correctCount,
      percentage: Math.round(percentage),
      grade,
      time_spent: timeSpent
    });

    // Update User avg_score and tests_taken for Leaderboard
    const user = await User.findById(payload.id);
    if (user) {
      const oldTotal = (user.avg_score || 0) * (user.tests_taken || 0);
      user.tests_taken = (user.tests_taken || 0) + 1;
      user.avg_score = (oldTotal + percentage) / user.tests_taken;
      await user.save();
    }

    // Prepare Review for ResultsView
    const review = questions.map(q => {
      const studentAnswerIdx = answers[q._id.toString()];
      const correctAnsIdx = optMap[q.correct_option];
      return {
        text: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        studentAnswer: studentAnswerIdx,
        correctOptionIndex: correctAnsIdx,
        explanation: q.explanation || "No explanation provided for this question."
      };
    });

    return res.json({
      score: correctCount,
      percentage: Math.round(percentage),
      grade,
      time_spent: timeSpent,
      review
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});
app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
  return res.json(user);
});
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  await User.findByIdAndDelete(req.params.id);
  return res.json({ success: true });
});
app.get('/api/admin/users/:id/results', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const results = await Result.find({ user_id: req.params.id }).populate('course_id');
  return res.json(results);
});
app.delete('/api/admin/results/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  await Result.findByIdAndDelete(req.params.id);
  return res.json({ success: true });
});

// Test Deployment Hub
app.post('/api/admin/courses', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  if (data.is_active !== undefined) {
    data.status = data.is_active ? 'published' : 'draft';
  }
  const course = await Course.create(data);
  return res.json(course);
});
app.put('/api/admin/courses/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  if (data.is_active !== undefined) {
    data.status = data.is_active ? 'published' : 'draft';
  }
  const course = await Course.findByIdAndUpdate(req.params.id, data, { new: true });
  return res.json(course);
});
app.delete('/api/admin/courses/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const courseId = req.params.id;
    console.log(`[DELETE] Starting deletion for course: ${courseId}`);
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Cleanup all related data
    await Topic.deleteMany({ course_id: courseId });
    await Question.deleteMany({ course_id: courseId });
    await TestSession.deleteMany({ course_id: courseId });
    await Result.deleteMany({ course_id: courseId });
    
    // Finally delete the course
    await Course.findByIdAndDelete(courseId);

    console.log(`[DELETE] Successfully deleted course ${courseId} and all related data.`);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE] Critical error deleting course:', err);
    return res.status(500).json({ error: err.message });
  }
});

// AI Injector
import { GoogleGenAI, Type } from '@google/genai';

app.post('/api/admin/generate-questions', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const { syllabus_text, count } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'AI Service configuration missing' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Generate ${count || 5} multiple choice questions based on this text:\n\n${syllabus_text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question_text: { type: Type.STRING },
              option_a: { type: Type.STRING },
              option_b: { type: Type.STRING },
              option_c: { type: Type.STRING },
              option_d: { type: Type.STRING },
              correct_option: { type: Type.STRING, description: "ONLY 'a', 'b', 'c', or 'd'" }
            },
            required: ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option"]
          }
        }
      }
    });
    
    const questions = JSON.parse(response.text || "[]");
    return res.json({ success: true, questions });
  } catch (err: any) {
    console.error('[AI] Generation Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Question Bank
app.get('/api/courses/:id/topics', authMiddleware, async (req: any, res: any) => {
  const topics = await Topic.find({ course_id: req.params.id });
  return res.json(topics);
});
app.post('/api/admin/topics', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  const topic = await Topic.create(data);
  return res.json(topic);
});
app.delete('/api/admin/topics/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const topic = await Topic.findByIdAndDelete(req.params.id);
  if (topic) {
    const deletedQuestions = await Question.deleteMany({ topic_id: req.params.id });
    if (deletedQuestions.deletedCount && deletedQuestions.deletedCount > 0) {
      await Course.findByIdAndUpdate(topic.course_id, { $inc: { questionsCount: -Math.abs(deletedQuestions.deletedCount) } });
    }
  }
  return res.json({ success: true });
});
app.put('/api/admin/topics/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  const topic = await Topic.findByIdAndUpdate(req.params.id, data, { new: true });
  return res.json(topic);
});
app.get('/api/admin/questions/:topicId', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const questions = await Question.find({ topic_id: req.params.topicId });
  return res.json(questions);
});
app.post('/api/admin/questions', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  const question = await Question.create(data);
  await Course.findByIdAndUpdate(question.course_id, { $inc: { questionsCount: 1 } });
  return res.json(question);
});
app.put('/api/admin/questions/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  const question = await Question.findByIdAndUpdate(req.params.id, data, { new: true });
  return res.json(question);
});
app.delete('/api/admin/questions/:id/:topicId', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const q = await Question.findByIdAndDelete(req.params.id);
  if (q) {
     await Course.findByIdAndUpdate(q.course_id, { $inc: { questionsCount: -1 } });
  }
  return res.json({ success: true });
});
app.post('/api/admin/bulk-upload', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const { questions } = req.body;
  const inserted = await Question.insertMany(questions);
  if (inserted.length > 0) {
    const courseId = inserted[0].course_id;
    await Course.findByIdAndUpdate(courseId, { $inc: { questionsCount: inserted.length } });
  }
  return res.json({ success: true, count: inserted.length });
});
app.post('/api/admin/questions/:id/diagram', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const { diagram_url } = req.body;
  await Question.findByIdAndUpdate(req.params.id, { diagram_url });
  return res.json({ success: true });
});

// PDF / Export
app.get('/api/admin/leaderboard/:courseId', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json([]);
  const results = await Result.find({ course_id: req.params.courseId }).populate('user_id', 'name matric_no department').sort({ score: -1 });
  return res.json(results);
});

// Proctoring
app.post('/api/admin/terminate-session/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  await TestSession.findByIdAndUpdate(req.params.id, { status: 'terminated_by_admin' });
  return res.json({ success: true });
});
app.post('/api/admin/warn-session/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const { message } = req.body;
  await TestSession.findByIdAndUpdate(req.params.id, { 
    $push: { warnings: message } 
  });
  return res.json({ success: true });
});

app.post('/api/admin/session/:id/override-answer', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const { questionId, selectedOption } = req.body;
  const updateKey = `answer_overrides.${questionId}`;
  await TestSession.findByIdAndUpdate(req.params.id, { 
    $set: { [updateKey]: selectedOption } 
  });
  return res.json({ success: true });
});

app.post('/api/admin/prune-session-logs/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  await TestSession.findByIdAndUpdate(req.params.id, { 
    $set: { incidents: [] } 
  });
  return res.json({ success: true });
});

app.get('/api/test/session-status/:id', authMiddleware, async (req: any, res: any) => {
  const session = await TestSession.findById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  return res.json({ 
    status: session.status, 
    warnings: session.warnings || [],
    answer_overrides: session.answer_overrides || {}
  });
});

// Announcements
app.get('/api/admin/announcements', authMiddleware, async (req: any, res: any) => {
  if (!MONGODB_URI) return res.json([]);
  const announcements = await Announcement.find().sort({ created_at: -1 });
  return res.json(announcements);
});
app.post('/api/admin/announcements', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const data = req.body;
  const ann = await Announcement.create(data);
  return res.json(ann);
});
app.delete('/api/admin/announcements/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  await Announcement.findByIdAndDelete(req.params.id);
  return res.json({ success: true });
});

// --- Server & Vite ---

const port = 3000;

if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  app.listen(port, "0.0.0.0", () => {
    console.log(`TestUs Server running DEV at http://localhost:${port}`);
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(port, "0.0.0.0", () => {
    console.log(`TestUs Server running PROD at http://localhost:${port}`);
  });
}

console.log(`TestUs Server running at http://localhost:${port}`);
