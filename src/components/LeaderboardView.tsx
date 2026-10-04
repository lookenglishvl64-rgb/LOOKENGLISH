import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MediaDropzone } from './MediaDropzone';
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
  Edit2,
  Trash2,
  Image as ImageIcon,
  Video,
  Upload,
  Eye,
  CheckCircle2,
  Play,
  ExternalLink,
  Flame,
  ShieldCheck,
  X,
} from 'lucide-react';

interface LeaderboardViewProps {
  leaderboard: LeaderboardModel[];
  classes: ClassModel[];
  users: UserModel[];
  currentRole: UserRole;
  onAddTop1Record: (record: Omit<LeaderboardModel, 'id'>) => void;
  onUpdateTop1Record?: (id: string, data: Partial<LeaderboardModel>) => void;
  onDeleteTop1Record?: (id: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  classes,
  users,
  currentRole,
  onAddTop1Record,
  onUpdateTop1Record,
  onDeleteTop1Record,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaderboardModel | null>(null);
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video'; url: string; title: string } | null>(null);

  // Form states
  const [targetClassId, setTargetClassId] = useState(classes[0]?.id || '');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetMonth, setTargetMonth] = useState('Tháng 10/2026');
  const [targetScore, setTargetScore] = useState<number>(9.5);
  const [targetStars, setTargetStars] = useState<number>(50);
  const [title, setTitle] = useState('');
  const [badgeText, setBadgeText] = useState('HẠNG NHẤT (TOP 1)');
  const [highlightNote, setHighlightNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';
  const isAdmin = currentRole === 'admin';

  // Available students in target class
  const activeClass = classes.find((c) => c.id === targetClassId) || classes[0];
  const studentsInActiveClass = activeClass
    ? users.filter((u) => u.role === 'student' && (activeClass.studentList.includes(u.id) || u.classId === activeClass.id))
    : users.filter((u) => u.role === 'student');

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const firstClass = classes[0];
    setTargetClassId(firstClass?.id || '');
    const firstStudent = users.find((u) => u.role === 'student' && firstClass?.studentList.includes(u.id)) || users.find((u) => u.role === 'student');
    setTargetStudentId(firstStudent?.id || '');
    setTargetMonth('Tháng 10/2026');
    setTargetScore(9.5);
    setTargetStars(50);
    setTitle('Thủ Khoa Xuất Sắc Nhất Lớp');
    setBadgeText('HẠNG NHẤT (TOP 1)');
    setHighlightNote('Học viên có thành tích kiểm tra xuất sắc và chuyên cần 100% trong tháng.');
    setImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80');
    setVideoUrl('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item: LeaderboardModel) => {
    setEditingItem(item);
    setTargetClassId(item.classId);
    setTargetStudentId(item.topStudentId);
    setTargetMonth(item.month || 'Tháng 10/2026');
    setTargetScore(item.score);
    setTargetStars(item.starsCount || 50);
    setTitle(item.title || 'Thủ Khoa Xuất Sắc Nhất Lớp');
    setBadgeText(item.badgeText || 'HẠNG NHẤT (TOP 1)');
    setHighlightNote(item.highlightNote || '');
    setImageUrl(item.imageUrl || '');
    setVideoUrl(item.videoUrl || '');
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId) return;

    const payload: Omit<LeaderboardModel, 'id'> = {
      classId: targetClassId,
      topStudentId: targetStudentId,
      month: targetMonth,
      score: targetScore,
      starsCount: targetStars,
      title: title || 'Thủ Khoa Xuất Sắc',
      badgeText: badgeText || 'TOP 1 OVERALL',
      highlightNote: highlightNote || 'Học viên tiêu biểu đạt thành tích xuất sắc nhất.',
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    };

    if (editingItem && onUpdateTop1Record) {
      onUpdateTop1Record(editingItem.id, payload);
    } else {
      onAddTop1Record(payload);
    }

    triggerConfetti();
    setShowModal(false);
  };

  // Distinct months for filter
  const monthsList = Array.from(new Set(leaderboard.map((l) => l.month))).filter(Boolean);
  if (!monthsList.includes('Tháng 10/2026')) monthsList.unshift('Tháng 10/2026');
  if (!monthsList.includes('Tháng 09/2026')) monthsList.push('Tháng 09/2026');

