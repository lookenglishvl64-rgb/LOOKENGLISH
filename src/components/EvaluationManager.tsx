import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { EvaluationModel, EvaluationType, UserModel, UserRole, ClassModel } from '../types';
import {
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  Plus,
  MessageSquareQuote,
  Filter,
  User,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Flame,
} from 'lucide-react';

interface EvaluationManagerProps {
  evaluations: EvaluationModel[];
  users: UserModel[];
  classes?: ClassModel[];
  currentRole: UserRole;
  currentUserId: string;
  childStudentId?: string;
  onAddEvaluation: (evaluation: Omit<EvaluationModel, 'id'>) => void;
  onDeleteEvaluation?: (id: string) => void;
  onUpdateUserStars?: (studentId: string, delta: number) => void;
}

export const EvaluationManager: React.FC<EvaluationManagerProps> = ({
  evaluations,
  users,
  classes = [],
  currentRole,
  currentUserId,
  childStudentId,
  onAddEvaluation,
  onDeleteEvaluation,
  onUpdateUserStars,
}) => {
  const isParent = currentRole === 'parent';
  const child = isParent
    ? users.find((u) => u.id === (childStudentId || 'usr_student_2'))
    : null;

  const allStudents = users.filter((u) => u.role === 'student');

  // If teacher, only allow praising/disciplining students in teacher's assigned classes
  const students = currentRole === 'teacher' && classes.length > 0
    ? allStudents.filter((s) => classes.some((c) => c.studentList.includes(s.id) || s.classId === c.id))
    : allStudents;

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [evalType, setEvalType] = useState<EvaluationType>('praise');
  const [starDelta, setStarDelta] = useState<number>(2);
  const [reasonCategory, setReasonCategory] = useState('Phát biểu tích cực & đúng ngữ pháp');
  const [teacherNote, setTeacherNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  const typeConfig: Record<EvaluationType, { label: string; icon: any; badgeBg: string; border: string; defaultDelta: number }> = {
    reward: {
      label: 'Khen Thưởng Xuất Sắc',
      icon: Sparkles,
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      border: 'border-l-4 border-l-amber-500',
      defaultDelta: 5,
    },
    praise: {
      label: 'Biểu Dương / Tích Cực',
      icon: ThumbsUp,
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      border: 'border-l-4 border-l-emerald-500',
      defaultDelta: 2,
    },
    discipline: {
      label: 'Phê Bình / Nhắc Nhở',
      icon: AlertTriangle,
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      border: 'border-l-4 border-l-rose-500',
      defaultDelta: -1,
    },
  };

  const PRESET_REASONS: Record<EvaluationType, string[]> = {
    reward: [
      'Đạt điểm 10 kiểm tra định kỳ',
      'Thành tích xuất sắc tuần học',
      'Đại diện lớp đạt giải thi tiếng Anh',
      'Nói Speaking lưu loát và tự tin 100%',
      'Hoàn thành thử thách đặc biệt',
    ],
    praise: [
      'Phát biểu tích cực & đúng ngữ pháp',
      'Làm bài tập về nhà đầy đủ, sạch đẹp',
      'Chăm chỉ luyện nghe và thuộc từ mới',
      'Giúp đỡ bạn cùng bàn tiến bộ',
      'Đi học đúng giờ và chuyên cần',
    ],
    discipline: [
      'Nói chuyện riêng trong giờ giảng',
      'Chưa làm bài tập về nhà',
      'Đi học muộn không có lý do',
      'Quên sách vở / dụng cụ học tập',
      'Thiếu tập trung trong giờ học',
    ],
  };

  const handleSelectEvalType = (type: EvaluationType) => {
    setEvalType(type);
    setStarDelta(typeConfig[type].defaultDelta);
    setReasonCategory(PRESET_REASONS[type][0]);
  };

  const handleOpenAddForStudent = (studentId: string, type: EvaluationType) => {
    setTargetStudentId(studentId);
    handleSelectEvalType(type);
    setShowAddModal(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNote.trim() && !reasonCategory) return;

    onAddEvaluation({
      studentId: targetStudentId,
      type: evalType,
      teacherNote: teacherNote.trim() || reasonCategory,
      date,
      teacherId: currentUserId,
      starDelta,
      reasonCategory,
    });

    if (starDelta > 0) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    setTeacherNote('');
    setShowAddModal(false);
  };

  // Target student for modal preview
  const selectedStudentObj = users.find((u) => u.id === targetStudentId);
  const currentStars = selectedStudentObj?.rewardStars ?? 40;
  const projectedStars = Math.max(0, currentStars + starDelta);

  // Filtered list
  const filteredEvaluations = evaluations.filter((ev) => {
    // If Parent: show strictly child's evaluations
    if (isParent && child) {
      return ev.studentId === child.id;
    }

    if (filterType !== 'all' && ev.type !== filterType) return false;
    if (filterStudentId !== 'all' && ev.studentId !== filterStudentId) return false;

    if (filterClassId !== 'all') {
      const student = users.find((u) => u.id === ev.studentId);
      if (student?.classId !== filterClassId) return false;
    }

    return true;
  });

  // Parent View for Child
  if (isParent && child) {
    const childEvals = evaluations.filter((ev) => ev.studentId === child.id);
    const praisesCount = childEvals.filter((ev) => ev.type === 'praise' || ev.type === 'reward').length;
    const warnsCount = childEvals.filter((ev) => ev.type === 'discipline').length;
    const totalStars = child.rewardStars ?? 50;

    return (
      <div className="space-y-6">
        {/* Child Stars & Praise Summary Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/30 mb-3 uppercase tracking-wider text-slate-950">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Sổ Tích Lũy Điểm Sao & Khen Thưởng Hàng Ngày</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-xs">
                Kho Sao Của Bé {child.name}
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed">
                Thầy cô khen thưởng, cộng điểm sao hoặc nhắc nhở sau mỗi buổi học để con rèn luyện thói quen học tập tốt nhất.
              </p>
            </div>

            {/* Live Stars Badge */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-950/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 text-center min-w-[140px] shadow-lg">
                <span className="text-3xl sm:text-4xl font-black text-amber-300 flex items-center justify-center gap-1.5">
                  <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                  <span>{totalStars}</span>
                </span>
                <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider block mt-1">
                  Tổng Điểm Sao
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Cards for Child */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Nhật Ký Nhận Xét & Biến Động Điểm Sao
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {childEvals.length} lượt đánh giá
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {childEvals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Chưa có đánh giá nào được ghi nhận cho bé {child.name}.
              </div>
            ) : (
              childEvals.map((ev) => {
                const config = typeConfig[ev.type] || typeConfig.praise;
                const Icon = config.icon;
                const teacher = users.find((u) => u.id === ev.teacherId);
                const hasDelta = ev.starDelta !== undefined && ev.starDelta !== 0;

                return (
                  <div key={ev.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-2xl border ${config.badgeBg} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                            {config.label}
                          </span>
                          {ev.reasonCategory && (
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              {ev.reasonCategory}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">
                            {ev.date}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-800 italic">
                          "{ev.teacherNote}"
                        </p>

                        <p className="text-xs text-blue-700 font-medium">
                          Giáo viên đánh giá: <strong>{teacher?.name || 'Thầy David Wilson'}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Star Delta Badge */}
                    {hasDelta && (
                      <div className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 shrink-0 ${
                        ev.starDelta! > 0
                          ? 'bg-amber-50 text-amber-900 border border-amber-300'
                          : 'bg-rose-50 text-rose-900 border border-rose-300'
                      }`}>
                        <Star className={`w-4 h-4 ${ev.starDelta! > 0 ? 'fill-amber-500 text-amber-500' : 'fill-rose-500 text-rose-500'}`} />
                        <span>{ev.starDelta! > 0 ? `+${ev.starDelta}` : ev.starDelta} Sao</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // Teacher & Admin View
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Phê Bình, Khen Thưởng & Cộng/Trừ Điểm Sao Học Viên Mỗi Ngày</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Khen Thưởng / Phê Bình & Quản Lý Điểm Sao
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Thầy cô ghi nhận thái độ học tập, biểu dương sự tiến bộ hoặc nhắc nhở kỷ luật kèm cộng/trừ điểm sao trực tiếp cho từng học sinh.
            </p>
          </div>

          {isTeacherOrAdmin && (
            <button
              onClick={() => {
                setTargetStudentId(students[0]?.id || '');
                handleSelectEvalType('praise');
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo Nhận Xét / Cộng Trừ Sao Mới</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Lọc theo:</span>

            {/* Class filter */}
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả lớp học</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className}
                </option>
              ))}
            </select>

            {/* Evaluation Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả phân loại</option>
              <option value="reward">🌟 Khen Thưởng Xuất Sắc</option>
              <option value="praise">👍 Biểu Dương / Chăm Chỉ</option>
              <option value="discipline">⚠️ Phê Bình / Nhắc Nhở</option>
            </select>

            {/* Student filter */}
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả học sinh ({students.length})</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rewardStars ?? 40} ⭐)
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            Có <strong>{filteredEvaluations.length}</strong> lượt đánh giá
          </span>
        </div>
      </div>

      {/* Quick Student Grid with Live Stars & Quick Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Danh Sách Học Sinh & Thao Tác Điểm Sao Nhanh</span>
          </h3>
          <span className="text-xs text-slate-400">
            Bấm nút để thưởng hoặc trừ sao tức thì
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map((stu) => {
            const stars = stu.rewardStars ?? 40;
            return (
              <div
                key={stu.id}
                className="bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={stu.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'}
                    alt={stu.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {stu.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{stars} Sao</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenAddForStudent(stu.id, 'praise')}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs"
                    title="Khen thưởng & Cộng sao"
                  >
                    + Thưởng
                  </button>
                  <button
                    onClick={() => handleOpenAddForStudent(stu.id, 'discipline')}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-2xs"
                    title="Phê bình & Trừ sao"
                  >
                    - Trừ sao
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evaluations Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Nhật Ký Đánh Giá & Điểm Sao Toàn Hệ Thống
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredEvaluations.length} kết quả
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEvaluations.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-semibold">
              Không tìm thấy nhật ký đánh giá nào phù hợp.
            </div>
          ) : (
            filteredEvaluations.map((ev) => {
              const student = users.find((u) => u.id === ev.studentId);
              const teacher = users.find((u) => u.id === ev.teacherId);
              const config = typeConfig[ev.type] || typeConfig.praise;
              const Icon = config.icon;
              const hasDelta = ev.starDelta !== undefined && ev.starDelta !== 0;

              return (
                <div
                  key={ev.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'}
                      alt={student?.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {student?.name || 'Học viên'}
                        </h4>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {student?.studentCode}
                        </span>
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                          {config.label}
                        </span>
                        {ev.reasonCategory && (
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {ev.reasonCategory}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          {ev.date}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        "{ev.teacherNote}"
                      </p>

                      <div className="text-[11px] text-slate-500">
                        Người đánh giá: <strong className="text-blue-800">{teacher?.name || 'Giáo viên phụ trách'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {hasDelta && (
                      <div className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 ${
                        ev.starDelta! > 0
                          ? 'bg-amber-50 text-amber-900 border border-amber-300'
                          : 'bg-rose-50 text-rose-900 border border-rose-300'
                      }`}>
                        <Star className={`w-4 h-4 ${ev.starDelta! > 0 ? 'fill-amber-500 text-amber-500' : 'fill-rose-500 text-rose-500'}`} />
                        <span>{ev.starDelta! > 0 ? `+${ev.starDelta}` : ev.starDelta} Sao</span>
                      </div>
                    )}

                    {onDeleteEvaluation && isTeacherOrAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa đánh giá này?`)) {
                            onDeleteEvaluation(ev.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL: ADD EVALUATION & STAR POINTS ADJUSTMENT
         ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-black text-slate-900 text-base">
                  Đánh Giá & Cộng/Trừ Điểm Sao Học Viên
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              {/* 1. Select Student & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Học Viên Được Đánh Giá *
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rewardStars ?? 40} ⭐)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày Đánh Giá *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 2. Choose Evaluation Type */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Phân Loại Đánh Giá *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectEvalType('reward')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      evalType === 'reward'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs ring-2 ring-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-base">🌟</span>
                    <span>Khen Thưởng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEvalType('praise')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      evalType === 'praise'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-xs ring-2 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-base">👍</span>
                    <span>Biểu Dương</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEvalType('discipline')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      evalType === 'discipline'
                        ? 'bg-rose-100 border-rose-400 text-rose-900 shadow-xs ring-2 ring-rose-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-base">⚠️</span>
                    <span>Phê Bình / Trừ Sao</span>
                  </button>
                </div>
              </div>

              {/* 3. Star Points Adjustment (+ or -) */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>Cộng Hoặc Trừ Điểm Sao: <strong>{starDelta > 0 ? `+${starDelta}` : starDelta} Sao</strong></span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-800">
                    Hiện tại: {currentStars} ⭐ → Mới: <strong>{projectedStars} ⭐</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[5, 3, 2, 1, 0, -1, -2, -3].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setStarDelta(val)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                        starDelta === val
                          ? val > 0
                            ? 'bg-amber-600 text-white shadow-xs scale-105'
                            : val < 0
                            ? 'bg-rose-600 text-white shadow-xs scale-105'
                            : 'bg-slate-800 text-white shadow-xs'
                          : val > 0
                          ? 'bg-amber-100/80 text-amber-900 hover:bg-amber-200'
                          : val < 0
                          ? 'bg-rose-100/80 text-rose-900 hover:bg-rose-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val} ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Preset Reason Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lý Do Cụ Thể (Chọn nhanh):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_REASONS[evalType].map((reason) => (
                    <button
                      type="button"
                      key={reason}
                      onClick={() => setReasonCategory(reason)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        reasonCategory === reason
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Hoặc nhập lý do khác..."
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              {/* 5. Teacher Detailed Note */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lời Dặn Dò & Ghi Chú Của Giáo Viên:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhận xét chi tiết cho học viên và phụ huynh..."
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  Lưu & Cập Nhật Điểm Sao ⭐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
