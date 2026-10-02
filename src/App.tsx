import React, { useState, useEffect } from 'react';
import {
  UserRole,
  UserModel,
  ClassModel,
  AttendanceModel,
  GradeModel,
  AssignmentModel,
  EvaluationModel,
  CertificateModel,
  LeaderboardModel,
  HomeBannerModel,
  CenterAnnouncementModel,
  HomeMediaItemModel,
  ScheduleSessionModel,
  TeacherTimesheetModel,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_ATTENDANCE,
  INITIAL_GRADES,
  INITIAL_ASSIGNMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_LEADERBOARDS,
  INITIAL_HOME_BANNERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_MEDIA_ITEMS,
  INITIAL_SCHEDULE_SESSIONS,
  INITIAL_TEACHER_TIMESHEETS,
} from './data/initialData';
import { Header } from './components/Header';
import { RoleTabsBar } from './components/RoleTabsBar';
import { PublicHome } from './components/PublicHome';
import { ClassesManager } from './components/ClassesManager';
import { StudentsManager } from './components/StudentsManager';
import { ScheduleManager } from './components/ScheduleManager';
import { AttendanceManager } from './components/AttendanceManager';
import { AcademicGradesManager } from './components/AcademicGradesManager';
import { HomeworkManager } from './components/HomeworkManager';
import { EvaluationManager } from './components/EvaluationManager';
import { CertificateVault } from './components/CertificateVault';
import { LeaderboardView } from './components/LeaderboardView';
import { AccountManager } from './components/AccountManager';
import { AiAssistantTab } from './components/AiAssistantTab';
import { AuthModal } from './components/AuthModal';

import {
  BookOpen,
  CalendarCheck,
  Award,
  FileText,
  MessageSquareQuote,
  ShieldCheck,
  Trophy,
  Bot,
  Users,
  GraduationCap,
  Newspaper,
  Calendar,
  Lock,
} from 'lucide-react';

