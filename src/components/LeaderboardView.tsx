import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ClassModel, LeaderboardModel, UserModel, UserRole } from '../types';
import {
  Trophy,
  Crown,
  Sparkles,
  Star,
  Award,
  Medal,
  Calendar,
  PartyPopper,
  Plus,
} from 'lucide-react';

interface LeaderboardViewProps {
  leaderboard: LeaderboardModel[];
  classes: ClassModel[];
  users: UserModel[];
  currentRole: UserRole;
  onAddTop1Record: (record: Omit<LeaderboardModel, 'id'>) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  classes,
  users,
  currentRole,
  onAddTop1Record,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Tháng 09/2026');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [targetClassId, setTargetClassId] = useState(classes[0]?.id || '');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetScore, setTargetScore] = useState<number>(9.5);
  const [highlightNote, setHighlightNote] = useState('');

  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  // Available students in target class
  const activeClass = classes.find((c) => c.id === targetClassId) || classes[0];
  const studentsInActiveClass = activeClass
    ? users.filter((u) => activeClass.studentList.includes(u.id))
    : [];

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCreateTop1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId) return;

    onAddTop1Record({
      classId: targetClassId,
      topStudentId: targetStudentId,
      month: selectedMonth,
      score: targetScore,
      highlightNote: highlightNote || 'Học viên xuất sắc nhất lớp trong tháng',
    });

    triggerConfetti();
    setShowAddModal(false);
  };

  // Filter leaderboard by selected month
  const currentMonthLeaders = leaderboard.filter((l) => l.month === selectedMonth);

  return (
    <div className="space-y-6">
      {/* Golden Celebration Hero Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background stars */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/30 mb-3 uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-yellow-200" />
              <span>Bảng Vàng Danh Dự LookEnglish</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-xs">
              Vinh Danh Thủ Khoa Lớp (Top 1)
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed">
              Tuyên dương và vinh danh những học viên có thành tích học tập và sự tiến bộ vượt bậc nhất từng lớp học tiếng Anh hàng tháng.
            </p>
          </div>

          {/* Action buttons on banner */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={triggerConfetti}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-800 font-black text-sm shadow-lg hover:bg-amber-50 active:scale-95 transition-all"
            >
              <PartyPopper className="w-4 h-4 text-amber-600" />
              <span>Bắn Pháo Hoa Chúc Mừng 🎉</span>
            </button>

            {isTeacherOrAdmin && (
              <button
                onClick={() => {
                  setTargetClassId(classes[0]?.id || '');
                  setShowAddModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-900/40 hover:bg-amber-900/60 backdrop-blur-md text-white font-bold text-sm border border-white/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Vinh Danh Top 1 Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Month Filter Selector */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/20 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
            <Calendar className="w-4 h-4" />
            <span>Kỳ Vinh Danh:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['Tháng 10/2026', 'Tháng 09/2026', 'Tháng 08/2026'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  selectedMonth === m
                    ? 'bg-white text-amber-700 shadow-md scale-105'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 1 Cards Grid for each class */}
      <div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Danh Sách Thủ Khoa Các Lớp ({currentMonthLeaders.length} Lớp Đã Vinh Danh)</span>
        </h3>

        {currentMonthLeaders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">Chưa có kết quả vinh danh Top 1 trong {selectedMonth}.</p>
            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
              >
                + Bình chọn Thủ Khoa ngay cho kỳ này
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMonthLeaders.map((item, idx) => {
              const student = users.find((u) => u.id === item.topStudentId);
              const cls = classes.find((c) => c.id === item.classId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all relative overflow-hidden group flex flex-col justify-between"
                >
                  {/* Top Golden Banner badge */}
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-white font-black text-xs px-4 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>HẠNG NHẤT (TOP 1)</span>
                  </div>

                  <div>
                    {/* Class Name */}
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                        {cls?.className || 'Lớp tiếng Anh'}
                      </span>
                    </div>

                    {/* Student Avatar & Top 1 Laurel */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'}
                          alt={student?.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-xs font-black text-xs">
                          1
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {student?.name || 'Học viên'}
                        </h4>
                        <div className="flex items-center gap-1 text-amber-600 font-extrabold text-xs mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>Điểm Tổng Kết: {item.score.toFixed(1)} / 10</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievement citation note */}
                    <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 text-xs text-amber-900 leading-relaxed italic">
                      "{item.highlightNote || 'Học viên gương mẫu, tiến bộ vượt bậc toàn diện!'}"
                    </div>
                  </div>

                  {/* Card bottom celebration footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{item.month}</span>
                    <button
                      onClick={triggerConfetti}
                      className="text-amber-600 font-bold hover:text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chúc mừng</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD TOP 1 RECORD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Vinh Danh Thủ Khoa Top 1 Lớp ({selectedMonth})
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTop1} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chọn Lớp Học *</label>
                <select
                  value={targetClassId}
                  onChange={(e) => {
                    setTargetClassId(e.target.value);
                    setTargetStudentId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chọn Học Viên Đạt Top 1 *
                </label>
                {studentsInActiveClass.length === 0 ? (
                  <p className="text-xs text-rose-500 py-1">Lớp này hiện chưa có học viên nào!</p>
                ) : (
                  <select
                    required
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Chọn học viên đứng đầu --</option>
                    {studentsInActiveClass.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Điểm Số Đạt Được *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Lời Khen Ngợi & Lý Do Vinh Danh *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Đạt điểm kiểm tra Speaking 9.5 & chuyên cần 100%..."
                  value={highlightNote}
                  onChange={(e) => setHighlightNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
                  disabled={!targetStudentId}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 disabled:opacity-50"
                >
                  Xác Nhận Vinh Danh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
