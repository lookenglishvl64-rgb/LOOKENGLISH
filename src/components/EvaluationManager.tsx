import React, { useState } from 'react';
import { EvaluationModel, EvaluationType, UserModel, UserRole } from '../types';
import {
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  Plus,
  MessageSquareQuote,
  Filter,
  User,
} from 'lucide-react';

interface EvaluationManagerProps {
  evaluations: EvaluationModel[];
  users: UserModel[];
  classes?: ClassModel[];
  currentRole: UserRole;
  currentUserId: string;
  onAddEvaluation: (evaluation: Omit<EvaluationModel, 'id'>) => void;
}

export const EvaluationManager: React.FC<EvaluationManagerProps> = ({
  evaluations,
  users,
  classes = [],
  currentRole,
  currentUserId,
  onAddEvaluation,
}) => {
  const allStudents = users.filter((u) => u.role === 'student');

  // If teacher, only allow praising/disciplining students in teacher's assigned classes
  const students = currentRole === 'teacher' && classes.length > 0
    ? allStudents.filter((s) => classes.some((c) => c.studentList.includes(s.id) || s.classId === c.id))
    : allStudents;
  const teachers = users.filter((u) => u.role === 'teacher');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [evalType, setEvalType] = useState<EvaluationType>('praise');
  const [teacherNote, setTeacherNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  const typeConfig: Record<EvaluationType, { label: string; icon: any; badgeBg: string; border: string }> = {
    reward: {
      label: 'Khen Thưởng Đặc Biệt',
      icon: Sparkles,
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      border: 'border-l-4 border-l-amber-500',
    },
    praise: {
      label: 'Biểu Dương / Tích Cực',
      icon: ThumbsUp,
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      border: 'border-l-4 border-l-emerald-500',
    },
    discipline: {
      label: 'Phê Bình / Nhắc Nhở',
      icon: AlertTriangle,
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      border: 'border-l-4 border-l-rose-500',
    },
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNote.trim()) return;

    onAddEvaluation({
      studentId: targetStudentId,
      type: evalType,
      teacherNote,
      date,
      teacherId: currentUserId,
    });

    setTeacherNote('');
    setShowAddModal(false);
  };

  // Filtered list
  const filteredEvaluations = evaluations.filter((ev) => {
    if (filterType !== 'all' && ev.type !== filterType) return false;
    if (filterStudentId !== 'all' && ev.studentId !== filterStudentId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Sổ Đánh Giá Hành Vi & Thái Độ Học Tập</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Khen Thưởng & Phê Bình
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ghi nhận những thành tích nổi bật hoặc nhắc nhở kịp thời gửi đến học viên và phụ huynh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Đánh Giá Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Bộ Lọc:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả phân loại</option>
            <option value="reward">Khen thưởng đặc biệt</option>
            <option value="praise">Biểu dương / Tích cực</option>
            <option value="discipline">Phê bình / Nhắc nhở</option>
          </select>

          <select
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả học viên</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Evaluations Feed */}
      <div className="space-y-3">
        {filteredEvaluations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <MessageSquareQuote className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Chưa có đánh giá nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          filteredEvaluations.map((ev) => {
            const student = users.find((u) => u.id === ev.studentId);
            const teacher = users.find((u) => u.id === ev.teacherId);
            const config = typeConfig[ev.type];
            const Icon = config.icon;

            return (
              <div
                key={ev.id}
                className={`bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all ${config.border}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                      alt={student?.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {student?.name || 'Học viên'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Đánh giá ngày: {ev.date} • GV:{' '}
                        <strong>{teacher?.name || 'Giáo viên phụ trách'}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeBg} self-start sm:self-auto`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed whitespace-pre-line">
                  {ev.teacherNote}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD EVALUATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Thêm Đánh Giá Học Viên</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs sm:text-sm">
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
                <label className="font-semibold text-slate-700 block mb-1">Hình Thức Nhận Xét *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvalType('reward')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      evalType === 'reward'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Khen Thưởng
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalType('praise')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      evalType === 'praise'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Biểu Dương
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalType('discipline')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      evalType === 'discipline'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Phê Bình
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngày Ghi Nhận *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nội Dung Nhận Xét Chi Tiết *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ghi rõ hành động cụ thể, lời khen ngợi hoặc lưu ý cần khắc phục..."
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Lưu Nhận Xét
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
