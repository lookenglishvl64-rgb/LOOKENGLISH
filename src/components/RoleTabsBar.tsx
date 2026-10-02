import React from 'react';
import { UserRole } from '../types';

interface RoleTabsBarProps {
  currentTab: 'parent' | 'teacher' | 'admin' | 'news';
  onSelectTab: (tab: 'parent' | 'teacher' | 'admin' | 'news') => void;
  isLoggedIn: boolean;
  userRole?: UserRole;
  childName?: string;
}

export const RoleTabsBar: React.FC<RoleTabsBarProps> = ({
  currentTab,
  onSelectTab,
  isLoggedIn,
  userRole,
  childName,
}) => {
  // If NOT logged in (Guest): Exactly matching user's uploaded image:
  // Shows: [ Cổng Phụ Huynh ]  [ Bản Tin Trung Tâm ]
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2 pt-2 pb-2">
        <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => onSelectTab('parent')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'parent'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Cổng Phụ Huynh
          </button>

          <button
            onClick={() => onSelectTab('news')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'news'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Bản Tin Trung Tâm
          </button>
        </div>
      </div>
    );
  }

  // If Logged in as Parent:
  if (userRole === 'parent') {
    return (
      <div className="flex items-center gap-2 pt-2 pb-2">
        <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => onSelectTab('parent')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'parent'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Cổng Phụ Huynh {childName ? `(Bé ${childName})` : ''}
          </button>

          <button
            onClick={() => onSelectTab('news')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'news'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Bản Tin Trung Tâm
          </button>
        </div>
      </div>
    );
  }

  // If Logged in as Teacher:
  if (userRole === 'teacher') {
    return (
      <div className="flex items-center gap-2 pt-2 pb-2">
        <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => onSelectTab('teacher')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'teacher'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Cổng Giáo Viên
          </button>

          <button
            onClick={() => onSelectTab('news')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'news'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Bản Tin Trung Tâm
          </button>
        </div>
      </div>
    );
  }

  // If Logged in as Admin: Full Access
  return (
    <div className="flex items-center gap-2 pt-2 pb-2">
      <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => onSelectTab('admin')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentTab === 'admin'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Cổng Admin
        </button>

        <button
          onClick={() => onSelectTab('teacher')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentTab === 'teacher'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Giáo Viên
        </button>

        <button
          onClick={() => onSelectTab('parent')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentTab === 'parent'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Phụ Huynh
        </button>

        <button
          onClick={() => onSelectTab('news')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            currentTab === 'news'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Bản Tin Trung Tâm
        </button>
      </div>
    </div>
  );
};
