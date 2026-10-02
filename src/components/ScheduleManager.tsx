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
  onAddTimesheetRecord?: (record: Omit<TeacherTimesheetModel, 'id'>) => void;
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
  onAddTimesheetRecord,
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

  // Timesheet Modal for Admin
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [timesheetFormData, setTimesheetFormData] = useState({
    teacherId: users.find((u) => u.role === 'teacher')?.id || '',
    classId: classes[0]?.id || '',
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
    { value: '1', label: 'Thứ Hai' },
    { value: '2', label: 'Thứ Ba' },
    { value: '3', label: 'Thứ Tư' },
    { value: '4', label: 'Thứ Năm' },
    { value: '5', label: 'Thứ Sáu' },
    { value: '6', label: 'Thứ Bảy' },
    { value: '0', label: 'Chủ Nhật' },
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

  const handleCreateTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddTimesheetRecord) return;
    onAddTimesheetRecord({
      ...timesheetFormData,
      confirmedByAdmin: true,
    });
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
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{s.dayOfWeekText}</span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.timeSlot}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Nội dung dự kiến: <strong className="text-slate-800">"{s.sessionTopic || 'Luyện phản xạ giao tiếp & từ vựng theo chủ đề'}"</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.room}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 font-bold">
                      <img
                        src={teacher?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                        alt={teacher?.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{teacher?.name || 'Giáo viên phụ trách'}</span>
                    </div>
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
                Theo dõi ca dạy, phòng học và số giờ giảng dạy được hệ thống tự động ghi nhận chấm công.
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
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 text-sm font-black">{cls?.className}</strong>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.timeSlot}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {s.dayOfWeekText} • Giáo án: <strong>"{s.sessionTopic || 'Giảng dạy chuẩn khung Cambridge/IELTS'}"</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.room}</span>
                      </div>
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
              Lịch Học Trung Tâm & Chấm Công
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Admin theo dõi ngày nào có lớp học nào, phòng học và giáo viên phụ trách để chấm công, tính giờ dạy chính xác.
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
          ADMIN TAB 1: THỜI KHÓA BIỂU CÁC NGÀY TRONG TUẦN
         ========================================================================= */}
      {adminViewMode === 'schedule' && (
        <div className="space-y-4">
          {/* Filter Bar */}
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
                    <option key={d.value} value={d.value}>
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
              onClick={() => {
                setShowTimesheetModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhận Buổi Dạy Chấm Công</span>
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
                    <th className="py-4 px-4">GIÁO VIÊN ĐỨNG LỚP</th>
                    <th className="py-4 px-4">PHÒNG HỌC</th>
                    <th className="py-4 px-4 text-center">CHẤM CÔNG NHANH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSessions.map((s) => {
                    const cls = classes.find((c) => c.id === s.classId);
                    const teacher = users.find((u) => u.id === s.teacherId);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-black text-xs">
                            {s.dayOfWeekText}
                          </span>
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

                        <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.room}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (onAddTimesheetRecord && teacher && cls) {
                                onAddTimesheetRecord({
                                  teacherId: teacher.id,
                                  classId: cls.id,
                                  date: new Date().toISOString().substring(0, 10),
                                  timeSlot: s.timeSlot,
                                  room: s.room,
                                  hours: s.durationHours || 1.5,
                                  status: 'completed',
                                  note: `Đã dạy buổi ${s.dayOfWeekText}`,
                                  confirmedByAdmin: true,
                                });
                                alert(`Đã ghi nhận chấm công cho ${teacher.name} (${s.durationHours || 1.5} giờ)!`);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Xác Nhận Đã Dạy</span>
                          </button>
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
                  Nhật Ký Chấm Công Giảng Dạy Của Giáo Viên
                </h3>
                <p className="text-xs text-slate-500">
                  Dữ liệu dùng để tính lương, đối soát giờ dạy hàng tháng.
                </p>
              </div>

              <button
                onClick={() => setShowTimesheetModal(true)}
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
                    <th className="py-4 px-4">LỚP HỌC</th>
                    <th className="py-4 px-4">KHUNG GIỜ / SỐ GIỜ</th>
                    <th className="py-4 px-4">GHI CHÚ GIÁO ÁN</th>
                    <th className="py-4 px-4 text-center">TRẠNG THÁI</th>
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

                        <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {cls?.className || 'Lớp học'}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-bold text-blue-700 block">{ts.timeSlot}</span>
                          <span className="text-[11px] text-slate-400">Thời lượng: {ts.hours || 1.5} giờ</span>
                        </td>

                        <td className="py-4 px-4 text-slate-600 text-xs max-w-xs">
                          {ts.note || 'Hoàn thành buổi dạy theo tiến độ'}
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
                                ? 'Đã Chấm Công (Hợp lệ)'
                                : ts.status === 'absent'
                                ? 'Nghỉ phép / Vắng'
                                : 'Chờ xác nhận'}
                            </span>
                          </span>
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
          MODAL: THÊM CA DẠY CHẤM CÔNG MỚI (DÀNH CHO ADMIN)
         ========================================================================= */}
      {showTimesheetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                Ghi Nhận Ca Dạy & Chấm Công
              </h3>
              <button
                onClick={() => setShowTimesheetModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTimesheet} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chọn Giáo Viên Đứng Lớp *</label>
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
                  <label className="font-bold text-slate-700 block mb-1">Phòng Học</label>
                  <input
                    type="text"
                    value={timesheetFormData.room}
                    onChange={(e) => setTimesheetFormData({ ...timesheetFormData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Tiến Độ Dạy</label>
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
                  Xác Nhận Chấm Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
