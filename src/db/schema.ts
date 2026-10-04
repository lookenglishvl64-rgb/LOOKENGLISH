/**
 * LOOK ENGLISH - Database Schema Definition (TypeScript & ORM)
 * Đồng bộ toàn diện giữa Backend, Web Desktop và Thiết bị di động (Mobile)
 */

export interface DatabaseState {
  users: Array<any>;
  classes: Array<any>;
  tuitionFees: Array<any>;
  attendance: Array<any>;
  evaluations: Array<any>;
  announcements: Array<any>;
  mediaItems: Array<any>;
  grades: Array<any>;
  assignments: Array<any>;
  checkIns: Array<any>;
  leaderboard: Array<any>;
  lastUpdated: string;
}

export const DATABASE_TABLE_NAMES = {
  USERS: 'users',
  CLASSES: 'classes',
  TUITION_FEES: 'tuition_fees',
  DAILY_ATTENDANCE: 'daily_attendance',
  STUDENT_EVALUATIONS: 'student_evaluations',
  CENTER_ANNOUNCEMENTS: 'center_announcements',
  HOME_MEDIA_ITEMS: 'home_media_items',
  ACADEMIC_GRADES: 'academic_grades',
  HOMEWORK_ASSIGNMENTS: 'homework_assignments',
  HOMEWORK_SUBMISSIONS: 'homework_submissions',
  STUDENT_CHECKINS: 'student_checkins',
  LEADERBOARD_RECORDS: 'leaderboard_records',
} as const;
