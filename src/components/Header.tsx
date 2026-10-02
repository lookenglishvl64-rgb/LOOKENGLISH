import React from 'react';
import { UserRole, UserModel } from '../types';
import {
  Star,
  Globe,
  Lock,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser?: UserModel;
  onOpenLoginModal: () => void;
  onOpenRegisterModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  currentUser,
  onOpenLoginModal,
  onOpenRegisterModal,
  onLogout,
}) => {
  const isLoggedIn = currentRole !== 'guest' && !!currentUser;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand Logo & Name exactly matching Images 1, 2, 3 */}
          <div className="flex items-center gap-3">
            {/* Dark Blue Rounded Icon with Golden Star [★] */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0F368A] flex items-center justify-center text-amber-400 shadow-md shadow-blue-950/20 shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-400" />
            </div>

            {/* Typography: LOOK ENGLISH - Hệ thống Quản lý & Học tập */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-2xl tracking-tight text-[#0F172A]">
                  LOOK ENGLISH
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-tight">
                Hệ thống Quản lý & Học tập
              </p>
            </div>
          </div>

          {/* Right Controls: Exactly as requested: Language VN, Register button, Login button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher pill [🌐 VN] */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>VN</span>
            </div>

            {isLoggedIn ? (
              /* User logged in pill (matches LK-STAR-101 in image) */
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black shadow-2xs">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{currentUser.name}</span>
                  <span className="font-mono text-[11px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    LK-{currentUser.role.substring(0, 3).toUpperCase()}-01
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Not logged in: Register and Login buttons matching Image 3 */
              <div className="flex items-center gap-2">
                {/* Gold Button: Đăng ký Phụ huynh */}
                <button
                  onClick={onOpenRegisterModal}
                  className="inline-flex items-center justify-center px-3.5 sm:px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] active:scale-95 text-slate-950 text-xs sm:text-sm font-extrabold shadow-sm transition-all whitespace-nowrap"
                >
                  <span>Đăng ký Phụ huynh</span>
                </button>

                {/* Login Lock Icon Button */}
                <button
                  onClick={onOpenLoginModal}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-bold text-xs sm:text-sm shadow-2xs transition-colors flex items-center gap-1.5"
                  title="Đăng nhập tài khoản"
                >
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span className="hidden md:inline">Đăng nhập</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
