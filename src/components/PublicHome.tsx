import React, { useState, useRef } from 'react';
import { MediaDropzone } from './MediaDropzone';
import {
  HomeBannerModel,
  CenterAnnouncementModel,
  HomeMediaItemModel,
  LeaderboardModel,
  UserModel,
  UserRole,
  ClassModel,
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
  Crown,
  Play,
  Flame,
  Eye,
} from 'lucide-react';

interface PublicHomeProps {
  banners: HomeBannerModel[];
  mediaItems: HomeMediaItemModel[];
  announcements: CenterAnnouncementModel[];
  leaderboards: LeaderboardModel[];
  users: UserModel[];
  classes?: ClassModel[];
  currentRole: UserRole;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onAddMediaItem?: (item: Omit<HomeMediaItemModel, 'id'>) => void;
  onUpdateMediaItem?: (id: string, data: Partial<HomeMediaItemModel>) => void;
  onDeleteMediaItem?: (id: string) => void;
  onAddAnnouncement?: (anc: Omit<CenterAnnouncementModel, 'id'>) => void;
  onUpdateAnnouncement?: (id: string, data: Partial<CenterAnnouncementModel>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onAddTop1Record?: (record: Omit<LeaderboardModel, 'id'>) => void;
  onUpdateTop1Record?: (id: string, data: Partial<LeaderboardModel>) => void;
  onDeleteTop1Record?: (id: string) => void;
  onNavigateToLeaderboard?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  banners,
  mediaItems,
  announcements,
  leaderboards,
  users,
  classes = [],
  currentRole,
  onLoginClick,
  onRegisterClick,
  onAddMediaItem,
  onUpdateMediaItem,
  onDeleteMediaItem,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onAddTop1Record,
  onUpdateTop1Record,
  onDeleteTop1Record,
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

  // Leaderboard (Bảng Vàng Danh Dự) Modal & Handlers
  const [showLbModal, setShowLbModal] = useState(false);
  const [editingLb, setEditingLb] = useState<LeaderboardModel | null>(null);
  const [lbFormData, setLbFormData] = useState({
    classId: '',
    topStudentId: '',
    month: 'Tháng 10/2026',
    score: 9.5,
    starsCount: 50,
    title: '',
    badgeText: 'HẠNG NHẤT (TOP 1)',
    highlightNote: '',
    imageUrl: '',
    videoUrl: '',
  });
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video'; url: string; title: string } | null>(null);
  const lbFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddLb = () => {
    setEditingLb(null);
    const firstStudent = users.find((u) => u.role === 'student');
    setLbFormData({
      classId: classes?.[0]?.id || 'cls_ielts_01',
      topStudentId: firstStudent?.id || '',
      month: 'Tháng 10/2026',
      score: 9.5,
      starsCount: 50,
      title: 'Thủ Khoa Xuất Sắc Nhất Lớp',
      badgeText: 'HẠNG NHẤT (TOP 1)',
      highlightNote: 'Học viên có thành tích học tập vượt trội và chuyên cần 100%.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
      videoUrl: '',
    });
    setShowLbModal(true);
  };

  const handleOpenEditLb = (lb: LeaderboardModel) => {
    setEditingLb(lb);
    setLbFormData({
      classId: lb.classId,
      topStudentId: lb.topStudentId,
      month: lb.month || 'Tháng 10/2026',
      score: lb.score,
      starsCount: lb.starsCount || 50,
      title: lb.title || '',
      badgeText: lb.badgeText || 'HẠNG NHẤT (TOP 1)',
      highlightNote: lb.highlightNote || '',
      imageUrl: lb.imageUrl || '',
      videoUrl: lb.videoUrl || '',
    });
    setShowLbModal(true);
  };

  const handleLbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLbFormData((prev) => ({ ...prev, imageUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitLb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lbFormData.topStudentId) return;

    if (editingLb && onUpdateTop1Record) {
      onUpdateTop1Record(editingLb.id, lbFormData);
    } else if (onAddTop1Record) {
      onAddTop1Record(lbFormData);
    }
    setShowLbModal(false);
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
          {/* Admin Action Bar */}
          {isAdmin && (
            <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200 p-4 rounded-2xl">
              <div>
                <span className="font-extrabold text-amber-950 text-xs sm:text-sm block">
                  🏆 Quản Lý Bảng Vàng Danh Dự (Thủ Khoa Các Lớp)
                </span>
                <span className="text-[11px] text-amber-800">
                  Admin có thể đăng bài mới, điều chỉnh nội dung hoặc xóa bài đăng kèm hình ảnh/video.
                </span>
              </div>
              <button
                onClick={handleOpenAddLb}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Đăng Bảng Vàng Mới</span>
              </button>
            </div>
          )}

          {leaderboards.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm">Chưa có bài đăng Bảng Vàng Danh Dự nào.</p>
              {isAdmin && (
                <button
                  onClick={handleOpenAddLb}
                  className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700"
                >
                  + Đăng bài vinh danh đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leaderboards.map((item) => {
                const student = users.find((u) => u.id === item.topStudentId);
                const cls = classes?.find((c) => c.id === item.classId);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group relative"
                  >
                    {/* Admin controls badge */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-xl shadow-md">
                        <button
                          onClick={() => handleOpenEditLb(item)}
                          className="p-1.5 text-white hover:text-amber-300 transition-colors"
                          title="Điều chỉnh bài đăng này"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteTop1Record && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa bài vinh danh của ${student?.name || ''}?`)) {
                                onDeleteTop1Record(item.id);
                              }
                            }}
                            className="p-1.5 text-white hover:text-rose-400 transition-colors"
                            title="Xóa bài đăng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div>
                      {/* Image / Video Media Header */}
                      {item.imageUrl ? (
                        <div className="relative h-44 overflow-hidden bg-slate-900">
                          <img
                            src={item.imageUrl}
                            alt={item.title || student?.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                          <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase shadow-sm flex items-center gap-1">
                            <Crown className="w-3 h-3 text-slate-950" />
                            <span>{item.badgeText || 'TOP 1 OVERALL'}</span>
                          </span>

                          {item.videoUrl && (
                            <button
                              onClick={() =>
                                setPreviewMedia({
                                  type: 'video',
                                  url: item.videoUrl!,
                                  title: item.title || student?.name || 'Video Vinh Danh',
                                })
                              }
                              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-black text-xs flex items-center gap-1 shadow-md transition-all hover:scale-105"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Video</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-amber-50/70 border-b border-amber-200/70 p-4 text-xs font-black text-amber-900">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            <span>{item.badgeText || 'HẠNG NHẤT (TOP 1)'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="w-4 h-4 fill-amber-500" />
                            <span>{item.score} Điểm</span>
                          </div>
                        </div>
                      )}

                      <div className="p-5 space-y-3.5">
                        <div className="flex items-start gap-4">
                          <img
                            src={student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'}
                            alt={student?.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-2xs shrink-0"
                          />

                          <div className="space-y-0.5">
                            <h3 className="font-black text-slate-900 text-base sm:text-lg">
                              {student?.name || 'Học viên'}
                            </h3>
                            <p className="text-xs font-mono font-bold text-slate-400">
                              Mã HV: {student?.studentCode || 'LK-STAR-101'}
                            </p>
                            <p className="text-xs font-semibold text-blue-700">
                              {cls?.className || 'Lớp Tiếng Anh Chuẩn Quốc Tế'}
                            </p>
                          </div>
                        </div>

                        {item.title && (
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {item.title}
                          </h4>
                        )}

                        <div className="bg-slate-50/80 rounded-2xl p-3.5 text-xs text-slate-700 italic border border-slate-100 leading-relaxed">
                          "{item.highlightNote || 'Học viên xuất sắc, tích lũy nhiều sao khen thưởng nhất lớp.'}"
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.month || 'Tháng 10/2026'}
                      </span>

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
                            className="p-1 text-slate-400 hover:text-blue-700 transition-colors"
                            title="Phóng to ảnh"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã Vinh Danh</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

              <MediaDropzone
                label="Hình Ảnh Hoạt Động (Tải trực tiếp từ máy tính)"
                sublabel="Bấm hoặc kéo thả trực tiếp file ảnh từ máy tính của bạn"
                accept="image"
                valueUrl={mediaFormData.imageUrl}
                onChangeUrl={(url) => setMediaFormData({ ...mediaFormData, imageUrl: url })}
                required
              />

              {mediaFormData.type === 'video' && (
                <MediaDropzone
                  label="Video Clip Hoạt Động (Tải từ máy tính hoặc YouTube)"
                  sublabel="Chọn file video MP4/MOV từ máy tính hoặc dán link video"
                  accept="video"
                  valueUrl={mediaFormData.videoUrl || ''}
                  onChangeUrl={(url) => setMediaFormData({ ...mediaFormData, videoUrl: url })}
                />
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

              <MediaDropzone
                label="Hình Ảnh Đính Kèm Bản Tin (Tải trực tiếp từ máy tính)"
                sublabel="Chọn file ảnh từ máy tính để hiển thị cùng bài viết thông báo"
                accept="image"
                valueUrl={ancFormData.imageUrl}
                onChangeUrl={(url) => setAncFormData({ ...ancFormData, imageUrl: url })}
              />

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

      {/* ========================================================
          MODAL: ADD / EDIT BẢNG VÀNG DANH DỰ (ADMIN)
         ======================================================== */}
      {showLbModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base">
                  {editingLb ? 'Điều Chỉnh Bài Đăng Bảng Vàng' : 'Đăng Bài Bảng Vàng Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowLbModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLb} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lớp Học</label>
                  <select
                    value={lbFormData.classId}
                    onChange={(e) => setLbFormData({ ...lbFormData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    {classes?.map((c) => (
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
                    value={lbFormData.month}
                    onChange={(e) => setLbFormData({ ...lbFormData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Học Viên Nhận Vinh Danh *</label>
                <select
                  required
                  value={lbFormData.topStudentId}
                  onChange={(e) => setLbFormData({ ...lbFormData, topStudentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="">-- Chọn học viên --</option>
                  {users
                    .filter((u) => u.role === 'student')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentCode || s.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bài Đăng Vinh Danh *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thủ Khoa IELTS 8.0 / Gương Mặt Vàng Khối Primary"
                  value={lbFormData.title}
                  onChange={(e) => setLbFormData({ ...lbFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm Số (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={lbFormData.score}
                    onChange={(e) => setLbFormData({ ...lbFormData, score: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Sao Khen</label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={lbFormData.starsCount}
                    onChange={(e) => setLbFormData({ ...lbFormData, starsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Huy Hiệu</label>
                  <input
                    type="text"
                    placeholder="VD: TOP 1"
                    value={lbFormData.badgeText}
                    onChange={(e) => setLbFormData({ ...lbFormData, badgeText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold uppercase text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội Dung Nhận Xét & Khen Ngợi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Lý do vinh danh..."
                  value={lbFormData.highlightNote}
                  onChange={(e) => setLbFormData({ ...lbFormData, highlightNote: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* MEDIA ATTACHMENTS (IMAGE & VIDEO DIRECT UPLOAD) */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-700" />
                  <span className="font-black text-amber-950 text-xs">Đính Kèm Hình Ảnh & Video Vinh Danh (Tải Từ Máy Tính)</span>
                </div>

                <MediaDropzone
                  label="Hình Ảnh Vinh Danh Học Viên (Tải trực tiếp từ máy tính)"
                  sublabel="Chọn file ảnh học sinh nhận giải / cúp từ máy tính của bạn"
                  accept="image"
                  valueUrl={lbFormData.imageUrl}
                  onChangeUrl={(url) => setLbFormData({ ...lbFormData, imageUrl: url })}
                />

                <MediaDropzone
                  label="Video Clip Vinh Danh / Phỏng Vấn (Tải từ máy tính hoặc YouTube)"
                  sublabel="Chọn file video MP4 từ máy tính hoặc dán link video"
                  accept="video"
                  valueUrl={lbFormData.videoUrl || ''}
                  onChangeUrl={(url) => setLbFormData({ ...lbFormData, videoUrl: url })}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLbModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!lbFormData.topStudentId}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {editingLb ? 'Lưu Điều Chỉnh' : 'Đăng Bảng Vàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MEDIA PREVIEW LIGHTBOX
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
