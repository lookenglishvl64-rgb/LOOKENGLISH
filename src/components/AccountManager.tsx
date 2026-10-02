import React, { useState } from 'react';
import { UserModel, ClassModel, UserRole } from '../types';
import {
  Users,
  UserPlus,
  Key,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Shield,
  BookOpen,
  Search,
  Filter,
} from 'lucide-react';

interface AccountManagerProps {
  users: UserModel[];
  classes: ClassModel[];
  onAddUser: (user: Omit<UserModel, 'id'>) => void;
  onUpdateUser: (userId: string, data: Partial<UserModel>) => void;
  onDeleteUser: (userId: string) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  users,
  classes,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher' as UserRole,
    password: 'Lookenglish@123',
    classId: classes[0]?.id || '',
    assignedClassIds: [] as string[],
    parentOfStudentId: '',
  });

  const allStudents = users.filter((u) => u.role === 'student');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'teacher',
      password: 'Lookenglish@123',
      classId: classes[0]?.id || '',
      assignedClassIds: [classes[0]?.id || ''],
      parentOfStudentId: allStudents[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (user: UserModel) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: user.password || 'Lookenglish@123',
      classId: user.classId || classes[0]?.id || '',
      assignedClassIds: user.assignedClassIds || (user.classId ? [user.classId] : []),
      parentOfStudentId: user.parentOfStudentId || allStudents[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.name.trim()) return;

    if (editingUser) {
      onUpdateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        classId: formData.role === 'teacher' ? formData.classId : undefined,
        assignedClassIds: formData.role === 'teacher' ? formData.assignedClassIds : undefined,
        parentOfStudentId: formData.role === 'parent' ? formData.parentOfStudentId : undefined,
      });
    } else {
      onAddUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        phone: formData.phone || '0901 000 999',
        classId: formData.role === 'teacher' ? formData.classId : undefined,
        assignedClassIds: formData.role === 'teacher' ? formData.assignedClassIds : undefined,
        parentOfStudentId: formData.role === 'parent' ? formData.parentOfStudentId : undefined,
        accountStatus: 'active',
        avatar:
          formData.role === 'teacher'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
            : formData.role === 'parent'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      });
    }

    setShowModal(false);
  };

  const handleToggleAssignedClass = (cId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedClassIds.includes(cId);
      const next = exists
        ? prev.assignedClassIds.filter((id) => id !== cId)
        : [...prev.assignedClassIds, cId];
      return {
        ...prev,
        assignedClassIds: next,
        classId: next[0] || '',
      };
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Phân Quyền & Quản Lý Tài Khoản (RBAC)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Trị Tài Khoản Giáo Viên & Phụ Huynh
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin có thể thêm mới, xóa và điều chỉnh tài khoản, cấp lại mật khẩu, phân quyền lớp phụ trách cho Giáo viên và liên kết Phụ huynh với con em.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo Tài Khoản Mới</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email tài khoản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tất cả vai trò ({users.length})</option>
              <option value="teacher">Giáo viên (Teacher)</option>
              <option value="parent">Phụ huynh (Parent)</option>
              <option value="student">Học viên (Student)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">HỌ VÀ TÊN / EMAIL</th>
                <th className="py-4 px-4">VAI TRÒ</th>
                <th className="py-4 px-4">LỚP PHỤ TRÁCH / CON EM LIÊN KẾT</th>
                <th className="py-4 px-4">TRẠNG THÁI</th>
                <th className="py-4 px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((user) => {
                const assignedClasses = classes.filter((c) =>
                  user.assignedClassIds?.includes(c.id) || c.id === user.classId
                );
                const childStudent = users.find((u) => u.id === user.parentOfStudentId);
                const isLocked = user.accountStatus === 'locked';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-rose-100 text-rose-800'
                            : user.role === 'teacher'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.role === 'parent'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600">
                      {user.role === 'teacher' && (
                        <div>
                          {assignedClasses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assignedClasses.map((ac) => (
                                <span
                                  key={ac.id}
                                  className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200"
                                >
                                  {ac.className}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Chưa phân công lớp</span>
                          )}
                        </div>
                      )}

                      {user.role === 'parent' && (
                        <span>
                          {childStudent ? (
                            <span className="text-purple-900">
                              Phụ huynh em: <strong className="font-bold">{childStudent.name}</strong> ({childStudent.studentCode || 'LK'})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa liên kết học viên</span>
                          )}
                        </span>
                      )}

                      {user.role === 'student' && (
                        <span>{classes.find(c => c.id === user.classId)?.className || 'Chưa xếp lớp'}</span>
                      )}

                      {user.role === 'admin' && (
                        <span className="text-rose-600 font-bold">Toàn quyền hệ thống</span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                          isLocked
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Đã khóa</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Hoạt động</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Điều chỉnh tài khoản"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Lock / Unlock Toggle */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() =>
                              onUpdateUser(user.id, {
                                accountStatus: isLocked ? 'active' : 'locked',
                              })
                            }
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                              isLocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                        )}

                        {/* Delete Button */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa tài khoản của ${user.name}?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT USER ACCOUNT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingUser ? 'Điều Chỉnh Tài Khoản' : 'Tạo Tài Khoản Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vai Trò Người Dùng *</label>
                <select
                  disabled={editingUser?.role === 'admin'}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="teacher">Giáo viên (Teacher)</option>
                  <option value="parent">Phụ huynh (Parent)</option>
                  <option value="student">Học viên (Student)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ Và Tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cô Nguyễn Mai Phương"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Đăng Nhập (ID) *</label>
                <input
                  type="email"
                  required
                  placeholder="email@lookenglish.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mật Khẩu *</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  placeholder="09xx xxx xxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Conditional: Teacher class assignment (Supports multiple classes) */}
              {formData.role === 'teacher' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-xs">
                    Phân Quyền Các Lớp Giáo Viên Phụ Trách ({formData.assignedClassIds.length} lớp):
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                    {classes.map((c) => {
                      const isAssigned = formData.assignedClassIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleToggleAssignedClass(c.id)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-bold text-slate-800">{c.className}</span>
                          <span className="text-[10px] text-slate-400">({c.level})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditional: Parent link with child */}
              {formData.role === 'parent' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Liên Kết Với Con Em (Học Viên) *
                  </label>
                  <select
                    required
                    value={formData.parentOfStudentId}
                    onChange={(e) => setFormData({ ...formData, parentOfStudentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Chọn học viên trong hệ thống --</option>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentCode || 'Mã HK'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900"
                >
                  {editingUser ? 'Lưu Điều Chỉnh' : 'Tạo & Cấp Quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
