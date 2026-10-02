import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckInMoodType,
  ClassModel,
  StudentCheckInModel,
  UserModel,
  UserRole,
} from '../types';
import {
  Smile,
  Heart,
  Sparkles,
  Zap,
  MessageCircle,
  Send,
  HelpCircle,
  Calendar,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface QuickCheckInManagerProps {
  checkIns: StudentCheckInModel[];
  users: UserModel[];
  classes: ClassModel[];
  currentRole: UserRole;
  currentUserId: string;
  childStudentId?: string; // For parent portal
  onAddCheckIn: (checkIn: Omit<StudentCheckInModel, 'id'>) => void;
  onAddTeacherFeedback?: (checkInId: string, feedback: { teacherId: string; teacherName: string; comment: string; createdAt: string }) => void;
  onAddParentNote?: (checkInId: string, note: string) => void;
}

interface MoodOption {
  type: CheckInMoodType;
  emoji: string;
  label: string;
  desc: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    type: 'excited',
    emoji: '🌟',
    label: 'Hào Hứng',
    desc: 'Tràn đầy năng lượng, sẵn sàng bứt phá',
    colorBg: 'bg-amber-50 hover:bg-amber-100',
    colorBorder: 'border-amber-300',
    colorText: 'text-amber-800',
  },
  {
    type: 'happy',
    emoji: '😄',
    label: 'Vui Vẻ',
    desc: 'Học tập thoải mái và hứng thú',
    colorBg: 'bg-emerald-50 hover:bg-emerald-100',
    colorBorder: 'border-emerald-300',
    colorText: 'text-emerald-800',
  },
  {
    type: 'confident',
    emoji: '💪',
    label: 'Tự Tin',
    desc: 'Nắm chắc kiến thức, sẵn sàng làm bài',
    colorBg: 'bg-blue-50 hover:bg-blue-100',
    colorBorder: 'border-blue-300',
    colorText: 'text-blue-800',
  },
  {
    type: 'neutral',
    emoji: '😐',
    label: 'Bình Thường',
    desc: 'Ổn định, cần thêm cảm hứng',
    colorBg: 'bg-slate-50 hover:bg-slate-100',
    colorBorder: 'border-slate-300',
    colorText: 'text-slate-800',
  },
  {
    type: 'tired',
    emoji: '🥱',
    label: 'Hơi Mệt',
    desc: 'Cần nghỉ ngơi và bài giảng nhẹ nhàng',
    colorBg: 'bg-orange-50 hover:bg-orange-100',
    colorBorder: 'border-orange-300',
    colorText: 'text-orange-800',
  },
  {
    type: 'stressed',
    emoji: '😰',
    label: 'Cần Hỗ Trợ',
    desc: 'Gặp khó khăn bài học, cần cô giảng lại',
    colorBg: 'bg-rose-50 hover:bg-rose-100',
    colorBorder: 'border-rose-300',
    colorText: 'text-rose-800',
  },
];

