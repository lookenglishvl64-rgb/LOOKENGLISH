import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AttendanceModel, AttendanceStatus, ClassModel, UserModel, UserRole } from '../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Save,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface AttendanceManagerProps {
  classes: ClassModel[];
  users: UserModel[];
  attendance: AttendanceModel[];
  currentRole: UserRole;
  currentUserId?: string;
  childStudentId?: string;
  onSaveBatchAttendance: (items: AttendanceModel[]) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  classes,
  users,
  attendance,
  currentRole,
  currentUserId,
  childStudentId,
  onSaveBatchAttendance,
}) => {
  const isParent = currentRole === 'parent';
  const child = isParent
    ? users.find((u) => u.id === (childStudentId || 'usr_student_2'))
    : null;

  const [selectedClassId, setSelectedClassId] = useState<string>(
    child?.classId || classes[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'history'>('daily');

  // Local draft state for attendance records on selected date
  const [localRecords, setLocalRecords] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // If teacher or admin: all students in class
  // If parent: strictly their child only!
  const enrolledStudents = isParent && child
    ? [child]
    : selectedClass
    ? users.filter((u) => selectedClass.studentList.includes(u.id) || u.classId === selectedClass.id)
    : [];

  // Child attendance history for parent
  const childAttendanceHistory = isParent && child
    ? attendance.filter((a) => a.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const getStudentAttendance = (studentId: string): { status: AttendanceStatus; note: string } => {
    if (localRecords[studentId]) {
      return localRecords[studentId];
    }
    const found = attendance.find(
      (a) => a.classId === selectedClassId && a.studentId === studentId && a.date === selectedDate
    );
    if (found) {
      return { status: found.status as AttendanceStatus, note: found.note || '' };
    }
    return { status: 'present', note: '' };
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (isParent) return; // Parents cannot edit attendance
    const current = getStudentAttendance(studentId);
    setLocalRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...current,
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    if (isParent) return;
    const current = getStudentAttendance(studentId);
    setLocalRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...current,
        note,
      },
    }));
  };

  const applyQuickTag = (studentId: string, tag: string, targetStatus?: AttendanceStatus) => {
    if (isParent) return;
    const current = getStudentAttendance(studentId);
    const updatedNote = current.note ? `${current.note}, ${tag}` : tag;
    handleNoteChange(studentId, updatedNote);
    if (targetStatus) {
      handleStatusChange(studentId, targetStatus);
    }
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (isParent) return;
    const newDraft: Record<string, { status: AttendanceStatus; note: string }> = {};
    enrolledStudents.forEach((stu) => {
      const cur = getStudentAttendance(stu.id);
      newDraft[stu.id] = {
        ...cur,
        status,
      };
    });
    setLocalRecords(newDraft);
  };

  const handleSaveAll = () => {
    const itemsToSave: AttendanceModel[] = enrolledStudents.map((stu) => {
      const rec = getStudentAttendance(stu.id);
      return {
        id: `att_${selectedClassId}_${stu.id}_${selectedDate}`,
        classId: selectedClassId,
        studentId: stu.id,
        date: selectedDate,
        status: rec.status,
        note: rec.note,
      };
    });

    onSaveBatchAttendance(itemsToSave);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3500);
  };

  const changeDateByDays = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().substring(0, 10));
    setLocalRecords({});
  };

  // If Parent role: Display dedicated Child Attendance Diary
  if (isParent && child) {
    const totalSessions = childAttendanceHistory.length;
    const presentSessions = childAttendanceHistory.filter((a) => a.status === 'present').length;
    const lateSessions = childAttendanceHistory.filter((a) => a.status === 'late').length;
    const excusedSessions = childAttendanceHistory.filter((a) => a.status === 'excused').length;
    const absentSessions = childAttendanceHistory.filter((a) => a.status === 'absent').length;
    const rate = totalSessions > 0 ? Math.round(((presentSessions + lateSessions) / totalSessions) * 100) : 100;

    return (
      <div className="space-y-6">
        {/* Banner for Parent */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Sổ Điểm Danh Điện Tử Của Con</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Chuyên Cần Của Bé {child.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lớp: <strong className="text-blue-800">{selectedClass?.className || 'IELTS Intensive 6.5+'}</strong> • Giáo viên chủ nhiệm cập nhật hàng buổi.
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Có mặt</span>
                <span className="text-base sm:text-lg font-black text-emerald-800">{presentSessions} buổi</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Đi muộn</span>
                <span className="text-base sm:text-lg font-black text-amber-800">{lateSessions} buổi</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-2 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Có phép</span>
                <span className="text-base sm:text-lg font-black text-blue-800">{excusedSessions} buổi</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Tỷ lệ</span>
                <span className="text-base sm:text-lg font-black text-rose-800">{rate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Child Attendance History Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Nhật Ký Điểm Danh & Lời Nhắn Của Giáo Viên
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Tổng số {totalSessions} buổi đã ghi nhận
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {childAttendanceHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Chưa có dữ liệu điểm danh nào được ghi nhận.
              </div>
            ) : (
              childAttendanceHistory.map((rec) => {
                const isPresent = rec.status === 'present';
                const isLate = rec.status === 'late';
                const isExcused = rec.status === 'excused';

                return (
                  <div key={rec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Ngày {rec.date}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full border ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isLate
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isExcused
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isLate ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : isExcused ? (
                          <Info className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isPresent
                            ? 'Có Mặt Đúng Giờ'
                            : isLate
                            ? 'Đi Muộn / Vào Trễ'
                            : isExcused
                            ? 'Vắng Có Phép'
                            : 'Vắng Không Phép'}
                        </span>
                      </span>
                    </div>

                    <div className="flex-1 sm:max-w-md text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Ghi chú của giáo viên:</span>
                      <p className="text-slate-800 font-medium italic mt-0.5">
                        "{rec.note || 'Học sinh tham gia lớp học đầy đủ, tích cực.'}"
                      </p>
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

  // Teacher or Admin View: Calculate Daily Headcount
  const totalEnrolled = enrolledStudents.length;
  const presentCount = enrolledStudents.filter(
    (stu) => getStudentAttendance(stu.id).status === 'present'
  ).length;
  const lateCount = enrolledStudents.filter(
    (stu) => getStudentAttendance(stu.id).status === 'late'
  ).length;
  const excusedCount = enrolledStudents.filter(
    (stu) => getStudentAttendance(stu.id).status === 'excused'
  ).length;
  const absentCount = enrolledStudents.filter(
    (stu) => getStudentAttendance(stu.id).status === 'absent'
  ).length;

  const attendanceRate = totalEnrolled > 0
    ? Math.round(((presentCount + lateCount) / totalEnrolled) * 100)
    : 100;

  // Filter students by selected status
  const visibleStudents = enrolledStudents.filter((stu) => {
    if (statusFilter === 'all') return true;
    return getStudentAttendance(stu.id).status === statusFilter;
  });

  // Calculate past daily headcounts for the class
  const classAttendanceRecords = attendance.filter((a) => a.classId === selectedClassId);
  const datesSet = Array.from(new Set(classAttendanceRecords.map((a) => a.date))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* ========================================================
          TOP BANNER & CONTROLS
         ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Điểm Danh Học Viên & Chốt Sĩ Số Lớp Mỗi Ngày</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Sĩ Số & Chuyên Cần Hàng Ngày
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi chính xác từng học viên có mặt, vắng phép, đi muộn và chốt sĩ số tự động mỗi buổi học.
            </p>
          </div>

          {/* Quick Selectors & Date Stepper */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Lớp Học:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setLocalRecords({});
                }}
                className="text-xs sm:text-sm font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className} ({cls.studentList?.length || 0} học viên)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Ngày Điểm Danh:
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => changeDateByDays(-1)}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold"
                  title="Ngày trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setLocalRecords({});
                  }}
                  className="text-xs sm:text-sm font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => changeDateByDays(1)}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold"
                  title="Ngày sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().substring(0, 10));
                    setLocalRecords({});
                  }}
                  className="px-2.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl"
                >
                  Hôm nay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            DAILY CLASS HEADCOUNT SUMMARY (SĨ SỐ LỚP MỖI NGÀY)
           ======================================================== */}
        <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <span className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                Báo Cáo Sĩ Số Ngày: {selectedDate} • Lớp {selectedClass?.className}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tỷ lệ tham gia: {attendanceRate}%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Tổng Sĩ Số</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">{totalEnrolled}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">học viên</span>
            </div>

            <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-200 shadow-2xs text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">Có Mặt</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">{presentCount}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">đúng giờ</span>
            </div>

            <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200 shadow-2xs text-center">
              <span className="text-[11px] font-bold text-amber-700 uppercase block">Đi Muộn</span>
              <span className="text-xl sm:text-2xl font-black text-amber-700">{lateCount}</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">vào trễ</span>
            </div>

            <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-200 shadow-2xs text-center">
              <span className="text-[11px] font-bold text-blue-700 uppercase block">Vắng Có Phép</span>
              <span className="text-xl sm:text-2xl font-black text-blue-700">{excusedCount}</span>
              <span className="text-[10px] text-blue-600 block mt-0.5">có đơn xin</span>
            </div>

            <div className="bg-rose-50/80 rounded-xl p-3 border border-rose-200 shadow-2xs text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-rose-700 uppercase block">Vắng Không Phép</span>
              <span className="text-xl sm:text-2xl font-black text-rose-700">{absentCount}</span>
              <span className="text-[10px] text-rose-600 block mt-0.5">cần liên hệ PH</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="font-bold text-slate-500 mr-1">Thao tác nhanh:</span>
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold transition-colors inline-flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Toàn bộ có mặt</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold transition-colors inline-flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Đặt vắng tất cả</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Chốt Sĩ Số Ngày ({selectedDate})</span>
            </button>
          </div>

          {saveSuccessMessage && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between animate-fade-in shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã lưu thành công dữ liệu điểm danh và chốt sĩ số ngày {selectedDate}!</span>
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">Tự động đồng bộ</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          SUB-TABS: ĐIỂM DANH HÔM NAY VS LỊCH SỬ SĨ SỐ CÁC NGÀY
         ======================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'daily'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📋 Danh Sách Điểm Danh Học Viên ({enrolledStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'history'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📊 Lịch Sử Sĩ Số Các Ngày Trước ({datesSet.length} ngày)
          </button>
        </div>

        {activeTab === 'daily' && (
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-bold py-1 px-2.5 bg-white border border-slate-200 rounded-xl"
            >
              <option value="all">Tất Cả ({enrolledStudents.length})</option>
              <option value="present">Có Mặt ({presentCount})</option>
              <option value="late">Đi Muộn ({lateCount})</option>
              <option value="excused">Có Phép ({excusedCount})</option>
              <option value="absent">Vắng ({absentCount})</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: DAILY STUDENT ATTENDANCE LIST */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {visibleStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Không tìm thấy học viên nào phù hợp với bộ lọc.
              </div>
            ) : (
              visibleStudents.map((student, index) => {
                const record = getStudentAttendance(student.id);

                return (
                  <div
                    key={student.id}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3.5 sm:min-w-[260px]">
                      <span className="font-mono text-xs font-bold text-slate-400 w-5">
                        #{index + 1}
                      </span>
                      <img
                        src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'}
                        alt={student.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">
                          {student.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400">
                            {student.studentCode || 'LK-STAR'}
                          </span>
                          <span className="text-[10px] text-blue-700 font-semibold">
                            {student.phone || '09xx xxx xxx'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Status Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Có mặt */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          record.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Có mặt</span>
                      </button>

                      {/* Đi muộn */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          record.status === 'late'
                            ? 'bg-amber-500 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Đi muộn</span>
                      </button>

                      {/* Vắng có phép */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'excused')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          record.status === 'excused'
                            ? 'bg-blue-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Có phép</span>
                      </button>

                      {/* Vắng không phép */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          record.status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Vắng KP</span>
                      </button>
                    </div>

                    {/* Quick Tags & Teacher Note Input */}
                    <div className="flex-1 lg:max-w-md space-y-1.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Gắn thẻ:</span>
                        <button
                          type="button"
                          onClick={() => applyQuickTag(student.id, 'Vào trễ 10p', 'late')}
                          className="text-[10px] bg-amber-50 text-amber-800 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200"
                        >
                          + Vào trễ 10p
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTag(student.id, 'Gia đình xin phép', 'excused')}
                          className="text-[10px] bg-blue-50 text-blue-800 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200"
                        >
                          + Xin phép
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTag(student.id, 'Sốt / Nghỉ ốm', 'excused')}
                          className="text-[10px] bg-rose-50 text-rose-800 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200"
                        >
                          + Nghỉ ốm
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTag(student.id, 'Hăng hái phát biểu')}
                          className="text-[10px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200"
                        >
                          + Hăng hái
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Ghi chú chi tiết cho học viên..."
                        value={record.note}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HISTORICAL DAILY HEADCOUNT (SỔ SĨ SỐ CÁC NGÀY TRƯỚC) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Sổ Thống Kê Sĩ Số Hàng Ngày Của Lớp {selectedClass?.className}
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Dữ liệu được lưu trữ tự động
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Ngày Học</th>
                  <th className="p-3.5">Sĩ Số Tổng</th>
                  <th className="p-3.5">Có Mặt</th>
                  <th className="p-3.5">Đi Muộn</th>
                  <th className="p-3.5">Vắng Có Phép</th>
                  <th className="p-3.5">Vắng Không Phép</th>
                  <th className="p-3.5">Tỷ Lệ Chuyên Cần</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {datesSet.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Chưa có ngày học nào được lưu trữ sĩ số.
                    </td>
                  </tr>
                ) : (
                  datesSet.map((d) => {
                    const dayRecords = attendance.filter((a) => a.classId === selectedClassId && a.date === d);
                    const dayTotal = dayRecords.length;
                    const dayPresent = dayRecords.filter((a) => a.status === 'present').length;
                    const dayLate = dayRecords.filter((a) => a.status === 'late').length;
                    const dayExcused = dayRecords.filter((a) => a.status === 'excused').length;
                    const dayAbsent = dayRecords.filter((a) => a.status === 'absent').length;
                    const dayRate = dayTotal > 0 ? Math.round(((dayPresent + dayLate) / dayTotal) * 100) : 100;

                    return (
                      <tr key={d} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold font-mono text-slate-900">
                          {d}
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {dayTotal} học viên
                        </td>
                        <td className="p-3.5 text-emerald-700 font-bold">
                          {dayPresent}
                        </td>
                        <td className="p-3.5 text-amber-700 font-bold">
                          {dayLate}
                        </td>
                        <td className="p-3.5 text-blue-700 font-bold">
                          {dayExcused}
                        </td>
                        <td className="p-3.5 text-rose-700 font-bold">
                          {dayAbsent}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                              dayRate >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : dayRate >= 75
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {dayRate}%
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDate(d);
                              setActiveTab('daily');
                            }}
                            className="text-xs text-blue-700 hover:text-blue-900 font-bold"
                          >
                            Xem & Sửa Buổi Này →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
