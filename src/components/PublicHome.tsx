import React, { useState } from 'react';
import {
  HomeBannerModel,
  CenterAnnouncementModel,
  HomeMediaItemModel,
  LeaderboardModel,
  UserModel,
  UserRole,
} from '../types';
import {
  Star,
  Trophy,
  Sparkles,
  ArrowRight,
  Lock,
  User,
  Image as ImageIcon,
  Bell,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Video,
  ExternalLink,
  Upload,
} from 'lucide-react';

interface PublicHomeProps {
  banners: HomeBannerModel[];
  mediaItems: HomeMediaItemModel[];
  announcements: CenterAnnouncementModel[];
  leaderboards: LeaderboardModel[];
  users: UserModel[];
  currentRole: UserRole;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onAddMediaItem?: (item: Omit<HomeMediaItemModel, 'id'>) => void;
  onUpdateMediaItem?: (id: string, data: Partial<HomeMediaItemModel>) => void;
  onDeleteMediaItem?: (id: string) => void;
  onAddAnnouncement?: (anc: Omit<CenterAnnouncementModel, 'id'>) => void;
  onUpdateAnnouncement?: (id: string, data: Partial<CenterAnnouncementModel>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onNavigateToLeaderboard?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  banners,
  mediaItems,
  announcements,
  leaderboards,
  users,
  currentRole,
  onLoginClick,
  onRegisterClick,
  onAddMediaItem,
  onUpdateMediaItem,
  onDeleteMediaItem,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onNavigateToLeaderboard,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'media' | 'hallOfFame' | 'announcements'>('media');

  // Media Modal (Add / Edit)
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<HomeMediaItemModel | null>(null);
  const [mediaFormData, setMediaFormData] = useState({
    title: '',
    description: '',
    tag: 'COMPETITION',
    date: new Date().toISOString().substring(0, 10),
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
    videoUrl: '',
    type: 'image' as 'image' | 'video',
  });

  // Announcement Modal (Add / Edit)
  const [showAncModal, setShowAncModal] = useState(false);
  const [editingAnc, setEditingAnc] = useState<CenterAnnouncementModel | null>(null);
  const [ancFormData, setAncFormData] = useState({
    title: '',
    content: '',
    category: 'thong-bao' as 'khai-giang' | 'thi-cu' | 'vinh-danh' | 'thong-bao',
    date: new Date().toISOString().substring(0, 10),
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
  });

  // Media Handlers
  const handleOpenAddMedia = () => {
    setEditingMedia(null);
    setMediaFormData({
      title: '',
      description: '',
      tag: 'CLASSROOM',
      date: new Date().toISOString().substring(0, 10),
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
      videoUrl: '',
      type: 'image',
    });
    setShowMediaModal(true);
  };

  const handleOpenEditMedia = (item: HomeMediaItemModel) => {
    setEditingMedia(item);
    setMediaFormData({
      title: item.title,
      description: item.description,
      tag: item.tag,
      date: item.date,
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl || '',
      type: item.type || 'image',
    });
    setShowMediaModal(true);
  };

  const handleSubmitMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFormData.title.trim()) return;