export default function App() {
  // Default to 'news' (Bản tin) when not logged in
  const [mainRoleTab, setMainRoleTab] = useState<'parent' | 'teacher' | 'admin' | 'news'>('news');

  // Active sub-features
  const [adminSubFeature, setAdminSubFeature] = useState<'classes' | 'schedule' | 'students' | 'accounts' | 'attendance' | 'grades' | 'homework' | 'evaluations' | 'certificates' | 'leaderboard' | 'cms' | 'ai'>('classes');
  const [teacherSubFeature, setTeacherSubFeature] = useState<'attendance' | 'schedule' | 'grades' | 'homework' | 'evaluations' | 'classes' | 'ai'>('attendance');
  const [parentSubFeature, setParentSubFeature] = useState<'grades' | 'schedule' | 'attendance' | 'homework' | 'certificates' | 'leaderboard' | 'ai'>('grades');

  // Default state: 'guest' (Chưa đăng nhập - chỉ xem được bản tin)
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Local Storage backed state with guaranteed official Admin credentials sync
  const [users, setUsers] = useState<UserModel[]>(() => {
    const saved = localStorage.getItem('look_english_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserModel[];
        const hasOfficialAdmin = parsed.some((u) => u.email === 'thienngan983@look.edu.vn');
        if (hasOfficialAdmin && parsed.length >= 8) return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  // Over 20 classes across all levels
  const [classes, setClasses] = useState<ClassModel[]>(() => {
    const saved = localStorage.getItem('look_english_classes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ClassModel[];
        if (parsed.length >= 20) return parsed;
      } catch (e) {}
    }
    return INITIAL_CLASSES;
  });

  const [attendance, setAttendance] = useState<AttendanceModel[]>(() => {
    const saved = localStorage.getItem('look_english_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [grades, setGrades] = useState<GradeModel[]>(() => {
    const saved = localStorage.getItem('look_english_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [assignments, setAssignments] = useState<AssignmentModel[]>(() => {
    const saved = localStorage.getItem('look_english_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [evaluations, setEvaluations] = useState<EvaluationModel[]>(() => {
    const saved = localStorage.getItem('look_english_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [certificates, setCertificates] = useState<CertificateModel[]>(() => {
    const saved = localStorage.getItem('look_english_certificates');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardModel[]>(() => {
    const saved = localStorage.getItem('look_english_leaderboard');
    return saved ? JSON.parse(saved) : INITIAL_LEADERBOARDS;
  });

  const [homeBanners, setHomeBanners] = useState<HomeBannerModel[]>(() => {
    const saved = localStorage.getItem('look_english_banners');
    return saved ? JSON.parse(saved) : INITIAL_HOME_BANNERS;
  });

  const [announcements, setAnnouncements] = useState<CenterAnnouncementModel[]>(() => {
    const saved = localStorage.getItem('look_english_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // Media items (Images and Videos for Center)
  const [mediaItems, setMediaItems] = useState<HomeMediaItemModel[]>(() => {
    const saved = localStorage.getItem('look_english_media_items');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA_ITEMS;
  });

  // Class Schedules & Teacher Timesheets
  const [sessions, setSessions] = useState<ScheduleSessionModel[]>(() => {
    const saved = localStorage.getItem('look_english_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE_SESSIONS;
  });

  const [timesheets, setTimesheets] = useState<TeacherTimesheetModel[]>(() => {
    const saved = localStorage.getItem('look_english_timesheets');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_TIMESHEETS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('look_english_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('look_english_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('look_english_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('look_english_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('look_english_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('look_english_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('look_english_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('look_english_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('look_english_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('look_english_media_items', JSON.stringify(mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    localStorage.setItem('look_english_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('look_english_timesheets', JSON.stringify(timesheets));
  }, [timesheets]);

  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) : undefined;
  const isLoggedIn = currentRole !== 'guest' && !!currentUser;

  // Find linked child if user is Parent
  const linkedChild = currentUser?.parentOfStudentId
    ? users.find((u) => u.id === currentUser.parentOfStudentId)
    : undefined;

  // Filter classes strictly for Teacher
  const teacherAssignedClasses = classes.filter((c) =>
    currentUser?.assignedClassIds?.includes(c.id) ||
    c.teacherId === currentUser?.id ||
    c.id === currentUser?.classId
  );

  // Auth Handlers
  const handleLoginSuccess = (user: UserModel) => {
    setCurrentRole(user.role);
    setCurrentUserId(user.id);
    if (user.role === 'admin') {
      setMainRoleTab('admin');
      setAdminSubFeature('classes');
    } else if (user.role === 'teacher') {
      setMainRoleTab('teacher');
      setTeacherSubFeature('attendance');
    } else {
      setMainRoleTab('parent');
      setParentSubFeature('grades');
    }
  };

  const handleRegisterSuccess = (newUser: UserModel) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentRole(newUser.role);
    setCurrentUserId(newUser.id);
    setMainRoleTab('parent');
    setParentSubFeature('grades');
  };

  const handleLogout = () => {
    setCurrentRole('guest');
    setCurrentUserId('');
    setMainRoleTab('news');
  };

  // Restrict access when user clicks on protected tabs
  const handleSelectRoleTab = (tab: 'parent' | 'teacher' | 'admin' | 'news') => {
    if (tab === 'news') {
      setMainRoleTab('news');
      return;
    }

    // If NOT logged in: Cannot view anything other than 'news'!
    if (!isLoggedIn) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    // If logged in as Parent: Can ONLY view 'parent' and 'news'
    if (currentRole === 'parent') {
      if (tab === 'admin' || tab === 'teacher') {
        alert('Tài khoản Phụ huynh chỉ có quyền xem thông tin học tập của con em mình và Bản Tin!');
        return;
      }
      setMainRoleTab('parent');
      return;
    }

    // If logged in as Teacher
    if (currentRole === 'teacher') {
      if (tab === 'admin') {
        alert('Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập cổng này!');
        return;
      }
      setMainRoleTab(tab);
      return;
    }

    // Admin has full access
    setMainRoleTab(tab);
  };

  // CRUD Classes (Support over 20 classes across all levels)
  const handleAddClass = (newClassData: Omit<ClassModel, 'id'>) => {
    const newClass: ClassModel = { ...newClassData, id: `cls_${Date.now()}` };
    setClasses((prev) => [...prev, newClass]);
    if (newClass.teacherId) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === newClass.teacherId) {
            const currentAssigned = u.assignedClassIds || [];
            return {
              ...u,
              assignedClassIds: currentAssigned.includes(newClass.id) ? currentAssigned : [...currentAssigned, newClass.id],
            };
          }
          return u;
        })
      );
    }
  };

  const handleUpdateClass = (classId: string, data: Partial<ClassModel>) => {
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, ...data } : c)));
    if (data.teacherId) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === data.teacherId) {
            const currentAssigned = u.assignedClassIds || [];
            return {
              ...u,
              assignedClassIds: currentAssigned.includes(classId) ? currentAssigned : [...currentAssigned, classId],
            };
          }
          return u;
        })
      );
    }
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
  };

  const handleAddStudentToClass = (classId: string, studentId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId && !c.studentList.includes(studentId)) {
          return { ...c, studentList: [...c.studentList, studentId] };
        }
        return c;
      })
    );
    setUsers((prev) =>
      prev.map((u) => (u.id === studentId ? { ...u, classId } : u))
    );
  };

  const handleRemoveStudentFromClass = (classId: string, studentId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            studentList: c.studentList.filter((id) => id !== studentId),
          };
        }
        return c;
      })
    );
    setUsers((prev) =>
      prev.map((u) => (u.id === studentId ? { ...u, classId: undefined } : u))
    );
  };

  // CRUD Students (For Admin Students Manager)
  const handleAddStudent = (studentData: Omit<UserModel, 'id'>) => {
    const newStu: UserModel = { ...studentData, id: `usr_stu_${Date.now()}` };
    setUsers((prev) => [...prev, newStu]);
    if (newStu.classId) {
      handleAddStudentToClass(newStu.classId, newStu.id);
    }
  };

  const handleUpdateStudent = (studentId: string, data: Partial<UserModel>) => {
    setUsers((prev) => prev.map((u) => (u.id === studentId ? { ...u, ...data } : u)));
    if (data.classId) {
      handleAddStudentToClass(data.classId, studentId);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== studentId));
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        studentList: c.studentList.filter((id) => id !== studentId),
      }))
    );
  };

  // Media (Images & Videos) CRUD Handlers for Admin
  const handleAddMediaItem = (itemData: Omit<HomeMediaItemModel, 'id'>) => {
    const newItem: HomeMediaItemModel = { ...itemData, id: `med_${Date.now()}` };
    setMediaItems((prev) => [newItem, ...prev]);
  };

  const handleUpdateMediaItem = (id: string, data: Partial<HomeMediaItemModel>) => {
    setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const handleDeleteMediaItem = (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
  };

  // Announcements CRUD Handlers for Admin
  const handleAddAnnouncement = (ancData: Omit<CenterAnnouncementModel, 'id'>) => {
    const newAnc: CenterAnnouncementModel = { ...ancData, id: `anc_${Date.now()}` };
    setAnnouncements((prev) => [newAnc, ...prev]);
  };

  const handleUpdateAnnouncement = (id: string, data: Partial<CenterAnnouncementModel>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Schedule & Timesheet handlers
  const handleAddSession = (sessionData: Omit<ScheduleSessionModel, 'id'>) => {
    const newSession: ScheduleSessionModel = { ...sessionData, id: `sch_${Date.now()}` };
    setSessions((prev) => [...prev, newSession]);
  };

  const handleAddTimesheetRecord = (recordData: Omit<TeacherTimesheetModel, 'id'>) => {
    const newTs: TeacherTimesheetModel = { ...recordData, id: `ts_${Date.now()}` };
    setTimesheets((prev) => [newTs, ...prev]);
  };

  const handleUpdateTimesheetStatus = (
    timesheetId: string,
    status: TeacherTimesheetModel['status'],
    confirmed?: boolean
  ) => {
    setTimesheets((prev) =>
      prev.map((ts) =>
        ts.id === timesheetId
          ? { ...ts, status, confirmedByAdmin: confirmed ?? ts.confirmedByAdmin }
          : ts
      )
    );
  };

  // Attendance Batch
  const handleSaveBatchAttendance = (items: AttendanceModel[]) => {
    setAttendance((prev) => {
      const updated = [...prev];
      for (const item of items) {
        const idx = updated.findIndex(
          (a) =>
            a.classId === item.classId &&
            a.studentId === item.studentId &&
            a.date === item.date
        );
        if (idx >= 0) {
          updated[idx] = item;
        } else {
          updated.push(item);
        }
      }
      return updated;
    });
  };

  // Grades
  const handleAddGrade = (gradeData: Omit<GradeModel, 'id'>) => {
    const newGrade: GradeModel = { ...gradeData, id: `grd_${Date.now()}` };
    setGrades((prev) => [newGrade, ...prev]);
  };

  // Homework
  const handleAddAssignment = (asgData: Omit<AssignmentModel, 'id'>) => {
    const newAsg: AssignmentModel = { ...asgData, id: `asg_${Date.now()}` };
    setAssignments((prev) => [newAsg, ...prev]);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  const handleSubmitHomework = (
    assignmentId: string,
    submission: { studentId: string; studentName: string; fileName: string; fileUrl: string }
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          const currentSubs = a.submissions || [];
          const existingIdx = currentSubs.findIndex((s) => s.studentId === submission.studentId);
          const newSub = {
            ...submission,
            submittedAt: new Date().toLocaleString(),
          };

          if (existingIdx >= 0) {
            const nextSubs = [...currentSubs];
            nextSubs[existingIdx] = newSub;
            return { ...a, submissions: nextSubs };
          }
          return { ...a, submissions: [newSub, ...currentSubs] };
        }
        return a;
      })
    );
  };

  const handleGradeSubmission = (
    assignmentId: string,
    studentId: string,
    score: number,
    feedback: string
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId && a.submissions) {
          return {
            ...a,
            submissions: a.submissions.map((sub) =>
              sub.studentId === studentId
                ? { ...sub, score, teacherFeedback: feedback }
                : sub
            ),
          };
        }
        return a;
      })
    );
  };

  // Evaluation
  const handleAddEvaluation = (evalData: Omit<EvaluationModel, 'id'>) => {
    const newEval: EvaluationModel = { ...evalData, id: `evl_${Date.now()}` };
    setEvaluations((prev) => [newEval, ...prev]);
  };

  // Certificate
  const handleUploadCertificate = (certData: Omit<CertificateModel, 'id'>) => {
    const newCert: CertificateModel = { ...certData, id: `cert_${Date.now()}` };
    setCertificates((prev) => [newCert, ...prev]);
  };

  // Leaderboard Top 1
  const handleAddTop1Record = (lbData: Omit<LeaderboardModel, 'id'>) => {
    const newLb: LeaderboardModel = { ...lbData, id: `lb_${Date.now()}` };
    setLeaderboard((prev) => [newLb, ...prev]);
  };

  // User Accounts
  const handleAddUser = (userData: Omit<UserModel, 'id'>) => {
    const newUser: UserModel = { ...userData, id: `usr_${Date.now()}` };
    setUsers((prev) => [...prev, newUser]);
  };

  const handleUpdateUser = (userId: string, data: Partial<UserModel>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 
        ============================================================
        1. TOP HEADER
        Logo [★], Center Name, Language VN, Register, Login
        ============================================================
      */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentUser={currentUser}
        onOpenLoginModal={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onOpenRegisterModal={() => {
          setAuthModalMode('register');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* 
          ============================================================
          2. ROLE TABS SEGMENT
          ============================================================
        */}
        <RoleTabsBar
          currentTab={mainRoleTab}
          onSelectTab={handleSelectRoleTab}
          isLoggedIn={isLoggedIn}
          userRole={currentRole}
          childName={linkedChild?.name}
        />

        {/* 
          ============================================================
          3. TAB ROUTING
          ============================================================
        */}

        {/* TAB 1: BẢN TIN TRUNG TÂM */}
        {mainRoleTab === 'news' && (
          <PublicHome
            banners={homeBanners}
            mediaItems={mediaItems}
            announcements={announcements}
            leaderboards={leaderboard}
            users={users}
            currentRole={currentRole}
            onLoginClick={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
            onRegisterClick={() => {
              setAuthModalMode('register');
              setAuthModalOpen(true);
            }}
            onAddMediaItem={handleAddMediaItem}
            onUpdateMediaItem={handleUpdateMediaItem}
            onDeleteMediaItem={handleDeleteMediaItem}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onNavigateToLeaderboard={() => {}}
          />
        )}

        {/* TAB 2: PHỤ HUYNH (CHỈ XEM ĐƯỢC THÔNG TIN & LỊCH HỌC CỦA RIÊNG CON MÌNH) */}
        {mainRoleTab === 'parent' && isLoggedIn && (
          <div className="space-y-4">
            {/* Child Header Card for Parent */}
            {linkedChild && (
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                    {linkedChild.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-white/10 px-2 py-0.5 rounded-md">
                      Học Viên Của Quý Phụ Huynh
                    </span>
                    <h2 className="text-lg sm:text-xl font-black">{linkedChild.name}</h2>
                    <p className="text-xs text-blue-200">
                      Mã số: <strong className="text-amber-300 font-mono">{linkedChild.studentCode || 'LK-IELTS-204'}</strong> • Lớp: {classes.find(c => c.id === linkedChild.classId)?.className || 'IELTS Intensive 6.5+'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-blue-200 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
                  🛡️ Dữ liệu bảo mật chỉ riêng phụ huynh em {linkedChild.name} xem được
                </div>
              </div>
            )}

            {/* Parent Sub-Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              <button
                onClick={() => setParentSubFeature('grades')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  parentSubFeature === 'grades'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Bảng Điểm Con Em</span>
              </button>

              <button
                onClick={() => setParentSubFeature('schedule')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  parentSubFeature === 'schedule'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch Học Của Con</span>
              </button>

              <button
                onClick={() => setParentSubFeature('attendance')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  parentSubFeature === 'attendance'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Sổ Điểm Danh & Ghi Chú</span>
              </button>

              <button
                onClick={() => setParentSubFeature('homework')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  parentSubFeature === 'homework'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bài Tập Về Nhà</span>
              </button>

              <button
                onClick={() => setParentSubFeature('certificates')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  parentSubFeature === 'certificates'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kho Chứng Chỉ Của Con</span>
              </button>

              <button
                onClick={() => setParentSubFeature('leaderboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  parentSubFeature === 'leaderboard'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Bảng Vàng Top 1</span>
              </button>

              <button
                onClick={() => setParentSubFeature('ai')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  parentSubFeature === 'ai'
                    ? 'bg-indigo-950 text-amber-300 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span>Hỏi Đáp Trợ Lý AI</span>
              </button>
            </div>

            {/* Parent Views - STRICTLY FOR THEIR CHILD */}
            {parentSubFeature === 'grades' && (
              <AcademicGradesManager
                grades={grades}
                users={users}
                currentRole="parent"
                currentUserId={currentUser?.id || 'usr_parent_1'}
                onAddGrade={handleAddGrade}
              />
            )}

            {parentSubFeature === 'schedule' && (
              <ScheduleManager
                classes={classes}
                users={users}
                sessions={sessions}
                timesheets={timesheets}
                currentRole="parent"
                childStudentId={currentUser?.parentOfStudentId || 'usr_student_2'}
              />
            )}

            {parentSubFeature === 'attendance' && (
              <AttendanceManager
                classes={classes}
                users={users}
                attendance={attendance}
                currentRole="parent"
                childStudentId={currentUser?.parentOfStudentId || 'usr_student_2'}
                onSaveBatchAttendance={handleSaveBatchAttendance}
              />
            )}

            {parentSubFeature === 'homework' && (
              <HomeworkManager
                assignments={assignments}
                classes={classes}
                users={users}
                currentRole="student"
                currentUserId={currentUser?.parentOfStudentId || 'usr_student_2'}
                onAddAssignment={handleAddAssignment}
                onSubmitHomework={handleSubmitHomework}
                onGradeSubmission={handleGradeSubmission}
              />
            )}

            {parentSubFeature === 'certificates' && (
              <CertificateVault
                certificates={certificates}
                users={users}
                currentRole="parent"
                currentUserId={currentUser?.parentOfStudentId || 'usr_student_2'}
                onUploadCertificate={handleUploadCertificate}
              />
            )}

            {parentSubFeature === 'leaderboard' && (
              <LeaderboardView
                leaderboard={leaderboard}
                classes={classes}
                users={users}
                currentRole="parent"
                onAddTop1Record={handleAddTop1Record}
              />
            )}

            {parentSubFeature === 'ai' && (
              <AiAssistantTab
                currentRole="parent"
                userName={currentUser?.name || 'Quý Phụ Huynh'}
              />
            )}
          </div>
        )}

        {/* TAB 3: GIÁO VIÊN (LỊCH GIẢNG DẠY & CHẤM CÔNG CỦA GIÁO VIÊN) */}
        {mainRoleTab === 'teacher' && isLoggedIn && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              <button
                onClick={() => setTeacherSubFeature('attendance')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  teacherSubFeature === 'attendance'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Điểm Danh & Ghi Chú</span>
              </button>

              <button
                onClick={() => setTeacherSubFeature('schedule')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  teacherSubFeature === 'schedule'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch Giảng Dạy</span>
              </button>

              <button
                onClick={() => setTeacherSubFeature('grades')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  teacherSubFeature === 'grades'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Chấm Điểm 4 Kỹ Năng</span>
              </button>

              <button
                onClick={() => setTeacherSubFeature('homework')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  teacherSubFeature === 'homework'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Giao Bài & Chấm Bài</span>
              </button>

              <button
                onClick={() => setTeacherSubFeature('evaluations')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  teacherSubFeature === 'evaluations'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Khen Thưởng / Phê Bình</span>
              </button>

              <button
                onClick={() => setTeacherSubFeature('classes')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  teacherSubFeature === 'classes'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lớp Phụ Trách ({teacherAssignedClasses.length} lớp)</span>
              </button>

              <button
                onClick={() => setTeacherSubFeature('ai')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  teacherSubFeature === 'ai'
                    ? 'bg-indigo-950 text-amber-300 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span>Trợ Lý Giáo Án AI</span>
              </button>
            </div>

            {/* Teacher Views */}
            {teacherSubFeature === 'attendance' && (
              <AttendanceManager
                classes={teacherAssignedClasses}
                users={users}
                attendance={attendance}
                currentRole="teacher"
                onSaveBatchAttendance={handleSaveBatchAttendance}
              />
            )}

            {teacherSubFeature === 'schedule' && (
              <ScheduleManager
                classes={teacherAssignedClasses}
                users={users}
                sessions={sessions}
                timesheets={timesheets}
                currentRole="teacher"
                currentUserId={currentUser?.id || 'usr_teacher_1'}
              />
            )}

            {teacherSubFeature === 'grades' && (
              <AcademicGradesManager
                grades={grades}
                users={users}
                classes={teacherAssignedClasses}
                currentRole="teacher"
                currentUserId={currentUser?.id || 'usr_teacher_1'}
                onAddGrade={handleAddGrade}
              />
            )}

            {teacherSubFeature === 'homework' && (
              <HomeworkManager
                assignments={assignments}
                classes={teacherAssignedClasses}
                users={users}
                currentRole="teacher"
                currentUserId={currentUser?.id || 'usr_teacher_1'}
                onAddAssignment={handleAddAssignment}
                onDeleteAssignment={handleDeleteAssignment}
                onSubmitHomework={handleSubmitHomework}
                onGradeSubmission={handleGradeSubmission}
              />
            )}

            {teacherSubFeature === 'evaluations' && (
              <EvaluationManager
                evaluations={evaluations}
                users={users}
                classes={teacherAssignedClasses}
                currentRole="teacher"
                currentUserId={currentUser?.id || 'usr_teacher_1'}
                onAddEvaluation={handleAddEvaluation}
              />
            )}

            {teacherSubFeature === 'classes' && (
              <ClassesManager
                classes={teacherAssignedClasses}
                users={users}
                currentRole="teacher"
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onAddStudentToClass={handleAddStudentToClass}
                onRemoveStudentFromClass={handleRemoveStudentFromClass}
              />
            )}

            {teacherSubFeature === 'ai' && (
              <AiAssistantTab
                currentRole="teacher"
                userName={currentUser?.name || 'Giáo Viên'}
              />
            )}
          </div>
        )}

        {/* TAB 4: ADMIN (LỊCH HỌC TRUNG TÂM & CHẤM CÔNG GIÁO VIÊN TỰ ĐỘNG) */}
        {mainRoleTab === 'admin' && isLoggedIn && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              <button
                onClick={() => setAdminSubFeature('classes')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'classes'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lớp Học ({classes.length} Lớp)</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('schedule')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'schedule'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch Học & Chấm Công</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('students')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'students'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Danh Sách Học Viên</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('cms')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'cms'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Bản Tin & CMS</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('accounts')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'accounts'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tài Khoản GV & PH</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('attendance')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'attendance'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Điểm Danh & Ghi Chú</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('grades')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'grades'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Bảng Điểm 4 Kỹ Năng</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('homework')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'homework'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bài Tập Về Nhà</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('evaluations')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'evaluations'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Khen Thưởng / Phê Bình</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('certificates')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'certificates'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kho Chứng Chỉ</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('leaderboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'leaderboard'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Bảng Vàng Top 1</span>
              </button>

              <button
                onClick={() => setAdminSubFeature('ai')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  adminSubFeature === 'ai'
                    ? 'bg-indigo-950 text-amber-300 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span>LookEnglish AI</span>
              </button>
            </div>

            {adminSubFeature === 'classes' && (
              <ClassesManager
                classes={classes}
                users={users}
                currentRole="admin"
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onAddStudentToClass={handleAddStudentToClass}
                onRemoveStudentFromClass={handleRemoveStudentFromClass}
              />
            )}

            {adminSubFeature === 'schedule' && (
              <ScheduleManager
                classes={classes}
                users={users}
                sessions={sessions}
                timesheets={timesheets}
                currentRole="admin"
                currentUserId={currentUserId}
                onAddSession={handleAddSession}
                onAddTimesheetRecord={handleAddTimesheetRecord}
                onUpdateTimesheetStatus={handleUpdateTimesheetStatus}
              />
            )}

            {adminSubFeature === 'students' && (
              <StudentsManager
                users={users}
                classes={classes}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            )}

            {adminSubFeature === 'cms' && (
              <PublicHome
                banners={homeBanners}
                mediaItems={mediaItems}
                announcements={announcements}
                leaderboards={leaderboard}
                users={users}
                currentRole="admin"
                onLoginClick={() => {}}
                onRegisterClick={() => {}}
                onAddMediaItem={handleAddMediaItem}
                onUpdateMediaItem={handleUpdateMediaItem}
                onDeleteMediaItem={handleDeleteMediaItem}
                onAddAnnouncement={handleAddAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onNavigateToLeaderboard={() => {}}
              />
            )}

            {adminSubFeature === 'accounts' && (
              <AccountManager
                users={users}
                classes={classes}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {adminSubFeature === 'attendance' && (
              <AttendanceManager
                classes={classes}
                users={users}
                attendance={attendance}
                currentRole="admin"
                onSaveBatchAttendance={handleSaveBatchAttendance}
              />
            )}

            {adminSubFeature === 'grades' && (
              <AcademicGradesManager
                grades={grades}
                users={users}
                classes={classes}
                currentRole="admin"
                currentUserId={currentUserId}
                onAddGrade={handleAddGrade}
              />
            )}

            {adminSubFeature === 'homework' && (
              <HomeworkManager
                assignments={assignments}
                classes={classes}
                users={users}
                currentRole="admin"
                currentUserId={currentUserId}
                onAddAssignment={handleAddAssignment}
                onDeleteAssignment={handleDeleteAssignment}
                onSubmitHomework={handleSubmitHomework}
                onGradeSubmission={handleGradeSubmission}
              />
            )}

            {adminSubFeature === 'evaluations' && (
              <EvaluationManager
                evaluations={evaluations}
                users={users}
                classes={classes}
                currentRole="admin"
                currentUserId={currentUserId}
                onAddEvaluation={handleAddEvaluation}
              />
            )}

            {adminSubFeature === 'certificates' && (
              <CertificateVault
                certificates={certificates}
                users={users}
                currentRole="admin"
                currentUserId={currentUserId}
                onUploadCertificate={handleUploadCertificate}
              />
            )}

            {adminSubFeature === 'leaderboard' && (
              <LeaderboardView
                leaderboard={leaderboard}
                classes={classes}
                users={users}
                currentRole="admin"
                onAddTop1Record={handleAddTop1Record}
              />
            )}

            {adminSubFeature === 'ai' && (
              <AiAssistantTab
                currentRole="admin"
                userName={currentUser?.name || 'Admin'}
              />
            )}
          </div>
        )}
      </main>

      {/* Auth Modal for Parent Registration (with mandatory student code) & Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        existingUsers={users}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">LOOK ENGLISH</span>
            <span>• Hệ thống Quản lý & Học tập Trung tâm Ngoại ngữ</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
            <span>Thời Khóa Biểu & Chấm Công</span>
            <span>•</span>
            <span>Hơn 20 Lớp Học</span>
            <span>•</span>
            <span>Pre-kids, Kids, Teens, A1-C1, IELTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
