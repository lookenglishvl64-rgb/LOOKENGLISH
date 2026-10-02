import React, { useState } from 'react';
import { ClassModel, UserModel, UserRole } from '../types';
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  Edit2,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Settings,
} from 'lucide-react';

interface ClassesManagerProps {
  classes: ClassModel[];
  users: UserModel[];
  currentRole: UserRole;
  onAddClass: (newClass: Omit<ClassModel, 'id'>) => void;
  onUpdateClass: (classId: string, data: Partial<ClassModel>) => void;
  onDeleteClass: (classId: string) => void;
  onAddStudentToClass: (classId: string, studentId: string) => void;
  onRemoveStudentFromClass: (classId: string, studentId: string) => void;
}

export const ClassesManager: React.FC<ClassesManagerProps> = ({
  classes,
  users,
  currentRole,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddStudentToClass,
  onRemoveStudentFromClass,
}) => {
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassModel | null>(null);
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<ClassModel | null>(null);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');

  // Form states for add / edit class
  const [formData, setFormData] = useState({
    className: '',
    level: 'Kids',
    teacherId: '',
    schedule: 'Thứ 2 - 4 - 6 (18:00 - 19:30)',
    room: 'Phòng Lab A201',
    maxCapacity: 16,
  });

  const teachers = users.filter((u) => u.role === 'teacher');
  const allStudents = users.filter((u) => u.role === 'student');

  // Filtered classes
  const filteredClasses = classes.filter((c) => {
    if (levelFilter !== 'all' && c.level !== levelFilter) return false;
    if (
      searchQuery &&
      !c.className.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setFormData({
      className: '',
      level: 'Kids',
      teacherId: teachers[0]?.id || 'usr_teacher_1',
      schedule: 'Thứ 2 - 4 - 6 (18:00 - 19:30)',
      room: 'Phòng Lab A201',
      maxCapacity: 16,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (cls: ClassModel) => {
    setEditingClass(cls);
    setFormData({
      className: cls.className,
      level: cls.level || 'Kids',
      teacherId: cls.teacherId,
      schedule: cls.schedule || 'Thứ 2 - 4 - 6 (18:00 - 19:30)',
      room: cls.room || 'Phòng Lab A201',
      maxCapacity: cls.maxCapacity || 16,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className.trim()) return;

    if (editingClass) {
      onUpdateClass(editingClass.id, {
        className: formData.className,
        level: formData.level,
        teacherId: formData.teacherId,
        schedule: formData.schedule,
        room: formData.room,
        maxCapacity: formData.maxCapacity,
      });
    } else {
      onAddClass({
        className: formData.className,
        teacherId: formData.teacherId || teachers[0]?.id || 'usr_teacher_1',
        studentList: [],
        level: formData.level,
        schedule: formData.schedule,
        room: formData.room,
        maxCapacity: formData.maxCapacity,
      });
    }

    setShowModal(false);
  };

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForRoster || !selectedStudentToAdd) return;
    onAddStudentToClass(selectedClassForRoster.id, selectedStudentToAdd);
    setSelectedStudentToAdd('');
  };

  const enrolledStudents = selectedClassForRoster
    ? users.filter((u) => selectedClassForRoster.studentList.includes(u.id))
    : [];

  const availableStudents = selectedClassForRoster
    ? allStudents.filter((s) => !selectedClassForRoster.studentList.includes(s.id))
    : [];

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
        {/* Filter Dropdown across all levels: Pre-kids, Kids, Teens, A1, A2, B1, B2, C1, Ielts */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold py-2 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">Tất cả cấp độ ({classes.length} lớp)</option>
              <option value="Pre-kids">Pre-kids (3 - 5 tuổi)</option>
              <option value="Kids">Kids (6 - 10 tuổi)</option>
              <option value="Teens">Teens (11 - 15 tuổi)</option>
              <option value="A1">Trình độ A1</option>
              <option value="A2">Trình độ A2 (Flyers/KET)</option>
              <option value="B1">Trình độ B1 (PET)</option>
              <option value="B2">Trình độ B2 (FCE)</option>
              <option value="C1">Trình độ C1 (CAE)</option>
              <option value="Ielts">Luyện thi IELTS</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
              ⌵
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Right action button */}
        <div className="flex items-center gap-2">
          {currentRole === 'admin' && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs bg-[#1E40AF] hover:bg-blue-900 text-white active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Lớp Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">MÃ LỚP</th>
                <th className="py-4 px-4 sm:px-6">TÊN LỚP HỌC</th>
                <th className="py-4 px-4">CẤP ĐỘ</th>
                <th className="py-4 px-4">GIÁO VIÊN PHỤ TRÁCH</th>
                <th className="py-4 px-4">LỊCH HỌC</th>
                <th className="py-4 px-4">PHÒNG HỌC</th>
                <th className="py-4 px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClasses.map((cls, idx) => {
                const teacher = users.find((u) => u.id === cls.teacherId);
                const classCode = `LK-${cls.level?.toUpperCase().substring(0, 4) || 'ENG'}-0${idx + 1}`;

                return (
                  <tr
                    key={cls.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedClassForRoster(cls)}
                  >
                    {/* MÃ LỚP */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-black text-blue-700 whitespace-nowrap">
                      {classCode}
                    </td>

                    {/* TÊN LỚP */}
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{cls.className}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({cls.studentList.length} học viên)
                        </span>
                      </div>
                    </td>

                    {/* CẤP ĐỘ */}
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200">
                        {cls.level || 'Kids'}
                      </span>
                    </td>

                    {/* GIÁO VIÊN PHỤ TRÁCH */}
                    <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {teacher ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={teacher.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                            alt={teacher.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span>{teacher.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa phân công</span>
                      )}
                    </td>

                    {/* LỊCH HỌC */}
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {cls.schedule || 'Thứ 2 - 4 - 6 (18:00 - 19:30)'}
                    </td>

                    {/* PHÒNG HỌC */}
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {cls.room || 'Phòng Lab A201'}
                    </td>

                    {/* THAO TÁC */}
                    <td
                      className="py-4 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit class button for Admin */}
                        {currentRole === 'admin' && (
                          <button
                            onClick={() => handleOpenEditModal(cls)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Điều chỉnh thông tin lớp & Phân công giáo viên"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}

                        {/* View roster button */}
                        <button
                          onClick={() => setSelectedClassForRoster(cls)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Danh sách học viên lớp"
                        >
                          <Users className="w-4 h-4" />
                        </button>

                        {/* Delete class button for Admin */}
                        {currentRole === 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa lớp ${cls.className}?`)) {
                                onDeleteClass(cls.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa lớp học"
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

      {/* MODAL: ADD / EDIT CLASS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingClass ? 'Điều Chỉnh Thông Tin Lớp Học' : 'Thêm Lớp Học Tiếng Anh Mới'}
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
                <label className="font-bold text-slate-700 block mb-1">Tên Lớp Học *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: IELTS Intensive 6.5+ Target 7.5"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cấp Độ / Chương Trình Đào Tạo *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold"
                >
                  <option value="Pre-kids">Pre-kids (3 - 5 tuổi)</option>
                  <option value="Kids">Kids (6 - 10 tuổi)</option>
                  <option value="Teens">Teens (11 - 15 tuổi)</option>
                  <option value="A1">Trình độ A1</option>
                  <option value="A2">Trình độ A2 (Flyers/KET)</option>
                  <option value="B1">Trình độ B1 (PET)</option>
                  <option value="B2">Trình độ B2 (FCE)</option>
                  <option value="C1">Trình độ C1 (CAE)</option>
                  <option value="Ielts">Luyện thi IELTS</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phân Quyền Giáo Viên Phụ Trách *</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lịch Học</label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng Học</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sĩ Số Tối Đa</label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

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
                  {editingClass ? 'Lưu Thay Đổi' : 'Tạo Lớp Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & MANAGE STUDENT ROSTER */}
      {selectedClassForRoster && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-700">
                  {selectedClassForRoster.level}
                </span>
                <h3 className="font-black text-slate-900 text-lg">
                  {selectedClassForRoster.className}
                </h3>
                <p className="text-xs text-slate-500">
                  Phòng {selectedClassForRoster.room} • {selectedClassForRoster.schedule}
                </p>
              </div>
              <button
                onClick={() => setSelectedClassForRoster(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick add student for Admin */}
            {currentRole === 'admin' && (
              <form onSubmit={handleEnrollStudent} className="flex gap-2">
                <select
                  value={selectedStudentToAdd}
                  onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="">-- Chọn học viên thêm vào lớp --</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || s.email})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!selectedStudentToAdd}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Xếp Vào Lớp</span>
                </button>
              </form>
            )}

            {/* Student list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Danh sách học viên ({enrolledStudents.length} / {selectedClassForRoster.maxCapacity || 16})
              </h4>
              {enrolledStudents.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Lớp này hiện chưa có học viên nào.
                </p>
              ) : (
                enrolledStudents.map((stu, i) => (
                  <div
                    key={stu.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-200">
                        {i + 1}
                      </span>
                      <img
                        src={stu.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                        alt={stu.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{stu.name}</span>
                        <span className="text-[11px] font-mono text-blue-700">{stu.studentCode || stu.email}</span>
                      </div>
                    </div>

                    {currentRole === 'admin' && (
                      <button
                        onClick={() => onRemoveStudentFromClass(selectedClassForRoster.id, stu.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        title="Rút khỏi lớp"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