    if (editingMedia && onUpdateMediaItem) {
      onUpdateMediaItem(editingMedia.id, mediaFormData);
    } else if (onAddMediaItem) {
      onAddMediaItem(mediaFormData);
    }
    setShowMediaModal(false);
  };

  // Announcement Handlers
  const handleOpenAddAnc = () => {
    setEditingAnc(null);
    setAncFormData({
      title: '',
      content: '',
      category: 'thong-bao',
      date: new Date().toISOString().substring(0, 10),
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    });
    setShowAncModal(true);
  };

  const handleOpenEditAnc = (anc: CenterAnnouncementModel) => {
    setEditingAnc(anc);
    setAncFormData({
      title: anc.title,
      content: anc.content,
      category: anc.category,
      date: anc.date,
      imageUrl: anc.imageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    });
    setShowAncModal(true);
  };

  const handleSubmitAnc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancFormData.title.trim()) return;

    if (editingAnc && onUpdateAnnouncement) {
      onUpdateAnnouncement(editingAnc.id, ancFormData);
    } else if (onAddAnnouncement) {
      onAddAnnouncement(ancFormData);
    }
    setShowAncModal(false);
  };

  const isAdmin = currentRole === 'admin';

  return (
    <div className="space-y-6">
      {/* ========================================================
          HERO BANNER
         ======================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F368A] via-[#1E40AF] to-[#172554] p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-blue-900/40">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        ></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20 text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ thống Quản lý Giáo dục Tiêu chuẩn Quốc tế</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            LOOK ENGLISH CENTER
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
            Chào mừng Quý Phụ huynh, Học viên và Giáo viên. Khám phá các hình ảnh, video hoạt động thực tế lớp học, bảng vàng khen thưởng và thông báo chính thức được cập nhật trực tiếp bởi Ban Quản trị.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onLoginClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-all"
            >
              <User className="w-4 h-4 text-slate-950" />
              <span>Đăng nhập Phụ huynh</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoginClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md active:scale-95 transition-all"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Cán bộ / Giáo viên đăng nhập</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          3 SUB-TABS: Hình ảnh & Video | Bảng Vàng | Thông báo
         ======================================================== */}
      <div className="border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
            {/* Tab 1: Hình ảnh & Video Trung tâm */}
            <button
              onClick={() => setActiveSubTab('media')}
              className={`flex items-center gap-2 py-3 px-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeSubTab === 'media'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Hình ảnh & Video Trung tâm ({mediaItems.length})</span>
            </button>

            {/* Tab 2: Bảng Vàng Danh Dự */}
            <button
              onClick={() => setActiveSubTab('hallOfFame')}
              className={`flex items-center gap-2 py-3 px-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeSubTab === 'hallOfFame'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Bảng Vàng Danh Dự (Hall of Fame) ({leaderboards.length})</span>
            </button>

            {/* Tab 3: Thông báo trung tâm */}
            <button
              onClick={() => setActiveSubTab('announcements')}
              className={`flex items-center gap-2 py-3 px-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeSubTab === 'announcements'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4 text-indigo-500" />
              <span>Thông báo trung tâm ({announcements.length})</span>
            </button>
          </div>

          {/* Admin Quick Action Button */}
          {isAdmin && (
            <div className="pb-2">
              {activeSubTab === 'media' && (
                <button
                  onClick={handleOpenAddMedia}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng Hình Ảnh/Video Mới</span>
                </button>
              )}

              {activeSubTab === 'announcements' && (
                <button
                  onClick={handleOpenAddAnc}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng Thông Báo Mới</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: HÌNH ẢNH & VIDEO TRUNG TÂM (MEDIA)
         ======================================================== */}
      {activeSubTab === 'media' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Admin controls badge */}
                {isAdmin && (
                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1 rounded-xl">
                    <button
                      onClick={() => handleOpenEditMedia(item)}
                      className="p-1 text-white hover:text-amber-300 transition-colors"
                      title="Sửa hình ảnh / video này"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa bài viết "${item.title}"?`)) {
                          onDeleteMediaItem?.(item.id);
                        }
                      }}
                      className="p-1 text-white hover:text-rose-400 transition-colors"
                      title="Xóa bài viết này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-md uppercase flex items-center gap-1">
                      {item.type === 'video' ? <Video className="w-3 h-3 text-red-400" /> : null}
                      <span>{item.tag}</span>
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] text-slate-400 font-semibold">{item.date}</div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                  <span>{item.type === 'video' ? 'Xem video hoạt động' : 'Xem chi tiết'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: BẢNG VÀNG DANH DỰ (HALL OF FAME)
         ======================================================== */}
      {activeSubTab === 'hallOfFame' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Minh Quân */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/70 rounded-2xl px-4 py-2 text-xs font-black text-amber-900">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>#1 • Học sinh Xuất sắc nhất Tháng 9</span>
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>48</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center font-black text-2xl text-amber-800 shadow-2xs shrink-0">
                  N
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Nguyễn Minh Quân (Leo)
                  </h3>
                  <p className="text-xs font-mono font-bold text-slate-400">
                    ID: LK-STAR-101
                  </p>
                  <p className="text-xs font-semibold text-blue-700">
                    Starters A1 - Sunshine Explorers
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/70 rounded-2xl p-3.5 text-xs text-slate-700 italic border border-slate-100 leading-relaxed">
                "Chuyên cần 100%, tích lũy 48 Sao khen thưởng, đứng đầu bài kiểm tra vấn đáp từ vựng."
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  GOLDEN EXPLORER
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            {/* Card 2: Bảo Ngọc */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/70 rounded-2xl px-4 py-2 text-xs font-black text-amber-900">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>#1 • Thủ Khoa Mock Test IELTS Tháng 9</span>
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>50</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center font-black text-2xl text-indigo-800 shadow-2xs shrink-0">
                  T
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Trần Bảo Ngọc (Hannah)
                  </h3>
                  <p className="text-xs font-mono font-bold text-slate-400">
                    ID: LK-IELTS-204
                  </p>
                  <p className="text-xs font-semibold text-blue-700">
                    IELTS Intensive 6.5+ (Lab A201)
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/70 rounded-2xl p-3.5 text-xs text-slate-700 italic border border-slate-100 leading-relaxed">
                "Xuất sắc đạt Overall 8.0 Mock Test tháng 9 và hoàn thành trọn vẹn 100% bài tập Writing Task 2."
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  IELTS MASTER SCHOLAR
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: THÔNG BÁO TRUNG TÂM (ANNOUNCEMENTS)
         ======================================================== */}
      {activeSubTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((anc) => (
            <div
              key={anc.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all p-5 space-y-3 flex flex-col justify-between relative group"
            >
              {/* Admin controls for announcements */}
              {isAdmin && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl">
                  <button
                    onClick={() => handleOpenEditAnc(anc)}
                    className="p-1 text-white hover:text-amber-300 transition-colors"
                    title="Sửa thông báo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa thông báo "${anc.title}"?`)) {
                        onDeleteAnnouncement?.(anc.id);
                      }
                    }}
                    className="p-1 text-white hover:text-rose-400 transition-colors"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold uppercase">
                    {anc.category}
                  </span>
                  <span>{anc.date}</span>
                </div>
                <h4 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                  {anc.title}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {anc.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Bởi Ban Quản Trị</span>
                <span className="text-blue-700 font-bold">Xem thông báo →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT MEDIA (IMAGES & VIDEOS)
         ======================================================== */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingMedia ? 'Điều Chỉnh Hình Ảnh / Video' : 'Đăng Hình Ảnh / Video Mới'}
              </h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMedia} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bài Viết / Hoạt Động *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giờ Học Tương Tác Sôi Nổi..."
                  value={mediaFormData.title}
                  onChange={(e) => setMediaFormData({ ...mediaFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thẻ Phân Loại (Tag) *</label>
                  <select
                    value={mediaFormData.tag}
                    onChange={(e) => setMediaFormData({ ...mediaFormData, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  >
                    <option value="COMPETITION">COMPETITION (Thi cử)</option>
                    <option value="CLASSROOM">CLASSROOM (Lớp học)</option>
                    <option value="WORKSHOP">WORKSHOP (Tọa đàm)</option>
                    <option value="AWARDS">AWARDS (Khen thưởng)</option>
                    <option value="EVENT">EVENT (Sự kiện)</option>
                    <option value="VIDEO">VIDEO (Phóng sự)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại Định Dạng</label>
                  <select
                    value={mediaFormData.type}
                    onChange={(e) => setMediaFormData({ ...mediaFormData, type: e.target.value as 'image' | 'video' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="image">Hình ảnh (Image)</option>
                    <option value="video">Video Clip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link Ảnh Bìa (Image URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={mediaFormData.imageUrl}
                  onChange={(e) => setMediaFormData({ ...mediaFormData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                />
              </div>

              {mediaFormData.type === 'video' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Link Video (YouTube / MP4)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={mediaFormData.videoUrl}
                    onChange={(e) => setMediaFormData({ ...mediaFormData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội Dung Tóm Tắt</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả tóm tắt hoạt động..."
                  value={mediaFormData.description}
                  onChange={(e) => setMediaFormData({ ...mediaFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900"
                >
                  {editingMedia ? 'Lưu Điều Chỉnh' : 'Đăng Lên Trang Chủ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT ANNOUNCEMENTS
         ======================================================== */}
      {showAncModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingAnc ? 'Điều Chỉnh Thông Báo' : 'Đăng Thông Báo Mới'}
              </h3>
              <button
                onClick={() => setShowAncModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAnc} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Thông Báo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lịch thi thử Cambridge..."
                  value={ancFormData.title}
                  onChange={(e) => setAncFormData({ ...ancFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chuyên Mục *</label>
                  <select
                    value={ancFormData.category}
                    onChange={(e) => setAncFormData({ ...ancFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                  >
                    <option value="thong-bao">Thông Báo Chung</option>
                    <option value="khai-giang">Khai Giảng</option>
                    <option value="thi-cu">Thi Cử & Kiểm Tra</option>
                    <option value="vinh-danh">Vinh Danh & Trao Thưởng</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Đăng</label>
                  <input
                    type="date"
                    value={ancFormData.date}
                    onChange={(e) => setAncFormData({ ...ancFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội Dung Chi Tiết *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Chi tiết thông báo..."
                  value={ancFormData.content}
                  onChange={(e) => setAncFormData({ ...ancFormData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAncModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900"
                >
                  {editingAnc ? 'Lưu Thay Đổi' : 'Đăng Thông Báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