  // Filter leaderboard by selected month
  const filteredLeaders = selectedMonth === 'all'
    ? leaderboard
    : leaderboard.filter((l) => l.month === selectedMonth);

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
              Vinh Danh Thủ Khoa & Gương Mặt Vàng
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed">
              Tuyên dương các học sinh xuất sắc nhất từng lớp, đạt điểm số kỷ lục, tích lũy nhiều sao khen thưởng và hoàn thành bài thi chuẩn quốc tế. Admin có toàn quyền thêm, điều chỉnh hoặc xóa bài đăng vinh danh kèm ảnh/video.
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
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-950/40 hover:bg-amber-950/60 backdrop-blur-md text-white font-bold text-sm border border-white/30 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Bảng Vàng Danh Dự</span>
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
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedMonth === 'all'
                  ? 'bg-white text-amber-700 shadow-md scale-105'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              Tất cả các kỳ ({leaderboard.length})
            </button>
            {monthsList.map((m) => (
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
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Danh Sách Thủ Khoa ({filteredLeaders.length} Gương Mặt Xuất Sắc)</span>
          </h3>

          {isTeacherOrAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E40AF] hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng Bài Vinh Danh Mới</span>
            </button>
          )}
        </div>

        {filteredLeaders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">Chưa có bài đăng Bảng Vàng Danh Dự nào trong kỳ này.</p>
            {isTeacherOrAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700"
              >
                + Đăng bài vinh danh đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeaders.map((item) => {
              const student = users.find((u) => u.id === item.topStudentId);
              const cls = classes.find((c) => c.id === item.classId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-xl hover:border-amber-400 transition-all overflow-hidden flex flex-col justify-between group relative"
                >
                  {/* Admin controls badge */}
                  {isTeacherOrAdmin && (
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-xl shadow-md">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-white hover:text-amber-300 transition-colors"
                        title="Điều chỉnh nội dung bảng vàng"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteTop1Record && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa bài vinh danh bảng vàng của học viên ${student?.name || ''}?`)) {
                              onDeleteTop1Record(item.id);
                            }
                          }}
                          className="p-1.5 text-white hover:text-rose-400 transition-colors"
                          title="Xóa bài vinh danh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    {/* Media Banner (Image or Video) */}
                    {item.imageUrl ? (
                      <div className="relative h-48 overflow-hidden bg-slate-900 group-hover:opacity-95 transition-opacity">
                        <img
                          src={item.imageUrl}
                          alt={item.title || student?.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        {/* Badge */}
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase shadow-sm flex items-center gap-1">
                          <Crown className="w-3 h-3 text-slate-950" />
                          <span>{item.badgeText || 'TOP 1 OVERALL'}</span>
                        </span>

                        {/* Video indicator button */}
                        {item.videoUrl && (
                          <button
                            onClick={() =>
                              setPreviewMedia({
                                type: 'video',
                                url: item.videoUrl!,
                                title: item.title || student?.name || 'Video Vinh Danh',
                              })
                            }
                            className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-all hover:scale-105"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Xem Video</span>
                          </button>
                        )}

                        {/* Student Name Overlay */}
                        <div className="absolute bottom-3 left-3 text-white pointer-events-none max-w-[70%]">
                          <p className="text-[11px] font-bold text-amber-300 drop-shadow-xs">
                            {cls?.className || 'Lớp Tiếng Anh'}
                          </p>
                          <h4 className="font-black text-base drop-shadow-md truncate">
                            {student?.name || 'Học viên vinh danh'}
                          </h4>
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-r from-amber-400 to-yellow-500 p-4 flex items-end relative">
                        <span className="absolute top-3 left-3 bg-black/60 text-white font-black text-[10px] px-2.5 py-1 rounded-lg uppercase">
                          {item.badgeText || 'HẠNG NHẤT (TOP 1)'}
                        </span>
                        <div>
                          <p className="text-[10px] font-bold text-amber-950">
                            {cls?.className}
                          </p>
                          <h4 className="font-black text-white text-base">
                            {student?.name}
                          </h4>
                        </div>
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-5 space-y-3">
                      {/* Title */}
                      <h4 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                        {item.title || 'Thủ Khoa Đạt Thành Tích Xuất Sắc'}
                      </h4>

                      {/* Score & Stars metric */}
                      <div className="flex items-center justify-between text-xs bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-2xl font-bold">
                        <div className="flex items-center gap-1.5 text-amber-700">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>Điểm Số: <strong>{item.score.toFixed(1)} / 10</strong></span>
                        </div>

                        <div className="flex items-center gap-1 text-yellow-700 font-extrabold bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{item.starsCount || 50} Sao</span>
                        </div>
                      </div>

                      {/* Highlight description note */}
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-100 line-clamp-3">
                        "{item.highlightNote || 'Học viên gương mẫu, tiến bộ vượt bậc toàn diện!'}"
                      </p>
                    </div>
                  </div>

                  {/* Card bottom celebration footer */}
                  <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{item.month}</span>

                    <div className="flex items-center gap-2">
                      {item.imageUrl && (
                        <button
                          onClick={() =>
                            setPreviewMedia({
                              type: 'image',
                              url: item.imageUrl!,
                              title: item.title || student?.name || 'Ảnh Vinh Danh',
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-blue-700 transition-colors"
                          title="Phóng to ảnh"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={triggerConfetti}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Chúc mừng</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: THÊM / ĐIỀU CHỈNH BẢNG VÀNG DANH DỰ (ADMIN)
         ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <Crown className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  {editingItem ? 'Điều Chỉnh Bài Đăng Bảng Vàng' : 'Đăng Bài Bảng Vàng Danh Dự Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chọn Lớp Học *</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => {
                      setTargetClassId(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.className} ({c.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kỳ Vinh Danh *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tháng 10/2026"
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn Học Viên Vinh Danh *
                </label>
                <select
                  required
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="">-- Chọn học viên đứng đầu --</option>
                  {studentsInActiveClass.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tiêu Đề Bài Đăng Vinh Danh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thủ Khoa IELTS 8.0 Toàn Hệ Thống / Gương Mặt Vàng Khối Primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm Số (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Sao Khen</label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={targetStars}
                    onChange={(e) => setTargetStars(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Huy Hiệu Danh Dự</label>
                  <input
                    type="text"
                    placeholder="VD: TOP 1 OVERALL"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold uppercase text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nội Dung Nhận Xét & Lý Do Vinh Danh *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Chi tiết về thành tích nổi bật: chuyên cần 100%, dẫn đầu bài thi, tích cực phát biểu..."
                  value={highlightNote}
                  onChange={(e) => setHighlightNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              {/* MEDIA ATTACHMENTS (IMAGE & VIDEO DIRECT UPLOAD) */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-700" />
                  <span className="font-black text-amber-950 text-xs">Đính Kèm Hình Ảnh & Video Vinh Danh (Tải Từ Máy Tính)</span>
                </div>

                <MediaDropzone
                  label="Hình Ảnh Vinh Danh / Trao Giải (Tải từ máy tính)"
                  sublabel="Chọn file ảnh học sinh nhận giải, nhận bằng khen từ máy tính của bạn"
                  accept="image"
                  valueUrl={imageUrl}
                  onChangeUrl={setImageUrl}
                />

                <MediaDropzone
                  label="Video Clip Vinh Danh / Phỏng Vấn (Tải từ máy tính hoặc YouTube)"
                  sublabel="Chọn file video MP4 từ máy tính hoặc dán link video phỏng vấn"
                  accept="video"
                  valueUrl={videoUrl}
                  onChangeUrl={setVideoUrl}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!targetStudentId}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {editingItem ? 'Lưu Điều Chỉnh' : 'Xác Nhận Đăng Bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MEDIA PREVIEW (IMAGE & VIDEO LIGHTBOX)
         ======================================================== */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-white">
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                {previewMedia.type === 'video' ? (
                  <Video className="w-5 h-5 text-red-500" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                )}
                <h4 className="font-bold text-sm sm:text-base truncate max-w-md">
                  {previewMedia.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="text-white/80 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 flex items-center justify-center bg-black">
              {previewMedia.type === 'image' ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-video max-h-[70vh] flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 text-center">
                  <Play className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
                  <p className="font-bold text-sm mb-2 text-white">
                    Video Vinh Danh & Trao Giải
                  </p>
                  <p className="text-xs text-slate-400 mb-4 max-w-md">
                    Xem phần phát biểu hoặc video clip kỷ niệm của học viên tại liên kết bên dưới.
                  </p>
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    <span>Mở Video Trong Tab Mới</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setPreviewMedia(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
