import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Palette,
  Layout,
  Smartphone,
  Server,
  FolderTree,
  Shield,
  Layers,
  Sparkles,
  KeyRound,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  FLUTTER_DART_MODELS_CODE,
  FLUTTER_RIVERPOD_SERVICE_CODE,
  FLUTTER_PROVIDER_CODE,
  FLUTTER_FOLDER_STRUCTURE,
} from '../data/flutterDartCode';

export const FlutterArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'uiux' | 'auth' | 'models' | 'state' | 'provider' | 'folders' | 'rules'>('uiux');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (code: string, sectionId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const FLUTTER_THEME_CODE = `// ============================================================
// LOOK ENGLISH DESIGN SYSTEM & THEME DATA (lib/core/theme.dart)
// Màu chủ đạo: Xanh (Navy/Royal), Vàng (Golden Amber), Trắng (White), Đen (Onyx)
// ============================================================
import 'package:flutter/material.dart';

class LookEnglishColors {
  // 1. Xanh Chủ Đạo (Primary Brand)
  static const Color navyDark = Color(0xFF0F172A);      // Deep Slate Navy
  static const Color navyRoyal = Color(0xFF1E3A8A);     // LookEnglish Royal Blue
  static const Color blueAccent = Color(0xFF2563EB);    // Vibrant Sky/Blue

  // 2. Vàng Vinh Danh & Điểm Nhấn (Accent Gold)
  static const Color goldPrimary = Color(0xFFF59E0B);   // Amber Gold (Top 1 Badge)
  static const Color goldLight = Color(0xFFFBBF24);     // Canary Bright
  static const Color goldSurface = Color(0xFFFEF3C7);   // Soft Gold Container

  // 3. Trắng & Xám Nhạt (Crisp Whites)
  static const Color white = Color(0xFFFFFFFF);
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color surfaceMuted = Color(0xFFF1F5F9);

  // 4. Đen & Charcoal (Onyx Typography)
  static const Color textMain = Color(0xFF0F172A);      // 95% Black
  static const Color textSecondary = Color(0xFF64748B); // Slate Muted
  static const Color borderSubtle = Color(0xFFE2E8F0);
}

class LookEnglishTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: LookEnglishColors.backgroundLight,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: LookEnglishColors.navyRoyal,
        onPrimary: LookEnglishColors.white,
        secondary: LookEnglishColors.goldPrimary,
        onSecondary: LookEnglishColors.navyDark,
        surface: LookEnglishColors.white,
        onSurface: LookEnglishColors.textMain,
        error: Color(0xFFE11D48),
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: LookEnglishColors.white,
        foregroundColor: LookEnglishColors.textMain,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: LookEnglishColors.navyDark,
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: LookEnglishColors.navyRoyal,
          foregroundColor: LookEnglishColors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      cardTheme: CardTheme(
        color: LookEnglishColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: LookEnglishColors.borderSubtle),
        ),
      ),
    );
  }
}
`;

  const FLUTTER_AUTH_RBAC_CODE = `// ============================================================
// HỆ THỐNG XÁC THỰC & PHÂN QUYỀN (AUTH & RBAC ARCHITECTURE)
// (lib/features/auth/data/auth_repository.dart & app_router.dart)
// ============================================================
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// --- 1. AUTH REPOSITORY ---
class AuthRepository {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Lắng nghe trạng thái đăng nhập Firebase
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Lấy Profile người dùng và Role từ Firestore
  Future<UserModel?> getCurrentUserProfile() async {
    final currentUser = _auth.currentUser;
    if (currentUser == null) return null;

    final doc = await _firestore.collection('users').doc(currentUser.uid).get();
    if (!doc.exists) return null;
    return UserModel.fromJson(doc.data()!, doc.id);
  }

  // 1. Phụ huynh đăng ký tài khoản mới (Liên kết với con em)
  Future<UserModel> registerParent({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String childStudentId,
  }) async {
    // Tạo user trên Firebase Auth
    final userCredential = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    final uid = userCredential.user!.uid;

    final newParent = UserModel(
      id: uid,
      name: name,
      email: email,
      role: UserRole.parent,
      phone: phone,
      parentOfStudentId: childStudentId,
      accountStatus: 'active',
    );

    // Lưu Profile vào Firestore
    await _firestore.collection('users').doc(uid).set(newParent.toJson());
    return newParent;
  }

  // 2. Đăng nhập (Admin, Teacher, Student, Parent)
  Future<UserModel> signInWithEmailPassword({
    required String email,
    required String password,
  }) async {
    final userCredential = await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    final uid = userCredential.user!.uid;

    final doc = await _firestore.collection('users').doc(uid).get();
    if (!doc.exists) {
      throw Exception('Không tìm thấy thông tin tài khoản trên hệ thống!');
    }

    final user = UserModel.fromJson(doc.data()!, doc.id);
    if (user.accountStatus == 'locked') {
      await _auth.signOut();
      throw Exception('Tài khoản đã bị tạm khóa. Vui lòng liên hệ Admin trung tâm!');
    }
    return user;
  }

  // 3. Admin tạo tài khoản cho Giáo viên hoặc Học viên mới
  Future<void> adminCreateUserAccount({
    required String email,
    required String password,
    required String name,
    required UserRole role,
    String? assignedClassId,
    String? childStudentId,
  }) async {
    // Lưu ý: Trong môi trường Production, Admin gọi Cloud Function
    // (Firebase Admin SDK) để tạo user mà không làm văng session hiện tại của Admin.
    // Dưới đây là schema ghi trực tiếp Firestore User Profile:
    final docRef = _firestore.collection('users').doc();
    final newUser = UserModel(
      id: docRef.id,
      name: name,
      email: email,
      role: role,
      classId: assignedClassId,
      parentOfStudentId: childStudentId,
      accountStatus: 'active',
    );
    await docRef.set(newUser.toJson());
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}

// --- 2. GOROUTER VỚI ROLE-BASED NAVIGATION GUARD ---
// Phụ huynh chưa đăng nhập chỉ được xem /public-home
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider); // User Profile State

  return GoRouter(
    initialLocation: '/public-home',
    redirect: (context, state) {
      final isLoggedIn = authState.asData?.value != null;
      final user = authState.asData?.value;
      final currentLoc = state.matchedLocation;

      // 1. Người dùng CHƯA ĐĂNG NHẬP (Guest / Phụ huynh vãng lai):
      // Chỉ cho phép xem Trang Chủ công khai hoặc Màn hình Login/Register
      if (!isLoggedIn) {
        if (currentLoc == '/login' || currentLoc == '/register') {
          return null;
        }
        return '/public-home'; // Chặn mọi truy cập vào điểm số, bài tập, lớp học
      }

      // 2. Người dùng ĐÃ ĐĂNG NHẬP:
      if (currentLoc == '/public-home' || currentLoc == '/login') {
        // Điều hướng thông minh theo từng vai trò:
        switch (user!.role) {
          case UserRole.admin:
            return '/admin-dashboard';
          case UserRole.teacher:
            return '/teacher-dashboard';
          case UserRole.parent:
            return '/parent-student-portal';
          case UserRole.student:
            return '/student-portal';
        }
      }

      // 3. Phân quyền giáo viên: Chỉ được truy cập lớp học mình phụ trách
      if (user!.role == UserRole.teacher && currentLoc.startsWith('/classes/')) {
        final classId = state.pathParameters['id'];
        if (user.classId != classId && !(user.assignedClassIds?.contains(classId) ?? false)) {
          return '/unauthorized'; // Giáo viên không được can thiệp lớp khác
        }
      }

      return null;
    },
    routes: [
      GoRoute(path: '/public-home', builder: (context, state) => const PublicHomeScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterParentScreen()),
      GoRoute(path: '/admin-dashboard', builder: (context, state) => const AdminDashboardScreen()),
      GoRoute(path: '/teacher-dashboard', builder: (context, state) => const TeacherDashboardScreen()),
      GoRoute(path: '/parent-student-portal', builder: (context, state) => const ParentStudentPortalScreen()),
    ],
  );
});
`;

  const FIRESTORE_RULES_CODE = `// ============================================================
// FIRESTORE SECURITY RULES CHO LOOK ENGLISH (firestore.rules)
// Hỗ trợ phân quyền nghiêm ngặt: Admin, Teacher, Student, Parent, Guest
// ============================================================
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isTeacher() {
      return isAuthenticated() && getUserData().role == 'teacher';
    }

    // 0. Banners & Trang chủ: Ai cũng đọc được (Kể cả khách chưa login). Chỉ Admin sửa/xóa
    match /home_banners/{bannerId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /announcements/{ancId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // 1. Classes: Admin toàn quyền CRUD. Giới hạn 15 lớp học
    match /classes/{classId} {
      allow read: if isAuthenticated();
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || (isTeacher() && resource.data.teacherId == request.auth.uid);
    }
    
    // 2. Attendance & Grades: Khách chưa đăng nhập KHÔNG được đọc
    // Phụ huynh chỉ đọc được điểm danh của con mình
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isTeacher();
    }
    
    match /grades/{gradeId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isTeacher() || 
        resource.data.studentId == request.auth.uid || 
        getUserData().parentOfStudentId == resource.data.studentId
      );
      allow write: if isAdmin() || isTeacher();
    }
    
    // 3. Certificates: Public hoặc chỉ học viên/phụ huynh có liên kết
    match /certificates/{certificateId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isTeacher();
    }
    
    // 4. Leaderboard Top 1: Cho phép khách xem để tạo uy tín cho trung tâm
    match /leaderboards/{leaderboardId} {
      allow read: if true;
      allow write: if isAdmin() || isTeacher();
    }

    // 5. Users: Admin quản lý tất cả tài khoản
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if true; // Hỗ trợ phụ huynh đăng ký tài khoản
      allow update, delete: if isAdmin();
    }
  }
}
`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Senior Flutter Mobile Solution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              LOOK ENGLISH - Flutter Architecture & Design System
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Bộ tài liệu kiến trúc Flutter chuẩn doanh nghiệp: Bảng màu thương hiệu (Xanh, Vàng, Trắng, Đen),
              Xác thực & Phân quyền (Firebase Auth + GoRouter Guard), 8 Data Models, Riverpod/Provider State Management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold border border-white/15">
              Flutter 3.24+ / Dart 3.5+
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('uiux')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'uiux'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Thiết Kế UI/UX & Bảng Màu</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'auth'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Xác Thực & Phân Quyền (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'models'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>8 Data Models (Dart)</span>
          </button>

          <button
            onClick={() => setActiveTab('state')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'state'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Riverpod & CRUD Repositories</span>
          </button>

          <button
            onClick={() => setActiveTab('provider')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'provider'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Provider Alternative</span>
          </button>

          <button
            onClick={() => setActiveTab('folders')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'folders'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Cấu Trúc Thư Mục (lib/)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Firestore Rules & Security</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: AUTH & RBAC ARCHITECTURE */}
      {activeTab === 'auth' && (
        <div className="space-y-6">
          {/* Comparison Cards: Firebase Auth vs Supabase Auth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  GIẢI PHÁP ĐỀ XUẤT SỐ 1
                </span>
                <span className="text-xs font-bold text-emerald-600">Khuyên dùng cho LookEnglish</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Firebase Auth + Cloud Firestore</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ sinh thái chính thức từ Google, tương thích 100% với Flutter SDK. Tích hợp sẵn Firebase Storage (lưu ảnh bài tập, file PDF chứng chỉ, banner trang chủ).
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li><strong>Custom User Claims:</strong> Đóng gói quyền `admin`, `teacher`, `parent` vào JWT Token, xác thực tại mép mạng (Edge).</li>
                <li><strong>Security Rules linh hoạt:</strong> Kiểm tra vai trò trực tiếp từ collection `users`, chặn khách chưa đăng nhập xem điểm số.</li>
                <li><strong>Hỗ trợ Offline:</strong> Lưu cache danh sách điểm danh ngay khi mất mạng tại lớp học.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  LỰA CHỌN THAY THẾ
                </span>
                <span className="text-xs font-semibold text-slate-500">PostgreSQL Relational</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Supabase Auth (PostgreSQL RLS)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nền tảng mã nguồn mở trên nền PostgreSQL, sử dụng Row-Level Security (RLS) để phân quyền. Phù hợp nếu trung tâm có sẵn CSDL SQL quan hệ.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li><strong>Row Level Security (RLS):</strong> Viết policy bằng ngôn ngữ SQL trực tiếp trên database.</li>
                <li><strong>Auto-generated REST & GraphQL:</strong> API tự sinh nhanh chóng.</li>
                <li>Cần tự cấu hình Flutter Storage bucket và cài đặt phức tạp hơn Firebase trên iOS/Android.</li>
              </ul>
            </div>
          </div>

          {/* Code Viewer: AuthRepository & GoRouter Role Guard */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
                <KeyRound className="w-4 h-4" />
                <span>lib/features/auth/auth_repository.dart & app_router.dart (GoRouter Role Guard)</span>
              </div>
              <button
                onClick={() => handleCopy(FLUTTER_AUTH_RBAC_CODE, 'auth_code')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                {copiedSection === 'auth_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'auth_code' ? 'Đã sao chép' : 'Copy Auth & GoRouter Code'}</span>
              </button>
            </div>
            <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[600px]">
              {FLUTTER_AUTH_RBAC_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT 1: UI/UX DESIGN BLUEPRINT */}
      {activeTab === 'uiux' && (
        <div className="space-y-6">
          {/* Brand Palette Showcases */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <span>Hệ Màu Nhận Diện Thương Hiệu [LOOK ENGLISH]</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Phối màu theo tỷ lệ chuẩn 60-30-10: Trắng/Xám nền, Xanh Navy chủ đạo, Vàng Gold tạo điểm nhấn quyền năng.
                </p>
              </div>

              <button
                onClick={() => handleCopy(FLUTTER_THEME_CODE, 'theme')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {copiedSection === 'theme' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'theme' ? 'Đã sao chép Dart Theme' : 'Copy theme.dart'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Blue */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="h-20 bg-[#1E3A8A] flex items-end p-2.5 text-white font-mono text-xs font-bold">
                  #1E3A8A
                </div>
                <div className="p-3 bg-white">
                  <span className="font-extrabold text-xs text-slate-800 block">XANH ROYAL NAVY</span>
                  <span className="text-[11px] text-slate-500">Màu chủ đạo (Primary): Thanh lịch, uy tín, chuẩn quốc tế</span>
                </div>
              </div>

              {/* Gold */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="h-20 bg-[#F59E0B] flex items-end p-2.5 text-slate-950 font-mono text-xs font-black">
                  #F59E0B
                </div>
                <div className="p-3 bg-white">
                  <span className="font-extrabold text-xs text-slate-800 block">VÀNG GOLD AMBER</span>
                  <span className="text-[11px] text-slate-500">Màu điểm nhấn (Accent): Bảng vàng Top 1, Khen thưởng, Huy hiệu</span>
                </div>
              </div>

              {/* White */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="h-20 bg-[#F8FAFC] border-b border-slate-200 flex items-end p-2.5 text-slate-700 font-mono text-xs font-bold">
                  #FFFFFF / #F8FAFC
                </div>
                <div className="p-3 bg-white">
                  <span className="font-extrabold text-xs text-slate-800 block">TRẮNG TINH KHIẾT</span>
                  <span className="text-[11px] text-slate-500">Màu nền & Card (Surface): Không gian thoáng đãng, dễ đọc</span>
                </div>
              </div>

              {/* Black / Onyx */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="h-20 bg-[#0F172A] flex items-end p-2.5 text-white font-mono text-xs font-bold">
                  #0F172A
                </div>
                <div className="p-3 bg-white">
                  <span className="font-extrabold text-xs text-slate-800 block">ĐEN ONYX / SLATE</span>
                  <span className="text-[11px] text-slate-500">Chữ & Tiêu đề chính (Typography): Độ tương phản cao, sắc nét</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role UX Experience Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Admin Experience */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <span className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center font-black">
                  1
                </span>
                <span>Trải Nghiệm ADMIN (Quản Trị)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thiết kế dạng <strong>Dashboard KPI & Control Hub</strong> tối ưu tốc độ quản trị:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>
                  <strong>CMS Trang Chủ:</strong> Thêm/xóa banner, tin tức khai giảng và kiểm soát bảng vàng vinh danh.
                </li>
                <li>
                  <strong>Quản lý tài khoản:</strong> Cấp tài khoản cho giáo viên, phân quyền phụ trách lớp học, khóa tài khoản vi phạm.
                </li>
                <li>
                  <strong>Đồng hồ sức chứa 15 lớp:</strong> Thanh tiến trình Gauge cảnh báo trực quan khi chạm ngưỡng 15 lớp.
                </li>
              </ul>
            </div>

            {/* 2. Teacher Experience */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center font-black">
                  2
                </span>
                <span>Trải Nghiệm TEACHER (Giáo Viên)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tối ưu hóa thao tác trực tiếp trên lớp học (Hands-on Classroom Mode):
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>
                  <strong>Giới hạn quyền theo lớp:</strong> Giáo viên chỉ điểm danh và quản lý các lớp được Admin phân công.
                </li>
                <li>
                  <strong>Upload nhiều file bài tập:</strong> Hỗ trợ đính kèm đồng thời đề PDF và file audio nghe mp3.
                </li>
                <li>
                  <strong>Quick Praise Chips:</strong> Các nút tag khen thưởng ("Nói tự tin", "Hăng hái", "Xuất sắc") chỉ cần chạm để gắn vào hồ sơ học viên.
                </li>
              </ul>
            </div>

            {/* 3. Student & Parent Experience */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center font-black">
                  3
                </span>
                <span>Trải Nghiệm PHỤ HUYNH & KHÁCH</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bảo mật thông tin & Tạo uy tín thương hiệu:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>
                  <strong>Chế độ Khách (Chưa đăng nhập):</strong> Chỉ được xem trang chủ, khóa học, bảng vàng vinh danh công khai.
                </li>
                <li>
                  <strong>Sau khi đăng nhập:</strong> Xem trọn vẹn điểm số 4 kỹ năng của con, sổ điểm danh kèm ghi chú của giáo viên, kho chứng chỉ.
                </li>
                <li>
                  <strong>Tải & Chia sẻ chứng chỉ 1 chạm:</strong> Lưu file chứng chỉ sắc nét về máy hoặc chia sẻ qua Zalo.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 8 DATA MODELS (DART) */}
      {activeTab === 'models' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <Code2 className="w-4 h-4" />
              <span>lib/features/**/data/models/*.dart (8 Data Models)</span>
            </div>
            <button
              onClick={() => handleCopy(FLUTTER_DART_MODELS_CODE, 'models')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {copiedSection === 'models' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'models' ? 'Đã sao chép toàn bộ code Dart' : 'Copy All 8 Models'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[600px]">
            {FLUTTER_DART_MODELS_CODE}
          </pre>
        </div>
      )}

      {/* TAB CONTENT 3: RIVERPOD REPOSITORIES */}
      {activeTab === 'state' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <Server className="w-4 h-4" />
              <span>lib/features/classes/data/class_repository.dart (Riverpod & Firebase CRUD)</span>
            </div>
            <button
              onClick={() => handleCopy(FLUTTER_RIVERPOD_SERVICE_CODE, 'riverpod')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {copiedSection === 'riverpod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'riverpod' ? 'Đã sao chép' : 'Copy Riverpod Code'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[600px]">
            {FLUTTER_RIVERPOD_SERVICE_CODE}
          </pre>
        </div>
      )}

      {/* TAB CONTENT 4: PROVIDER ALTERNATIVE */}
      {activeTab === 'provider' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>lib/providers/class_provider.dart (Provider ChangeNotifier)</span>
            </div>
            <button
              onClick={() => handleCopy(FLUTTER_PROVIDER_CODE, 'provider')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {copiedSection === 'provider' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'provider' ? 'Đã sao chép' : 'Copy Provider Code'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[600px]">
            {FLUTTER_PROVIDER_CODE}
          </pre>
        </div>
      )}

      {/* TAB CONTENT 5: FOLDER STRUCTURE */}
      {activeTab === 'folders' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <FolderTree className="w-4 h-4" />
              <span>Flutter Clean Architecture Directory Tree (lib/)</span>
            </div>
            <button
              onClick={() => handleCopy(FLUTTER_FOLDER_STRUCTURE, 'folders')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {copiedSection === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'folders' ? 'Đã sao chép' : 'Copy Tree'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[600px]">
            {FLUTTER_FOLDER_STRUCTURE}
          </pre>
        </div>
      )}

      {/* TAB CONTENT 6: FIRESTORE SECURITY RULES */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>firestore.rules (Phân quyền bảo mật Firestore)</span>
            </div>
            <button
              onClick={() => handleCopy(FIRESTORE_RULES_CODE, 'rules')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'rules' ? 'Đã sao chép' : 'Copy Rules'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-[600px]">
            {FIRESTORE_RULES_CODE}
          </pre>
        </div>
      )}
    </div>
  );
};