export const QuickCheckInManager: React.FC<QuickCheckInManagerProps> = ({
  checkIns,
  users,
  classes,
  currentRole,
  currentUserId,
  childStudentId,
  onAddCheckIn,
  onAddTeacherFeedback,
  onAddParentNote,
}) => {
  // Determine relevant student
  const activeStudentId = childStudentId || currentUserId;
  const currentStudent = users.find((u) => u.id === activeStudentId);
  const studentClass = classes.find((c) => c.id === currentStudent?.classId) || classes[0];

  // Form states for new Check-in
  const [selectedMood, setSelectedMood] = useState<CheckInMoodType>('happy');
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [reflection, setReflection] = useState('');
  const [topicsLearned, setTopicsLearned] = useState('');
  const [needHelp, setNeedHelp] = useState(false);
  const [helpTopic, setHelpTopic] = useState('');
  const [parentNoteInput, setParentNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Teacher feedback modal state
  const [activeCheckInForFeedback, setActiveCheckInForFeedback] = useState<StudentCheckInModel | null>(null);
  const [teacherComment, setTeacherComment] = useState('');

  // Parent note modal state
  const [activeCheckInForParentNote, setActiveCheckInForParentNote] = useState<StudentCheckInModel | null>(null);
  const [parentNoteText, setParentNoteText] = useState('');

  // Filter for teacher view
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  const isParent = currentRole === 'parent';
  const isTeacher = currentRole === 'teacher';
  const isAdmin = currentRole === 'admin';

  // Filter check-ins
  const filteredCheckIns = checkIns.filter((chk) => {
    // If Parent: STRICTLY show only child's check-ins
    if (isParent) {
      return chk.studentId === activeStudentId;
    }

    // If Teacher: show check-ins of students in teacher's classes
    if (isTeacher) {
      if (selectedClassFilter !== 'all' && chk.classId !== selectedClassFilter) {
        return false;
      }
      if (selectedMoodFilter !== 'all' && chk.mood !== selectedMoodFilter) {
        return false;
      }
      return true;
    }

    // Admin sees all
    if (selectedClassFilter !== 'all' && chk.classId !== selectedClassFilter) {
      return false;
    }
    if (selectedMoodFilter !== 'all' && chk.mood !== selectedMoodFilter) {
      return false;
    }
    return true;
  });

  const selectedMoodObj = MOOD_OPTIONS.find((m) => m.type === selectedMood)!;

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    setIsSubmitting(true);
    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddCheckIn({
      studentId: activeStudentId,
      classId: currentStudent?.classId || studentClass?.id || 'cls_ielts_01',
      date: dateStr,
      time: timeStr,
      mood: selectedMood,
      moodEmoji: selectedMoodObj.emoji,
      moodLabel: selectedMoodObj.label,
      energyLevel,
      reflection: reflection.trim(),
      topicsLearned: topicsLearned.trim() || undefined,
      needHelp,
      helpTopic: needHelp ? helpTopic.trim() : undefined,
      parentNote: parentNoteInput.trim() || undefined,
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setReflection('');
    setTopicsLearned('');
    setNeedHelp(false);
    setHelpTopic('');
    setParentNoteInput('');
    setIsSubmitting(false);
  };

  const handleSendTeacherFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckInForFeedback || !teacherComment.trim() || !onAddTeacherFeedback) return;

    const teacher = users.find((u) => u.id === currentUserId) || {
      name: 'Thầy David Wilson (Giáo Viên)',
    };

    const now = new Date();
    const dateStr = `${now.toISOString().substring(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddTeacherFeedback(activeCheckInForFeedback.id, {
      teacherId: currentUserId,
      teacherName: teacher.name,
      comment: teacherComment.trim(),
      createdAt: dateStr,
    });

    setTeacherComment('');
    setActiveCheckInForFeedback(null);
  };

  const handleSendParentNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckInForParentNote || !parentNoteText.trim() || !onAddParentNote) return;

    onAddParentNote(activeCheckInForParentNote.id, parentNoteText.trim());
    setParentNoteText('');
    setActiveCheckInForParentNote(null);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          HERO BANNER
         ======================================================== */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/30 mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Theo Dõi Tâm Trạng & Cảm Nghĩ Hàng Ngày</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              Quick Check-in: Nhật Ký Học Tập Của Con
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">
              {isParent
                ? `Học sinh và ba mẹ cùng ghi lại cảm nghĩ, năng lượng và mức độ hiểu bài hôm nay. Thầy cô phụ trách sẽ đọc và gửi phản hồi động viên kịp thời cho con!`
                : `Thầy cô có thể theo dõi tâm trạng, năng lượng và những câu hỏi khó khăn của học viên mỗi ngày để kịp thời hỗ trợ và khích lệ các em.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[120px]">
              <span className="text-2xl font-black block">
                {filteredCheckIns.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-100 uppercase">
                Số Lần Check-in
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PARENT & STUDENT: QUICK CHECK-IN FORM
         ======================================================== */}
      {isParent && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Smile className="w-5 h-5 text-emerald-600" />
                <span>Hôm nay con cảm thấy thế nào? Ghi lại cảm nghĩ ngay nhé!</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dành 1 phút để cập nhật tâm trạng và bài học hôm nay cho thầy cô và ba mẹ.
              </p>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
            </span>
          </div>

          <form onSubmit={handleSubmitCheckIn} className="space-y-6">
            {/* 1. MOOD SELECTOR */}
            <div>
              <label className="font-bold text-xs uppercase tracking-wider text-slate-600 block mb-3">
                1. Chọn Tâm Trạng Hôm Nay Của Con *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = selectedMood === opt.type;
                  return (
                    <button
                      type="button"
                      key={opt.type}
                      onClick={() => setSelectedMood(opt.type)}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? `${opt.colorBg} ${opt.colorBorder} shadow-md scale-105 ring-2 ring-emerald-500`
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl filter drop-shadow-xs">{opt.emoji}</span>
                      <span className={`font-black text-xs ${isSelected ? opt.colorText : 'text-slate-800'}`}>
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. ENERGY LEVEL */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>2. Mức Năng Lượng / Hứng Thú Học Tập: <strong>{energyLevel} / 5</strong></span>
                </label>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  {energyLevel === 5 ? '⚡ 100% Siêu năng lượng' : energyLevel >= 4 ? '🔥 Rất hứng thú' : energyLevel >= 3 ? '👌 Ổn định' : '😴 Hơi mệt mỏi'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setEnergyLevel(lvl)}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 ${
                      energyLevel >= lvl
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Mức {lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. REFLECTION QUESTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 text-xs sm:text-sm block mb-1.5">
                  3. Cảm nghĩ của con về buổi học hôm nay? *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Hôm nay con đã tự tin trả lời Speaking trước lớp! Hoặc: Bài nghe hôm nay hơi nhanh một chút nhưng con rất thích..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 text-xs sm:text-sm block mb-1.5">
                  4. Từ vựng hoặc chủ đề mới con đã học được?
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: 15 từ vựng chủ đề Environment, thì Hiện tại hoàn thành, cách viết Overview Writing Task 1..."
                  value={topicsLearned}
                  onChange={(e) => setTopicsLearned(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* 4. NEED HELP CHECKBOX & PARENT ENCOURAGEMENT */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs sm:text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={needHelp}
                  onChange={(e) => setNeedHelp(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-md focus:ring-rose-500"
                />
                <span className="flex items-center gap-1.5 text-rose-700">
                  <HelpCircle className="w-4 h-4" />
                  <span>Con muốn nhờ Thầy/Cô giải đáp hoặc giảng lại phần nào không?</span>
                </span>
              </label>

              {needHelp && (
                <div>
                  <input
                    type="text"
                    required={needHelp}
                    placeholder="Nhập nội dung bài tập hoặc kỹ năng con muốn thầy cô hướng dẫn thêm..."
                    value={helpTopic}
                    onChange={(e) => setHelpTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl bg-white text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-[11px] text-rose-600 mt-1">
                    * Yêu cầu này sẽ được gửi trực tiếp đến Thầy/Cô phụ trách lớp để hỗ trợ con trong buổi học tới.
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">
                  Lời nhắn động viên từ ba mẹ (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="VD: Ba mẹ chúc con gái học thật vui, con luôn là niềm tự hào của cả nhà! ❤️"
                  value={parentNoteInput}
                  onChange={(e) => setParentNoteInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !reflection.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Check-in Hôm Nay 🎉</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          TEACHER & ADMIN FILTERS BAR
         ======================================================== */}
      {(isTeacher || isAdmin) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-xs text-slate-700">Lọc Nhật Ký:</span>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất Cả Lớp Học</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className}
                </option>
              ))}
            </select>

            <select
              value={selectedMoodFilter}
              onChange={(e) => setSelectedMoodFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất Cả Tâm Trạng</option>
              {MOOD_OPTIONS.map((m) => (
                <option key={m.type} value={m.type}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Hiển thị <strong>{filteredCheckIns.length}</strong> nhật ký phản hồi
          </div>
        </div>
      )}

      {/* ========================================================
          CHECK-IN TIMELINE / HISTORY FEED
         ======================================================== */}
      <div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>
              {isParent
                ? `Lịch Sử Check-in & Phản Hồi Thầy Cô Của Em ${currentStudent?.name || ''}`
                : `Nhật Ký Tâm Trạng & Cảm Nghĩ Của Học Viên (${filteredCheckIns.length})`}
            </span>
          </span>
        </h3>

        {filteredCheckIns.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <Smile className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">Chưa có bài Check-in nào được ghi nhận.</p>
            {isParent && (
              <p className="text-xs text-slate-400 mt-1">
                Hãy cùng con thực hiện bài Check-in đầu tiên ở khung biểu mẫu bên trên nhé!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCheckIns.map((chk) => {
              const student = users.find((u) => u.id === chk.studentId);
              const cls = classes.find((c) => c.id === chk.classId);
              const moodOpt = MOOD_OPTIONS.find((m) => m.type === chk.mood) || MOOD_OPTIONS[1];

              return (
                <div
                  key={chk.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4 relative overflow-hidden"
                >
                  {/* Top Bar: Student Name, Class, Mood Badge, Date & Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'}
                          alt={student?.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-200 shadow-2xs"
                        />
                        <span className="absolute -bottom-1 -right-1 text-base">
                          {chk.moodEmoji}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">
                            {student?.name || 'Học viên'}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {student?.studentCode}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 font-semibold">
                          {cls?.className || 'Lớp Tiếng Anh'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Mood Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${moodOpt.colorBg} ${moodOpt.colorBorder} ${moodOpt.colorText}`}
                      >
                        <span>{chk.moodEmoji}</span>
                        <span>{chk.moodLabel}</span>
                      </span>

                      {/* Energy Gauge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Năng lượng {chk.energyLevel}/5</span>
                      </span>

                      {/* Date */}
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                        {chk.date} lúc {chk.time}
                      </span>
                    </div>
                  </div>

                  {/* Main Content: Reflection & Topics */}
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block mb-1">
                        Cảm nghĩ về buổi học:
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 italic">
                        "{chk.reflection}"
                      </p>
                    </div>

                    {chk.topicsLearned && (
                      <div className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-800 shrink-0">📖 Đã học được:</span>
                        <span>{chk.topicsLearned}</span>
                      </div>
                    )}

                    {/* NEED HELP ALERT */}
                    {chk.needHelp && (
                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-rose-700 block">
                            Học viên cần Thầy/Cô hỗ trợ thêm:
                          </span>
                          <p className="mt-0.5">{chk.helpTopic || 'Cần giảng lại phần bài học'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Parent Encouragement Note */}
                  {chk.parentNote && (
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                      <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 fill-rose-500" />
                      <div>
                        <span className="font-black text-amber-950 block">
                          Lời nhắn yêu thương từ Ba Mẹ:
                        </span>
                        <p className="mt-0.5 italic">{chk.parentNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback Section */}
                  {chk.teacherFeedback ? (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        👨‍🏫
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-900">
                            {chk.teacherFeedback.teacherName}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {chk.teacherFeedback.createdAt}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed font-semibold">
                          "{chk.teacherFeedback.comment}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 italic">
                        {isParent ? '⏳ Thầy cô đang đọc nhật ký và sẽ phản hồi sớm...' : 'Chưa có phản hồi từ giáo viên'}
                      </span>

                      {/* Teacher Action: Send Feedback */}
                      {(isTeacher || isAdmin) && (
                        <button
                          onClick={() => {
                            setActiveCheckInForFeedback(chk);
                            setTeacherComment('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Gửi Lời Động Viên / Phản Hồi</span>
                        </button>
                      )}

                      {/* Parent Action: Add note if not added yet */}
                      {isParent && !chk.parentNote && (
                        <button
                          onClick={() => {
                            setActiveCheckInForParentNote(chk);
                            setParentNoteText('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          <span>+ Nhắn gửi lời yêu thương</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: TEACHER FEEDBACK
         ======================================================== */}
      {activeCheckInForFeedback && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <h3 className="font-black text-slate-900 text-base">
                  Phản Hồi & Động Viên Học Viên
                </h3>
              </div>
              <button
                onClick={() => setActiveCheckInForFeedback(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
              <p className="font-bold text-slate-700 mb-1">
                Nhật ký của em{' '}
                <strong className="text-blue-700">
                  {users.find((u) => u.id === activeCheckInForFeedback.studentId)?.name}
                </strong>
                :
              </p>
              <p className="italic text-slate-600">
                "{activeCheckInForFeedback.reflection}"
              </p>
              {activeCheckInForFeedback.needHelp && (
                <p className="text-rose-600 font-bold mt-1">
                  🚨 Cần hỗ trợ: {activeCheckInForFeedback.helpTopic}
                </p>
              )}
            </div>

            <form onSubmit={handleSendTeacherFeedback} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lời nhận xét & dặn dò của Thầy/Cô:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="VD: Cô khen con hôm nay rất tập trung! Về bài ngữ pháp câu phức, ngày mai 15 phút đầu giờ cô sẽ hướng dẫn thêm cho con nhé..."
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCheckInForFeedback(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!teacherComment.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  Gửi Phản Hồi Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PARENT ENCOURAGEMENT NOTE
         ======================================================== */}
      {activeCheckInForParentNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-black text-slate-900 text-base">
                  Gửi Lời Nhắn Yêu Thương Cho Con
                </h3>
              </div>
              <button
                onClick={() => setActiveCheckInForParentNote(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendParentNote} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lời động viên từ Ba Mẹ:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Ba mẹ chúc con gái học thật vui, con luôn là niềm tự hào của cả nhà! Tối nay mẹ nấu món con thích nhé! ❤️"
                  value={parentNoteText}
                  onChange={(e) => setParentNoteText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCheckInForParentNote(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!parentNoteText.trim()}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  Lưu Lời Nhắn ❤️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
