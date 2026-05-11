import mongoose, { Schema, Document } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  matric_no: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  tests_taken: { type: Number, default: 0 },
  avg_score: { type: Number, default: 0 }
}, { timestamps: true });

const CourseSchema = new Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  question_limit: { type: Number, default: 50 },
  icon: { type: String, default: 'Book' },
  is_mock: { type: Boolean, default: false },
  scheduled_date: { type: Date },
  end_date: { type: Date },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  questionsCount: { type: Number, default: 0 }
}, { timestamps: true });

const TopicSchema = new Schema({
  name: { type: String, required: true },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true }
}, { timestamps: true });

const QuestionSchema = new Schema({
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  question_text: { type: String, required: true },
  option_a: { type: String, required: true },
  option_b: { type: String, required: true },
  option_c: { type: String, required: true },
  option_d: { type: String, required: true },
  correct_option: { type: String, enum: ['a', 'b', 'c', 'd'], required: true },
  diagram_url: { type: String }
}, { timestamps: true });

const AnnouncementSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const ResultSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  session_id: { type: Schema.Types.ObjectId, ref: 'TestSession' },
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  time_spent: { type: Number, required: true }, // in seconds
  created_at: { type: Date, default: Date.now }
});

const IncidentSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  session_id: { type: Schema.Types.ObjectId, ref: 'TestSession', required: true },
  type: { type: String, required: true }, // e.g. 'focus_lost'
  details: { type: String },
  ip_address: { type: String },
  created_at: { type: Date, default: Date.now }
});

const TestSessionSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 're-connected', 'terminated_by_admin', 'terminated_by_system', 'completed'], default: 'active' },
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date },
  answers: { type: Map, of: String },
  answer_overrides: { type: Map, of: String },
  current_snapshot: { type: String },
  incidents: [{
     violation: { type: String },
     timestamp: { type: Date, default: Date.now },
     details: { type: String },
     snapshot_at_time: { type: String }
  }],
  warnings: [{ type: String }]
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export const Topic = mongoose.models.Topic || mongoose.model('Topic', TopicSchema);
export const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
export const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);
export const Incident = mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
export const TestSession = mongoose.models.TestSession || mongoose.model('TestSession', TestSessionSchema);

