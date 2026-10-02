import React, { useState } from 'react';
import { GradeModel, SkillType, UserModel, UserRole } from '../types';
import {
  Award,
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  FileCheck2,
  Plus,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';

interface AcademicGradesManagerProps {
  grades: GradeModel[];
  users: UserModel[];
  classes?: ClassModel[];
  currentRole: UserRole;
  currentUserId: string;
  onAddGrade: (grade: Omit<GradeModel, 'id'>) => void;
}

export const AcademicGradesManager: React.FC<AcademicGradesManagerProps> = ({
  grades,
  users,
  classes = [],
  currentRole,
  currentUserId,
  onAddGrade,
}) => {
  const allStudents = users.filter((u) => u.role === 'student');
  const students = currentRole === 'teacher' && classes.length > 0
    ? allStudents.filter((s) => classes.some((c) => c.studentList.includes(s.id) || s.classId === c.id))
    : allStudents;
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentRole === 'student'
      ? currentUserId
      : currentRole === 'parent'
      ? users.find((u) => u.id === currentUserId)?.parentOfStudentId || students[0]?.id || ''
      : students[0]?.id || ''
  );
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);

  // Form state
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [newSkill, setNewSkill] = useState<SkillType>('listening');
  const [newScore, setNewScore] = useState<number>(8.0);
  const [newComment, setNewComment] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().substring(0, 10));

  const currentStudent = users.find((u) => u.id === selectedStudentId);

  // Filtered grades for current student
  const studentGrades = grades.filter((g) => g.studentId === selectedStudentId);
  const displayGrades = selectedSkillFilter === 'all'
    ? studentGrades
    : studentGrades.filter((g) => g.skill === selectedSkillFilter);

  // Average calculations
  const calculateAverage = (skill?: SkillType) => {
    const list = skill ? studentGrades.filter((g) => g.skill === skill) : studentGrades;
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.score, 0);
    return Number((sum / list.length).toFixed(1));
  };

  const avgOverall = calculateAverage();
  const avgListening = calculateAverage('listening');
  const avgSpeaking = calculateAverage('speaking');
  const avgReading = calculateAverage('reading');
  const avgWriting = calculateAverage('writing');
  const avgTest = calculateAverage('test');

  const skillConfig: Record<SkillType, { label: string; icon: any; color: string; bg: string }> = {
    listening: {
      label: 'Nghe (Listening)',
      icon: Headphones,
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-200',
    },
    speaking: {
      label: 'Nói (Speaking)',
      icon: Mic,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
    reading: {
      label: 'Đọc (Reading)',
      icon: BookOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    writing: {
      label: 'Viết (Writing)',
      icon: PenTool,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200',
    },
    test: {
      label: 'Kiểm Tra Định Kỳ',
      icon: FileCheck2,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200',
    },
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGrade({
      studentId: targetStudentId,
      skill: newSkill,
      score: Number(newScore),
      date: newDate,
      comment: newComment,
    });
    setNewComment('');
    setShowAddGradeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Sổ Điểm 4 Kỹ Năng & Bài Thi Định Kỳ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bảng Điểm Học Tập Toàn Diện
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Chuẩn hóa theo thang điểm quốc tế (IELTS Band 0 - 9 hoặc Thang điểm 10).
            </p>
          </div>

          {/* Student Selector & Action */}
          <div className="flex flex-wrap items-center gap-3">
            {/* ONLY Admin and Teacher can switch students. Parents CANNOT switch students! */}
            {(currentRole === 'admin' || currentRole === 'teacher') && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Chọn Học Viên:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="text-xs sm:text-sm font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Parent badge (cannot switch to other students in the class) */}
            {currentRole === 'parent' && currentStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Học viên của Quý Phụ huynh:</span>
                <span className="font-extrabold text-blue-900 text-sm">{currentStudent.name}</span>
              </div>
            )}

            {(currentRole === 'teacher' || currentRole === 'admin') && (
              <button
                onClick={() => {
                  setTargetStudentId(selectedStudentId);
                  setShowAddGradeModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 sm:mt-0 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nhập Điểm Số Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Skills Overview Cards */}
        {currentStudent && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img
                  src={currentStudent.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                  alt={currentStudent.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="font-bold text-slate-800 text-sm">
                  Tổng quan năng lực: {currentStudent.name}
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Overall: {avgOverall > 0 ? avgOverall : 'Chưa có điểm'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-center">
                <div className="flex items-center justify-center gap-1 text-sky-700 mb-1">
                  <Headphones className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Nghe</span>
                </div>
                <span className="text-xl font-extrabold text-sky-800">{avgListening || '--'}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-700 mb-1">
                  <Mic className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Nói</span>
                </div>
                <span className="text-xl font-extrabold text-amber-800">{avgSpeaking || '--'}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Đọc</span>
                </div>
                <span className="text-xl font-extrabold text-emerald-800">{avgReading || '--'}</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <div className="flex items-center justify-center gap-1 text-purple-700 mb-1">
                  <PenTool className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Viết</span>
                </div>
                <span className="text-xl font-extrabold text-purple-800">{avgWriting || '--'}</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
                <div className="flex items-center justify-center gap-1 text-rose-700 mb-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Kiểm Tra</span>
                </div>
                <span className="text-xl font-extrabold text-rose-800">{avgTest || '--'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Scores Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Lịch Sử Điểm Chi Tiết ({displayGrades.length} đầu điểm)</span>
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="text-xs font-semibold py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả kỹ năng</option>
              <option value="listening">Nghe (Listening)</option>
              <option value="speaking">Nói (Speaking)</option>
              <option value="reading">Đọc (Reading)</option>
              <option value="writing">Viết (Writing)</option>
              <option value="test">Kiểm tra định kỳ</option>
            </select>
          </div>
        </div>

        {displayGrades.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Học viên này chưa có bản ghi điểm cho mục đã chọn.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayGrades.map((grd) => {
              const config = skillConfig[grd.skill];
              const SkillIcon = config.icon;

              return (
                <div
                  key={grd.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border ${config.bg} shrink-0`}>
                      <SkillIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {config.label}
                        </span>
                        <span className="text-[11px] text-slate-400">Ngày {grd.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {grd.comment || 'Chưa có nhận xét chi tiết của giáo viên.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-3 py-1 rounded-xl text-lg font-black bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                      {grd.score.toFixed(1)}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                      Thang 10 / IELTS Band
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD GRADE */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Nhập Điểm Số Mới</h3>
              <button
                onClick={() => setShowAddGradeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Học Viên *</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kỹ Năng / Phần Học *</label>
                <select
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value as SkillType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="listening">Nghe (Listening)</option>
                  <option value="speaking">Nói (Speaking)</option>
                  <option value="reading">Đọc (Reading)</option>
                  <option value="writing">Viết (Writing)</option>
                  <option value="test">Kiểm tra định kỳ (Periodic Test)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Điểm Số (0 - 10) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={newScore}
                    onChange={(e) => setNewScore(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Chấm *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nhận Xét Chuyên Môn Của Giáo Viên
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Em phát âm chuẩn ngữ điệu, cần đa dạng linking words..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Lưu Vào Bảng Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
