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
  rewardStars?: number; // Tổng số điểm sao khen thưởng tích lũy của học viên
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

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

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
  starDelta?: number; // e.g. +1, +2, +5, -1, -2 (cộng hoặc trừ điểm sao của học sinh)
  reasonCategory?: string; // Lý do phê bình hoặc khen thưởng
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
  month: string; // e.g. "Tháng 10/2026", "Tháng 09/2026"
  score: number;
  highlightNote?: string;
  title?: string; // e.g. "Thủ Khoa Mock Test IELTS", "Học Sinh Xuất Sắc Nhất Khối"
  imageUrl?: string; // Ảnh vinh danh, nhận giải thưởng hoặc cúp
  videoUrl?: string; // Video vinh danh, phỏng vấn hoặc bài phát biểu tiếng Anh
  mediaType?: 'image' | 'video' | 'both';
  badgeText?: string; // e.g. "TOP 1 OVERALL", "THỦ KHOA SPEAKING", "GOLDEN EXPLORER"
  starsCount?: number;
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

export interface HomeMediaItemModel {
  id: string;
  tag: string; // e.g. 'COMPETITION', 'CLASSROOM', 'WORKSHOP', 'AWARDS', 'VIDEO'
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  videoUrl?: string;
  type?: 'image' | 'video';
}

export interface CenterAnnouncementModel {
  id: string;
  title: string;
  content: string;
  category: 'khai-giang' | 'thi-cu' | 'vinh-danh' | 'thong-bao';
  date: string;
  imageUrl?: string;
}

export interface ScheduleSessionModel {
  id: string;
  classId: string;
  teacherId: string;
  taName?: string; // Tên trợ giảng (TA) hỗ trợ lớp nếu có
  dayOfWeek: number; // 1: T2, 2: T3, 3: T4, 4: T5, 5: T6, 6: T7, 0: CN
  dayOfWeekText: string; // e.g. "Thứ Hai", "Thứ Ba", ...
  timeSlot: string; // e.g. "18:00 - 19:30"
  room: string; // e.g. "Phòng Lab A201"
  status?: 'scheduled' | 'completed' | 'cancelled';
  sessionTopic?: string;
  durationHours?: number; // e.g. 1.5
  isExtraOrMakeUp?: boolean; // Đánh dấu lịch học thay đổi đột xuất hoặc học bù
  changeNote?: string; // Ghi chú lý do thay đổi đột xuất
}

export interface TeacherTimesheetModel {
  id: string;
  teacherId: string;
  classId: string;
  taName?: string; // Trợ giảng đi cùng ca dạy
  date: string; // YYYY-MM-DD
  timeSlot: string;
  room: string;
  hours: number;
  status: 'completed' | 'absent' | 'substitute' | 'scheduled';
  note?: string;
  confirmedByAdmin?: boolean;
}

export type CheckInMoodType =
  | 'excited'
  | 'happy'
  | 'confident'
  | 'neutral'
  | 'tired'
  | 'stressed';

export interface StudentCheckInModel {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mood: CheckInMoodType;
  moodEmoji: string;
  moodLabel: string;
  energyLevel: number; // 1 - 5
  reflection: string; // Cảm nghĩ của học viên hôm nay
  topicsLearned?: string; // Những gì con học được hôm nay
  needHelp: boolean;
  helpTopic?: string;
  parentNote?: string; // Lời nhắn động viên từ phụ huynh
  teacherFeedback?: {
    teacherId: string;
    teacherName: string;
    comment: string;
    createdAt: string;
  };
}
