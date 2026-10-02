import React, { useState } from 'react';
import { HomeBannerModel, CenterAnnouncementModel, LeaderboardModel, UserModel, UserRole } from '../types';
import {
  Star,
  Trophy,
  Sparkles,
  ArrowRight,
  Lock,
  User,
  Image as ImageIcon,
  Award,
  Bell,
  CheckCircle2,
  Calendar,
  Share2,
  Plus,
  Trash2,
  ChevronRight,
} from 'lucide-react';

interface PublicHomeProps {
  banners: HomeBannerModel[];
  announcements: CenterAnnouncementModel[];
  leaderboards: LeaderboardModel[];
  users: UserModel[];
  currentRole: UserRole;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onAddBanner?: (banner: Omit<HomeBannerModel, 'id'>) => void;
  onDeleteBanner?: (bannerId: string) => void;
  onAddAnnouncement?: (anc: Omit<CenterAnnouncementModel, 'id'>) => void;
  onDeleteAnnouncement?: (ancId: string) => void;
  onNavigateToLeaderboard?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  banners,
  announcements,
  leaderboards,
  users,
  currentRole,
  onLoginClick,
  onRegisterClick,
  onAddBanner,
  onDeleteBanner,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onNavigateToLeaderboard,
}) => {
  // Sub-tabs exactly as shown in Image 3
  const [activeSubTab, setActiveSubTab] = useState<'media' | 'hallOfFame' | 'announcements'>('hallOfFame');

  // Realistic sample center media activities matching Image 3
  const centerMediaItems = [
    {
      id: 'med_01',
      tag: 'COMPETITION',
      title: 'Hội Thi Hùng Biện Tiếng Anh LookEnglish Speech Contest 2026',
      description: 'Hơn 80 học sinh đã thể hiện tư duy phản biện sắc bén và khả năng giao tiếp lưu loát về các vấn đề toàn cầu.',
      date: '2026-09-28',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'med_02',
      tag: 'CLASSROOM',
      title: 'Giờ Học Tương Tác Sôi Nổi Lớp Starters A1 Cùng Thầy Robert',
      description: 'Phương pháp học qua trò chơi vận động (TPR) giúp các bé tiếp thu từ vựng tự nhiên và tự tin phát âm chuẩn bản ngữ.',
      date: '2026-09-26',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'med_03',
      tag: 'WORKSHOP',
      title: 'Workshop: Đồng Hành Cùng Con Chinh Phục Cambridge 15 Khiên',
      description: 'Buổi tọa đàm chuyên sâu giữa Giám đốc Đào tạo và phụ huynh về lộ trình Starters - Movers - Flyers.',
      date: '2026-09-22',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'med_04',
      tag: 'AWARDS',
      title: 'Lễ Tuyên Dương Học Bổng LookEnglish Honor Roll Quý 3',
      description: 'Trao thưởng cúp vàng và giấy chứng nhận cho các thủ khoa dẫn đầu thành tích 4 kỹ năng.',
      date: '2026-09-18',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================
          HERO BANNER: EXACTLY MATCHING IMAGE 3
         ======================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F368A] via-[#1E40AF] to-[#172554] p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-blue-900/40">
        {/* Subtle dot texture background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        ></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          {/* Top pill badge: ✨ Hệ thống Quản lý Giáo dục Tiêu chuẩn Quốc tế */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20 text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ thống Quản lý Giáo dục Tiêu chuẩn Quốc tế</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            LOOK ENGLISH CENTER
          </h1>

          {/* Subtitle paragraph */}
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
            Chào mừng Quý Phụ huynh, Học viên và Giáo viên. Khám phá các hình ảnh, video hoạt động thực tế lớp học, bảng vàng khen thưởng và thông báo chính thức được cập nhật trực tiếp bởi Ban Quản trị.
          </p>

          {/* CTA Buttons: Exactly as in Image 3 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {/* Gold Button: 👤 Đăng nhập Phụ huynh → */}
            <button
              onClick={onLoginClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-all"
            >
              <User className="w-4 h-4 text-slate-950" />
              <span>Đăng nhập Phụ huynh</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Blue Outline Card Button: 🔒 Cán bộ / Giáo viên đăng nhập */}
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
          3 SUB-TABS: EXACTLY MATCHING IMAGE 3
          Hình ảnh & Video Trung tâm (4) | Bảng Vàng Danh Dự (3) | Thông báo trung tâm (3)
         ======================================================== */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
          {/* Tab 1: Hình ảnh & Video Trung tâm (4) */}
          <button
            onClick={() => setActiveSubTab('media')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeSubTab === 'media'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hình ảnh & Video Trung tâm ({centerMediaItems.length})</span>
          </button>

          {/* Tab 2: Bảng Vàng Danh Dự (Hall of Fame) (3) */}
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

          {/* Tab 3: Thông báo trung tâm (3) */}
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
      </div>

      {/* ========================================================
          SUB-TAB 2: BẢNG VÀNG DANH DỰ (EXACTLY MATCHING IMAGE 2)
         ======================================================== */}
      {activeSubTab === 'hallOfFame' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TOP 1 CARD: MẪU CHÍNH XÁC NHƯ TRONG IMAGE 2 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4">
              {/* Top Banner inside card: 🏆 #1 • Học sinh Xuất sắc nhất Tháng 9   ⭐ 48 */}
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

              {/* Student Identification: Golden square 'N' avatar, Name, ID, Class */}
              <div className="flex items-start gap-4">
                {/* Golden square with 'N' initial matching Image 2 */}
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

              {/* Quote citation: "Chuyên cần 100%, tích lũy 48 Sao khen thưởng, đứng đầu bài kiểm tra vấn đáp từ vựng." */}
              <div className="bg-slate-50/70 rounded-2xl p-3.5 text-xs text-slate-700 italic border border-slate-100 leading-relaxed">
                "Chuyên cần 100%, tích lũy 48 Sao khen thưởng, đứng đầu bài kiểm tra vấn đáp từ vựng."
              </div>

              {/* Footer Badges matching Image 2: GOLDEN EXPLORER | Verified */}
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

            {/* TOP 1 CARD 2: BẢO NGỌC (IELTS 6.5+) */}
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
          SUB-TAB 1: HÌNH ẢNH & VIDEO TRUNG TÂM (MEDIA)
         ======================================================== */}
      {activeSubTab === 'media' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {centerMediaItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                    {item.tag}
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
                <span>Xem chi tiết bài viết</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: THÔNG BÁO TRUNG TÂM
         ======================================================== */}
      {activeSubTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((anc) => (
            <div
              key={anc.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all p-5 space-y-3 flex flex-col justify-between"
            >
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
                <button className="text-blue-700 font-bold hover:underline">
                  Xem thông báo →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
