import React, { useState } from 'react';
import { AttendanceModel, ClassModel, UserModel, UserRole } from '../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  FileEdit,
  Save,
  Clock,
  Sparkles,
  Info,
  Check,
  User,
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
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // Local draft state for attendance records on selected date
  const [localRecords, setLocalRecords] = useState<Record<string, { status: 'present' | 'absent'; note: string }>>({});

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // If teacher or admin: all students in class
  // If parent: strictly their child only!
  const enrolledStudents = isParent && child
    ? [child]
    : selectedClass
    ? users.filter((u) => selectedClass.studentList.includes(u.id))
    : [];

  // Child attendance history for parent
  const childAttendanceHistory = isParent && child
    ? attendance.filter((a) => a.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const getStudentAttendance = (studentId: string) => {
    if (localRecords[studentId]) {
      return localRecords[studentId];
    }
    const found = attendance.find(
      (a) => a.classId === selectedClassId && a.studentId === studentId && a.date === selectedDate
    );
    if (found) {
      return { status: found.status, note: found.note || '' };
    }
    return { status: 'present' as const, note: '' };
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
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

  const applyQuickTag = (studentId: string, tag: string) => {
    if (isParent) return;
    const current = getStudentAttendance(studentId);
    const updatedNote = current.note ? `${current.note}, ${tag}` : tag;
    handleNoteChange(studentId, updatedNote);
    if (tag.includes('Vắng') || tag.includes('Nghỉ')) {
      handleStatusChange(studentId, 'absent');
    }
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
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  // If Parent role: Display dedicated Child Attendance Diary
  if (isParent && child) {
    const totalSessions = childAttendanceHistory.length;
    const presentSessions = childAttendanceHistory.filter((a) => a.status === 'present').length;
    const absentSessions = totalSessions - presentSessions;
    const rate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

    return (
      <div className="space-y-6">
        {/* Banner for Parent */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
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
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Có mặt</span>
                <span className="text-lg font-black text-emerald-800">{presentSessions} buổi</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Nghỉ học</span>
                <span className="text-lg font-black text-rose-800">{absentSessions} buổi</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Tỷ lệ</span>
                <span className="text-lg font-black text-blue-800">{rate}%</span>
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
            <span className="text-xs text-slate-500">
              Tổng số {totalSessions} buổi đã học
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {childAttendanceHistory.map((rec) => {
              const isPresent = rec.status === 'present';
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
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{isPresent ? 'Có Mặt Đúng Giờ' : 'Vắng Mặt'}</span>
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
            })}
          </div>
        </div>
      </div>
    );
  }

  // Teacher or Admin View
  const totalEnrolled = enrolledStudents.length;
  const presentCount = enrolledStudents.filter(
    (stu) => getStudentAttendance(stu.id).status === 'present'
  ).length;
  const absentCount = totalEnrolled - presentCount;
  const attendanceRate = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Sổ Điểm Danh Điện Tử Hàng Ngày</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Điểm Danh & Ghi Chú Chi Tiết
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Giáo viên ghi nhận chuyên cần, lý do vắng hoặc thái độ học tập của từng học viên trong buổi học.
            </p>
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Chọn Lớp Học:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setLocalRecords({});
                }}
                className="text-xs sm:text-sm font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className} ({cls.studentList.length} học viên)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Ngày Điểm Danh:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setLocalRecords({});
                }}
                className="text-xs sm:text-sm font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Live Attendance Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Sĩ số lớp</span>
            <span className="text-xl font-extrabold text-slate-800">{totalEnrolled} học viên</span>
          </div>
          <div className="bg-emerald-50/70 rounded-xl p-3 text-center border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">Có mặt</span>
            <span className="text-xl font-extrabold text-emerald-600">{presentCount}</span>
          </div>
          <div className="bg-rose-50/70 rounded-xl p-3 text-center border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-700 block">Vắng mặt</span>
            <span className="text-xl font-extrabold text-rose-600">{absentCount}</span>
          </div>
          <div className="bg-blue-50/70 rounded-xl p-3 text-center border border-blue-100">
            <span className="text-[11px] font-semibold text-blue-700 block">Tỷ lệ chuyên cần</span>
            <span className="text-xl font-extrabold text-blue-600">{attendanceRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Student Attendance List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 text-sm">
              Danh Sách Học Viên Ngày {selectedDate} ({selectedClass?.className})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessMessage && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" /> Đã lưu sổ điểm danh!
              </span>
            )}
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Sổ Điểm Danh</span>
            </button>
          </div>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Lớp học này chưa có học viên nào.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {enrolledStudents.map((student, idx) => {
              const current = getStudentAttendance(student.id);
              const isPresent = current.status === 'present';

              return (
                <div
                  key={student.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    !isPresent ? 'bg-rose-50/20' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isPresent
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Có Mặt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          !isPresent
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Vắng Mặt</span>
                      </button>
                    </div>

                    {/* Note Input with Quick Tag chips */}
                    <div className="flex-1 max-w-lg space-y-1.5">
                      <div className="relative">
                        <FileEdit className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Ghi chú chi tiết lý do vắng hoặc lưu ý trong buổi học..."
                          value={current.note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      {/* Quick Tag Suggestion Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-medium mr-1">Gợi ý nhanh:</span>
                        <button
                          type="button"
                          onClick={() => applyQuickTag(student.id, 'Nghỉ ốm có phép từ phụ huynh')}
                          className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                        >
                          + Nghỉ ốm có phép
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTag(student.id, 'Vào lớp muộn 15p')}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                        >
                          + Vào muộn 15p
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickTag(student.id, 'Tích cực phát biểu, hiểu bài tốt')}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                        >
                          + Hăng hái phát biểu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
