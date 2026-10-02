import React, { useState } from 'react';
import {
  ClassModel,
  UserModel,
  UserRole,
  ScheduleSessionModel,
  TeacherTimesheetModel,
} from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  DollarSign,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Check,
  X,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface ScheduleManagerProps {
  classes: ClassModel[];
  users: UserModel[];
  sessions: ScheduleSessionModel[];
  timesheets: TeacherTimesheetModel[];
  currentRole: UserRole;
  currentUserId?: string;
  childStudentId?: string;
  onAddSession?: (session: Omit<ScheduleSessionModel, 'id'>) => void;
  onUpdateSession?: (sessionId: string, data: Partial<ScheduleSessionModel>) => void;
  onDeleteSession?: (sessionId: string) => void;
  onAddTimesheetRecord?: (record: Omit<TeacherTimesheetModel, 'id'>) => void;
  onUpdateTimesheetRecord?: (timesheetId: string, data: Partial<TeacherTimesheetModel>) => void;
  onDeleteTimesheetRecord?: (timesheetId: string) => void;
  onUpdateTimesheetStatus?: (timesheetId: string, status: TeacherTimesheetModel['status'], confirmed?: boolean) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  classes,
  users,
  sessions,
  timesheets,
  currentRole,
  currentUserId,
  childStudentId,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onAddTimesheetRecord,
  onUpdateTimesheetRecord,
  onDeleteTimesheetRecord,
  onUpdateTimesheetStatus,
}) => {
  const isParent = currentRole === 'parent';
  const isTeacher = currentRole === 'teacher';
  const isAdmin = currentRole === 'admin';

  // Admin view mode: 'schedule' (Thời khóa biểu) or 'timesheet' (Chấm công giáo viên)
  const [adminViewMode, setAdminViewMode] = useState<'schedule' | 'timesheet'>('schedule');

  // Filters
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Schedule Session Modal (Add / Edit) for Admin
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduleSessionModel | null>(null);
  const [sessionFormData, setSessionFormData] = useState({
    classId: classes[0]?.id || '',
    teacherId: users.find((u) => u.role === 'teacher')?.id || '',
    taName: '',
    dayOfWeek: 1,
    dayOfWeekText: 'Thứ Hai',
    timeSlot: '18:00 - 19:30',
    room: 'Phòng Lab A201',
    sessionTopic: '',
    durationHours: 1.5,
    isExtraOrMakeUp: false,
    changeNote: '',
  });

  // Timesheet Modal (Add / Edit) for Admin
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<TeacherTimesheetModel | null>(null);
  const [timesheetFormData, setTimesheetFormData] = useState({
    teacherId: users.find((u) => u.role === 'teacher')?.id || '',
    classId: classes[0]?.id || '',
    taName: '',
    date: new Date().toISOString().substring(0, 10),
    timeSlot: '18:00 - 19:30',
    room: 'Phòng Lab A201',
    hours: 1.5,
    status: 'completed' as TeacherTimesheetModel['status'],
    note: 'Đã hoàn thành buổi dạy theo giáo án',
  });

  const teachers = users.filter((u) => u.role === 'teacher');
  const child = isParent
    ? users.find((u) => u.id === (childStudentId || 'usr_student_2'))
    : null;

  // Days of week mapping
  const daysOfWeek = [
    { value: 1, label: 'Thứ Hai' },
    { value: 2, label: 'Thứ Ba' },
    { value: 3, label: 'Thứ Tư' },
    { value: 4, label: 'Thứ Năm' },
    { value: 5, label: 'Thứ Sáu' },
    { value: 6, label: 'Thứ Bảy' },
    { value: 0, label: 'Chủ Nhật' },
  ];

  // 1. FILTER FOR PARENT: Only sessions of classes their child attends
  const parentSessions = isParent && child
    ? sessions.filter((s) => {
        const cls = classes.find((c) => c.id === s.classId);
        return cls && (cls.studentList.includes(child.id) || child.classId === cls.id);
      })
    : [];

  // 2. FILTER FOR TEACHER: Only sessions taught by this teacher
  const teacherSessions = isTeacher
    ? sessions.filter((s) => s.teacherId === currentUserId)
    : [];

  // 3. FILTER FOR ADMIN: Center-wide sessions
  const filteredSessions = sessions.filter((s) => {
    if (selectedDayFilter !== 'all' && s.dayOfWeek.toString() !== selectedDayFilter) return false;
    if (selectedTeacherFilter !== 'all' && s.teacherId !== selectedTeacherFilter) return false;
    if (selectedClassFilter !== 'all' && s.classId !== selectedClassFilter) return false;
    return true;
  });

  // Timesheet summary per teacher for Admin
  const teacherStats = teachers.map((t) => {
    const records = timesheets.filter((ts) => ts.teacherId === t.id);
    const completedShifts = records.filter((ts) => ts.status === 'completed');
    const totalHours = completedShifts.reduce((sum, r) => sum + (r.hours || 1.5), 0);
    return {
      teacher: t,
      totalShifts: records.length,
      completedShifts: completedShifts.length,
      totalHours: Number(totalHours.toFixed(1)),
    };
  });

  // Handlers for Session (Schedule)
  const handleOpenAddSession = () => {
    setEditingSession(null);
    setSessionFormData({
      classId: classes[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      taName: '',
      dayOfWeek: 1,
      dayOfWeekText: 'Thứ Hai',
      timeSlot: '18:00 - 19:30',
      room: 'Phòng Lab A201',
      sessionTopic: '',
      durationHours: 1.5,
      isExtraOrMakeUp: false,
      changeNote: '',
    });
    setShowSessionModal(true);
  };

  const handleOpenEditSession = (session: ScheduleSessionModel) => {
    setEditingSession(session);
    setSessionFormData({
      classId: session.classId,
      teacherId: session.teacherId,
      taName: session.taName || '',
      dayOfWeek: session.dayOfWeek,
      dayOfWeekText: session.dayOfWeekText,
      timeSlot: session.timeSlot,
      room: session.room,
      sessionTopic: session.sessionTopic || '',
      durationHours: session.durationHours || 1.5,
      isExtraOrMakeUp: !!session.isExtraOrMakeUp,
      changeNote: session.changeNote || '',
    });
    setShowSessionModal(true);
  };

  const handleSubmitSession = (e: React.FormEvent) => {
    e.preventDefault();
    const dayLabel = daysOfWeek.find((d) => d.value === Number(sessionFormData.dayOfWeek))?.label || 'Thứ Hai';

    if (editingSession && onUpdateSession) {
      onUpdateSession(editingSession.id, {
        ...sessionFormData,
        dayOfWeekText: dayLabel,
      });
    } else if (onAddSession) {
      onAddSession({
        ...sessionFormData,
        dayOfWeekText: dayLabel,
        status: 'scheduled',
      });
    }

    setShowSessionModal(false);
  };

  // Handlers for Timesheet
  const handleOpenAddTimesheet = () => {
    setEditingTimesheet(null);
    setTimesheetFormData({
      teacherId: teachers[0]?.id || '',
      classId: classes[0]?.id || '',
      taName: '',
      date: new Date().toISOString().substring(0, 10),
      timeSlot: '18:00 - 19:30',
      room: 'Phòng Lab A201',
      hours: 1.5,
      status: 'completed',
      note: 'Đã hoàn thành buổi dạy',
    });
    setShowTimesheetModal(true);
  };

  const handleOpenEditTimesheet = (ts: TeacherTimesheetModel) => {
    setEditingTimesheet(ts);
    setTimesheetFormData({
      teacherId: ts.teacherId,
      classId: ts.classId,
      taName: ts.taName || '',
      date: ts.date,
      timeSlot: ts.timeSlot,
      room: ts.room,
      hours: ts.hours,
      status: ts.status,
      note: ts.note || '',
    });
    setShowTimesheetModal(true);
  };

  const handleSubmitTimesheet = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTimesheet && onUpdateTimesheetRecord) {
      onUpdateTimesheetRecord(editingTimesheet.id, {
        ...timesheetFormData,
        confirmedByAdmin: true,
      });
    } else if (onAddTimesheetRecord) {
      onAddTimesheetRecord({
        ...timesheetFormData,
        confirmedByAdmin: true,
      });
    }

    setShowTimesheetModal(false);
  };

  // =========================================================================
  // VIEW 1: PARENT VIEW - LỊCH HỌC CỦA RIÊNG CON EM
  // =========================================================================
  if (isParent && child) {
    const childClass = classes.find((c) => c.id === child.classId || c.studentList.includes(child.id));

    return (
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Thời Khóa Biểu & Lịch Học Của Con</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Lịch Học Của Bé {child.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lớp: <strong className="text-blue-800">{childClass?.className || 'IELTS Intensive 6.5+'}</strong> • Quý phụ huynh lưu ý thời gian đưa đón con đúng giờ.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs">
              <span className="text-amber-800 font-bold block">⏰ Lịch học cố định:</span>
              <span className="font-extrabold text-amber-950 text-sm">
                {childClass?.schedule || 'Thứ 2 - 4 - 6 (18:00 - 19:30)'}
              </span>
              <span className="text-[11px] text-amber-700 block mt-0.5">
                📍 {childClass?.room || 'Phòng Lab A201'}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Grid for Child */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Chi Tiết Các Buổi Học Trong Tuần
            </h3>
            <span className="text-xs text-blue-800 font-bold">
              {parentSessions.length > 0 ? `${parentSessions.length} buổi học/tuần` : '3 buổi/tuần'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {(parentSessions.length > 0 ? parentSessions : sessions.slice(0, 3)).map((s, idx) => {
              const teacher = users.find((u) => u.id === s.teacherId);
              return (
                <div key={s.id || idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex flex-col items-center justify-center text-blue-900 shrink-0">
                      <span className="text-[10px] uppercase font-black">{s.dayOfWeekText.substring(0, 5)}</span>
                      <span className="text-xs font-mono font-bold">T{s.dayOfWeek === 0 ? 'CN' : s.dayOfWeek + 1}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{s.dayOfWeekText}</span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.timeSlot}
                        </span>

                        {/* Extra or Make-up session badge */}
                        {s.isExtraOrMakeUp && (
                          <span className="text-[11px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Lịch Học Đột Xuất / Học Bù</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Nội dung dự kiến: <strong className="text-slate-800">"{s.sessionTopic || 'Luyện phản xạ giao tiếp & từ vựng theo chủ đề'}"</strong>
                      </p>

                      {s.changeNote && (
                        <p className="text-[11px] text-amber-800 font-semibold mt-0.5 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                          ⚠️ Ghi chú trung tâm: {s.changeNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.room}</span>
                    </div>

                    {/* Teacher */}
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 font-bold">
                      <img
                        src={teacher?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                        alt={teacher?.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>GV: {teacher?.name || 'Giáo viên phụ trách'}</span>
                    </div>

                    {/* TA (Trợ giảng) badge if assigned */}
                    {s.taName && (
                      <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-purple-800 font-extrabold">
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>TA: {s.taName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: TEACHER VIEW - LỊCH GIẢNG DẠY CỦA GIÁO VIÊN
  // =========================================================================
  if (isTeacher) {
    const myClasses = classes.filter(
      (c) => c.teacherId === currentUserId || users.find(u => u.id === currentUserId)?.assignedClassIds?.includes(c.id)
    );
    const mySessions = sessions.filter((s) => s.teacherId === currentUserId);
    const myTimesheets = timesheets.filter((ts) => ts.teacherId === currentUserId);
    const totalTaughtHours = myTimesheets
      .filter((ts) => ts.status === 'completed')
      .reduce((sum, ts) => sum + (ts.hours || 1.5), 0);

    return (
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch Giảng Dạy & Chấm Công Của Thầy Cô</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Lịch Dạy Hàng Tuần ({myClasses.length} Lớp Phụ Trách)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi ca dạy, phòng học, trợ giảng (TA) hỗ trợ và số giờ giảng dạy được hệ thống tự động ghi nhận chấm công.
              </p>
            </div>

            {/* Quick stats for teacher */}
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Số ca đã dạy</span>
                <span className="text-lg font-black text-emerald-800">{myTimesheets.filter(t => t.status === 'completed').length} ca</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Tổng giờ dạy</span>
                <span className="text-lg font-black text-blue-800">{totalTaughtHours.toFixed(1)} giờ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Timetable */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Lịch Dạy Các Ngày Trong Tuần
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Tự động đồng bộ với Ban Giám Đốc
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {mySessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có lịch dạy được xếp cho tài khoản của bạn.
              </div>
            ) : (
              mySessions.map((s) => {
                const cls = classes.find((c) => c.id === s.classId);
                return (
                  <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex flex-col items-center justify-center text-indigo-900 shrink-0 font-bold">
                        <span className="text-[10px] uppercase font-black">{s.dayOfWeekText.substring(0, 5)}</span>
                        <span className="text-xs">T{s.dayOfWeek === 0 ? 'CN' : s.dayOfWeek + 1}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-slate-900 text-sm font-black">{cls?.className}</strong>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.timeSlot}
                          </span>

                          {s.isExtraOrMakeUp && (
                            <span className="text-[11px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Ca Học Đột Xuất / Bù</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          {s.dayOfWeekText} • Giáo án: <strong>"{s.sessionTopic || 'Giảng dạy chuẩn khung Cambridge/IELTS'}"</strong>
                        </p>

                        {s.changeNote && (
                          <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                            ⚠️ Ghi chú thay đổi: {s.changeNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.room}</span>
                      </div>

                      {/* TA (Trợ giảng) */}
                      {s.taName && (
                        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-purple-800 font-extrabold">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Trợ giảng (TA): {s.taName}</span>
                        </div>
                      )}

                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-xl">
                        ✓ {s.durationHours || 1.5} Giờ dạy
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ADMIN VIEW - THỜI KHÓA BIỂU TOÀN TRUNG TÂM & CHẤM CÔNG GIÁO VIÊN
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Banner and View Mode Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Quản Lý Lịch Học & Chấm Công Giáo Viên</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lịch Học Trung Tâm & Chấm Công Giáo Viên
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Admin có quyền thêm, sửa, xóa lịch học cố định hoặc lịch học đột xuất/học bù, phân công Trợ giảng (TA), và quản lý chấm công giáo viên.
            </p>
          </div>

          {/* Toggle between Schedule and Timesheet Mode */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setAdminViewMode('schedule')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                adminViewMode === 'schedule'
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Lịch Học Các Ngày
            </button>
            <button
              onClick={() => setAdminViewMode('timesheet')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                adminViewMode === 'timesheet'
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💰 Chấm Công Giáo Viên ({timesheets.length})
            </button>
          </div>
        </div>

        {/* Quick summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Tổng số lớp</span>
            <span className="text-xl font-black text-slate-800">{classes.length} Lớp học</span>
          </div>
          <div className="bg-blue-50/70 rounded-2xl p-3.5 text-center border border-blue-100">
            <span className="text-[11px] font-semibold text-blue-700 block">Số ca dạy / tuần</span>
            <span className="text-xl font-black text-blue-700">{sessions.length} Buổi</span>
          </div>
          <div className="bg-emerald-50/70 rounded-2xl p-3.5 text-center border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">Đội ngũ giáo viên</span>
            <span className="text-xl font-black text-emerald-700">{teachers.length} Thầy cô</span>
          </div>
          <div className="bg-amber-50/70 rounded-2xl p-3.5 text-center border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-700 block">Ca dạy đã chấm công</span>
            <span className="text-xl font-black text-amber-700">{timesheets.filter(t => t.status === 'completed').length} Ca</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ADMIN TAB 1: THỜI KHÓA BIỂU CÁC NGÀY TRONG TUẦN (CÓ MỤC TA VÀ ĐIỀU CHỈNH)
         ========================================================================= */}
      {adminViewMode === 'schedule' && (
        <div className="space-y-4">
          {/* Filter Bar and Action */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Day filter */}
              <div>
                <select
                  value={selectedDayFilter}
                  onChange={(e) => setSelectedDayFilter(e.target.value)}
                  className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">Tất cả các ngày trong tuần</option>
                  {daysOfWeek.map((d) => (
                    <option key={d.value} value={d.value.toString()}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher filter */}
              <div>
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">Tất cả giáo viên</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class filter */}
              <div>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">Tất cả lớp học ({classes.length})</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleOpenAddSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Buổi Học / Lịch Đột Xuất</span>
            </button>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">NGÀY HỌC</th>
                    <th className="py-4 px-4">KHUNG GIỜ</th>
                    <th className="py-4 px-4 sm:px-6">LỚP HỌC</th>
                    <th className="py-4 px-4">GIÁO VIÊN CHÍNH</th>
                    <th className="py-4 px-4">TRỢ GIẢNG (TA)</th>
                    <th className="py-4 px-4">PHÒNG HỌC</th>
                    <th className="py-4 px-4 text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSessions.map((s) => {
                    const cls = classes.find((c) => c.id === s.classId);
                    const teacher = users.find((u) => u.id === s.teacherId);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-black text-xs">
                              {s.dayOfWeekText}
                            </span>
                            {s.isExtraOrMakeUp && (
                              <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                                Đột xuất/Bù
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{s.timeSlot}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <strong className="text-slate-900 block">{cls?.className}</strong>
                          <span className="text-[10px] text-slate-400">
                            {cls?.level} • Sĩ số: {cls?.studentList.length || 0} học viên
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {teacher ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={teacher.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                                alt={teacher.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="font-bold text-slate-800">{teacher.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Chưa phân công</span>
                          )}
                        </td>

                        {/* MỤC TRỢ GIẢNG (TA) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {s.taName ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs">
                              <UserCheck className="w-3 h-3 text-purple-600" />
                              {s.taName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Chưa có TA</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.room}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Fast record shift */}
                            <button
                              onClick={() => {
                                if (onAddTimesheetRecord && teacher && cls) {
                                  onAddTimesheetRecord({
                                    teacherId: teacher.id,
                                    classId: cls.id,
                                    taName: s.taName,
                                    date: new Date().toISOString().substring(0, 10),
                                    timeSlot: s.timeSlot,
                                    room: s.room,
                                    hours: s.durationHours || 1.5,
                                    status: 'completed',
                                    note: `Đã dạy ${s.dayOfWeekText}`,
                                    confirmedByAdmin: true,
                                  });
                                  alert(`Đã chấm công cho ${teacher.name} (${s.durationHours || 1.5} giờ)!`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                              title="Xác nhận đã dạy chấm công"
                            >
                              <Check className="w-4 h-4" />
                            </button>

                            {/* Edit session */}
                            <button
                              onClick={() => handleOpenEditSession(s)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                              title="Điều chỉnh lịch học / Trợ giảng TA"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete session */}
                            {onDeleteSession && (
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa buổi học ${s.dayOfWeekText} của lớp ${cls?.className}?`)) {
                                    onDeleteSession(s.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                title="Xóa buổi học này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN TAB 2: BẢNG CHẤM CÔNG GIÁO VIÊN CHI TIẾT (PAYROLL / TIMESHEET)
         ========================================================================= */}
      {adminViewMode === 'timesheet' && (
        <div className="space-y-6">
          {/* Teacher Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teacherStats.map(({ teacher, totalShifts, completedShifts, totalHours }) => (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={teacher.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                    alt={teacher.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{teacher.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{teacher.email}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Số ca dạy</span>
                    <span className="text-base font-black text-slate-800">{completedShifts} ca</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Tổng giờ dạy</span>
                    <span className="text-base font-black text-blue-700">{totalHours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Timesheet Records Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Nhật Ký Chấm Công Giảng Dạy Của Giáo Viên & Trợ Giảng (TA)
                </h3>
                <p className="text-xs text-slate-500">
                  Dữ liệu dùng để tính lương, đối soát giờ dạy hàng tháng. Admin có thể thêm, sửa, xóa bất kỳ dòng nào.
                </p>
              </div>

              <button
                onClick={handleOpenAddTimesheet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Ca Dạy Mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">NGÀY DẠY</th>
                    <th className="py-4 px-4 sm:px-6">GIÁO VIÊN</th>
                    <th className="py-4 px-4">TRỢ GIẢNG (TA)</th>
                    <th className="py-4 px-4">LỚP HỌC</th>
                    <th className="py-4 px-4">KHUNG GIỜ / SỐ GIỜ</th>
                    <th className="py-4 px-4">GHI CHÚ</th>
                    <th className="py-4 px-4 text-center">TRẠNG THÁI</th>
                    <th className="py-4 px-4 text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {timesheets.map((ts) => {
                    const teacher = users.find((u) => u.id === ts.teacherId);
                    const cls = classes.find((c) => c.id === ts.classId);
                    const isCompleted = ts.status === 'completed';

                    return (
                      <tr key={ts.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {ts.date}
                        </td>

                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={teacher?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                              alt={teacher?.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-bold text-slate-900">{teacher?.name || 'Giáo viên'}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {ts.taName ? (
                            <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 text-xs">
                              {ts.taName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {cls?.className || 'Lớp học'}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-bold text-blue-700 block">{ts.timeSlot}</span>
                          <span className="text-[11px] text-slate-400">Thời lượng: {ts.hours || 1.5} giờ</span>
                        </td>

                        <td className="py-4 px-4 text-slate-600 text-xs max-w-xs">
                          {ts.note || 'Hoàn thành buổi dạy'}
                        </td>

                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : ts.status === 'absent'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            <span>
                              {isCompleted
                                ? 'Đã Chấm Công'
                                : ts.status === 'absent'
                                ? 'Nghỉ phép / Vắng'
                                : 'Chờ duyệt'}
                            </span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditTimesheet(ts)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                              title="Điều chỉnh dòng chấm công"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {onDeleteTimesheetRecord && (
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa ca chấm công ngày ${ts.date} của ${teacher?.name}?`)) {
                                    onDeleteTimesheetRecord(ts.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                title="Xóa ca chấm công"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM / ĐIỀU CHỈNH LỊCH HỌC & TRỢ GIẢNG TA (ADMIN)
         ========================================================================= */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingSession ? 'Điều Chỉnh Lịch Học & Trợ Giảng (TA)' : 'Thêm Buổi Học / Lịch Học Đột Xuất'}
              </h3>
              <button
                onClick={() => setShowSessionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSession} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp Học *</label>
                <select
                  required
                  value={sessionFormData.classId}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giáo Viên Chính *</label>
                  <select
                    required
                    value={sessionFormData.teacherId}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MỤC TRỢ GIẢNG (TA) */}
                <div>
                  <label className="font-bold text-purple-900 block mb-1">
                    Trợ Giảng (TA) Hỗ Trợ Lớp
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Cô Thảo (TA), Thầy Hoàng (TA)..."
                    value={sessionFormData.taName}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, taName: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 bg-purple-50/40 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thứ Trong Tuần *</label>
                  <select
                    value={sessionFormData.dayOfWeek}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, dayOfWeek: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời Lượng (Giờ)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="6"
                    value={sessionFormData.durationHours}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, durationHours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khung Giờ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 18:00 - 19:30"
                    value={sessionFormData.timeSlot}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng Học *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Phòng Lab A201"
                    value={sessionFormData.room}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chủ Đề / Giáo Án Dự Kiến</label>
                <input
                  type="text"
                  placeholder="VD: Unit 5: Speaking Practice & Debate..."
                  value={sessionFormData.sessionTopic}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, sessionTopic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* ĐÁNH DẤU THAY ĐỔI ĐỘT XUẤT HOẶC HỌC BÙ */}
              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950 text-xs">
                  <input
                    type="checkbox"
                    checked={sessionFormData.isExtraOrMakeUp}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, isExtraOrMakeUp: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Đánh dấu: Buổi học thay đổi đột xuất / Ca học bù</span>
                </label>

                {sessionFormData.isExtraOrMakeUp && (
                  <div>
                    <label className="font-semibold text-amber-900 block text-[11px] mb-1">
                      Lý do thay đổi đột xuất (Phụ huynh và Giáo viên sẽ thấy thông báo này):
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Nghỉ lễ dời sang Thứ 7, hoặc Thầy Robert đổi lịch công tác..."
                      value={sessionFormData.changeNote}
                      onChange={(e) => setSessionFormData({ ...sessionFormData, changeNote: e.target.value })}
                      className="w-full px-3 py-1.5 border border-amber-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900 shadow-xs"
                >
                  {editingSession ? 'Lưu Điều Chỉnh' : 'Tạo Lịch Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM / SỬA CA CHẤM CÔNG GIÁO VIÊN (ADMIN)
         ========================================================================= */}
      {showTimesheetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingTimesheet ? 'Điều Chỉnh Ca Chấm Công' : 'Ghi Nhận Ca Dạy & Chấm Công Mới'}
              </h3>
              <button
                onClick={() => setShowTimesheetModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTimesheet} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Giáo Viên Đứng Lớp *</label>
                <select
                  required
                  value={timesheetFormData.teacherId}
                  onChange={(e) => setTimesheetFormData({ ...timesheetFormData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp Học *</label>
                <select
                  required
                  value={timesheetFormData.classId}
                  onChange={(e) => setTimesheetFormData({ ...timesheetFormData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* MỤC TRỢ GIẢNG (TA) */}
              <div>
                <label className="font-bold text-purple-900 block mb-1">
                  Trợ Giảng (TA) Cùng Ca
                </label>
                <input
                  type="text"
                  placeholder="VD: Cô Thảo (TA)..."
                  value={timesheetFormData.taName}
                  onChange={(e) => setTimesheetFormData({ ...timesheetFormData, taName: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Dạy *</label>
                  <input
                    type="date"
                    required
                    value={timesheetFormData.date}
                    onChange={(e) => setTimesheetFormData({ ...timesheetFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Giờ Dạy *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    required
                    value={timesheetFormData.hours}
                    onChange={(e) => setTimesheetFormData({ ...timesheetFormData, hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khung Giờ</label>
                  <input
                    type="text"
                    value={timesheetFormData.timeSlot}
                    onChange={(e) => setTimesheetFormData({ ...timesheetFormData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng Thái</label>
                  <select
                    value={timesheetFormData.status}
                    onChange={(e) => setTimesheetFormData({ ...timesheetFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  >
                    <option value="completed">Đã dạy hoàn thành (Hợp lệ)</option>
                    <option value="scheduled">Sắp diễn ra</option>
                    <option value="absent">Nghỉ phép / Vắng</option>
                    <option value="substitute">Dạy thay / Bù</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Tiến Độ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã dạy xong Unit 4 Speaking..."
                  value={timesheetFormData.note}
                  onChange={(e) => setTimesheetFormData({ ...timesheetFormData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTimesheetModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
                >
                  {editingTimesheet ? 'Lưu Thay Đổi' : 'Xác Nhận Chấm Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
