export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'guest';

export interface UserModel {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Encrypted or stored password for verification
  studentCode?: string; // Unique student code, e.g. LK-STAR-101, LK-IELTS-204
  classId?: string; // Optional: student/parent primary class or teacher primary class
  assignedClassIds?: string[]; // Classes assigned to teacher
  phone?: string;
  avatar?: string;
  parentOfStudentId?: string; // If role === 'parent'
  accountStatus?: 'active' | 'pending' | 'locked';
  createdAt?: string;
}

export interface ClassModel {
  id: string;
  className: string;
  teacherId: string;
  studentList: string[]; // List of student IDs
  level?: string; // e.g. IELTS 6.5, Cambridge Flyers, Kids Starters
  schedule?: string; // e.g. T2-T4-T6 (18:00 - 19:30)
  room?: string; // e.g. Room 204
  maxCapacity?: number; // e.g. 15-20 students
}

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceModel {
  id: string;
  classId: string;
  studentId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  status: AttendanceStatus;
  note?: string; // e.g. "Sốt có phép", "Vào lớp muộn 15p"
}

export type SkillType = 'listening' | 'speaking' | 'reading' | 'writing' | 'test';

export interface GradeModel {
  id: string;
  studentId: string;
  skill: SkillType;
  score: number; // 0 - 10 scale (or IELTS band)
  date: string;
  comment?: string;
}

export interface AssignmentSubmission {
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileUrl: string;
  fileName: string;
  score?: number;
  teacherFeedback?: string;
}

export interface AssignmentModel {
  id: string;
  classId: string;
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  dueDate: string;
  submissions?: AssignmentSubmission[];
}

export type EvaluationType = 'reward' | 'praise' | 'discipline';

export interface EvaluationModel {
  id: string;
  studentId: string;
  teacherNote: string;
  type: EvaluationType;
  date: string;
  teacherId?: string;
}

export interface CertificateModel {
  id: string;
  studentId: string;
  certName: string;
  fileUrl: string;
  issueDate: string;
  certType?: string; // e.g., 'Cambridge Flyers', 'IELTS 7.0', 'Top 1 Course'
  verificationCode?: string;
}

export interface LeaderboardModel {
  id: string;
  classId: string;
  topStudentId: string;
  month: string; // e.g. "10/2026", "09/2026"
  score: number;
  highlightNote?: string;
}

export interface HomeBannerModel {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText?: string;
  actionText?: string;
  isActive: boolean;
}

export interface CenterAnnouncementModel {
  id: string;
  title: string;
  content: string;
  category: 'khai-giang' | 'thi-cu' | 'vinh-danh' | 'thong-bao';
  date: string;
  imageUrl?: string;
}
