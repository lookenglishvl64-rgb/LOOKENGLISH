import React, { useState } from 'react';
import { UserModel, UserRole } from '../types';
import { LogIn, UserPlus, Mail, Lock, Phone, User, Key, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onLoginSuccess: (user: UserModel) => void;
  onRegisterSuccess: (newUser: UserModel) => void;
  existingUsers: UserModel[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  onLoginSuccess,
  onRegisterSuccess,
  existingUsers,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    // Verify User Existence
    const user = existingUsers.find(
      (u) => u.email.toLowerCase() === inputEmail
    );

    if (!user) {
      setErrorMsg('Tài khoản ID/Email không tồn tại trên hệ thống LookEnglish!');
      return;
    }

    // Strict Password Verification
    const expectedPassword = user.password || 'Lookenglish@123';
    if (inputPassword !== expectedPassword) {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    if (user.accountStatus === 'locked') {
      setErrorMsg('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Admin trung tâm!');
      return;
    }

    onLoginSuccess(user);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const code = studentCodeInput.trim().toUpperCase();

    // Look for student matching studentCode
    const matchedStudent = existingUsers.find(
      (u) => u.role === 'student' && u.studentCode?.toUpperCase() === code
    );

    if (!matchedStudent) {
      setErrorMsg('Mã số học viên của con không tồn tại trong hệ thống. Vui lòng kiểm tra trên Thẻ học viên hoặc liên hệ trung tâm!');
      return;
    }

    const inputEmail = email.trim().toLowerCase();
    const existing = existingUsers.find(
      (u) => u.email.toLowerCase() === inputEmail
    );

    if (existing) {
      setErrorMsg('Email này đã được đăng ký trên hệ thống. Vui lòng chọn Đăng Nhập!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    const newParentUser: UserModel = {
      id: `usr_parent_${Date.now()}`,
      name: name || `Phụ huynh em ${matchedStudent.name}`,
      email: inputEmail,
      password: password.trim(),
      phone: phone.trim(),
      role: 'parent',
      parentOfStudentId: matchedStudent.id,
      accountStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    };

    onRegisterSuccess(newParentUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black mb-2 shadow-md">
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <h3 className="text-xl font-black">
            {mode === 'login' ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản Phụ Huynh'}
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            {mode === 'login'
              ? 'Vui lòng nhập chính xác ID tài khoản và Mật khẩu để đăng nhập.'
              : 'Phụ huynh bắt buộc phải nhập đúng Mã số học viên của con để liên kết.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3.5 text-xs sm:text-sm">
            {mode === 'register' && (
              <>
                {/* MANDATORY STUDENT CODE INPUT */}
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
                  <label className="font-bold text-amber-950 block text-xs flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Mã Số Học Viên Của Con (Bắt buộc) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã số con (VD: LK-IELTS-204, LK-STAR-101...)"
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-amber-800">
                    Mã số học viên được trung tâm cấp trên thẻ học viên hoặc biên lai học phí.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Họ Và Tên Phụ Huynh *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nhập họ và tên phụ huynh..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Điện Thoại Liên Hệ *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="09xx xxx xxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {mode === 'login' ? 'Tài Khoản ID / Email *' : 'Email Đăng Nhập *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Nhập địa chỉ email đăng nhập..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mật Khẩu *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#1E40AF] hover:bg-blue-900 text-white font-bold text-sm shadow-md active:scale-98 transition-all"
            >
              {mode === 'login' ? 'Đăng Nhập' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            {mode === 'login' ? (
              <p>
                Phụ huynh chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-blue-700 hover:underline"
                >
                  Đăng ký tại đây (cần Mã số của con)
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-700 hover:underline"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
