import React, { useState } from 'react';
import { UserModel, ClassModel, UserRole } from '../types';
import {
  GraduationCap,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Key,
  Mail,
  Phone,
  BookOpen,
} from 'lucide-react';

interface StudentsManagerProps {
  users: UserModel[];
  classes: ClassModel[];
  onAddStudent: (student: Omit<UserModel, 'id'>) => void;
  onUpdateStudent: (studentId: string, data: Partial<UserModel>) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  users,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserModel | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    studentCode: '',
    email: '',
    phone: '',
    classId: classes[0]?.id || '',
    password: 'Lookenglish@123',
  });

  const students = users.filter((u) => u.role === 'student');

  const filteredStudents = students.filter((stu) => {
    if (classFilter !== 'all' && stu.classId !== classFilter) return false;
    if (
      searchQuery &&
      !stu.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !stu.studentCode?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !stu.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      studentCode: `LK-STU-${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      phone: '',
      classId: classes[0]?.id || '',
      password: 'Lookenglish@123',
    });
    setEditingStudent(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (stu: UserModel) => {
    setEditingStudent(stu);
    setFormData({
      name: stu.name,
      studentCode: stu.studentCode || '',
      email: stu.email,
      phone: stu.phone || '',
      classId: stu.classId || classes[0]?.id || '',
      password: stu.password || 'Lookenglish@123',
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.studentCode.trim()) return;

    if (editingStudent) {
      onUpdateStudent(editingStudent.id, {
        name: formData.name,
        studentCode: formData.studentCode.trim().toUpperCase(),
        email: formData.email,
        phone: formData.phone,
        classId: formData.classId,
        password: formData.password,
      });
    } else {
      onAddStudent({
        name: formData.name,
        studentCode: formData.studentCode.trim().toUpperCase(),
        email: formData.email || `${formData.studentCode.toLowerCase()}@lookenglish.edu.vn`,
        phone: formData.phone,
        classId: formData.classId,
        role: 'student',
        password: formData.password,
        accountStatus: 'active',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Filter */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Quản Lý Hồ Sơ Học Viên Toàn Trung Tâm</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Danh Sách Học Viên ({students.length} học sinh)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin có thể thêm mới, điều chỉnh thông tin, cấp Mã số học viên và xếp lớp học cho từng em.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Học Viên Mới</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã học viên (VD: LK-STAR-101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tất cả lớp học ({classes.length} lớp)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className} ({c.level})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">MÃ HỌC VIÊN</th>
                <th className="py-4 px-4 sm:px-6">HỌ VÀ TÊN</th>
                <th className="py-4 px-4">LỚP HỌC</th>
                <th className="py-4 px-4">LIÊN HỆ / EMAIL</th>
                <th className="py-4 px-4">PHỤ HUYNH LIÊN KẾT</th>
                <th className="py-4 px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((stu) => {
                const assignedClass = classes.find((c) => c.id === stu.classId);
                const parent = users.find((u) => u.role === 'parent' && u.parentOfStudentId === stu.id);

                return (
                  <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-black text-blue-700 whitespace-nowrap">
                      {stu.studentCode || 'LK-STU-000'}
                    </td>

                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={stu.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                          alt={stu.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <span>{stu.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {assignedClass ? (
                        <div>
                          <strong className="text-slate-800 block">{assignedClass.className}</strong>
                          <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                            {assignedClass.level}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa xếp lớp</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{stu.email}</span>
                      </div>
                      {stu.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{stu.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      {parent ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{parent.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có tài khoản PH</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(stu)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Điều chỉnh thông tin học viên"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa học viên ${stu.name}?`)) {
                              onDeleteStudent(stu.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa học viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT STUDENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingStudent ? 'Điều Chỉnh Hồ Sơ Học Viên' : 'Thêm Học Viên Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã Số Học Viên (Bắt buộc) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: LK-STAR-101 hoặc LK-IELTS-204"
                  value={formData.studentCode}
                  onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mã này dùng để Phụ huynh nhập liên kết tài khoản khi tự đăng ký.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ Và Tên Học Sinh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Quân (Leo)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Xếp Vào Lớp Học</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Chưa xếp lớp --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Học Viên / Phụ Huynh</label>
                <input
                  type="email"
                  placeholder="student@lookenglish.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại Phụ Huynh</label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mật Khẩu Đăng Nhập</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900"
                >
                  {editingStudent ? 'Cập Nhật Hồ Sơ' : 'Lưu Học Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
