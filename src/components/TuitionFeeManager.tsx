import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MediaDropzone } from './MediaDropzone';
import {
  TuitionFeeModel,
  TuitionPeriodType,
  TuitionStatus,
  UserModel,
  ClassModel,
  UserRole,
} from '../types';
import {
  CreditCard,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  Eye,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Download,
  Search,
} from 'lucide-react';

interface TuitionFeeManagerProps {
  tuitionFees: TuitionFeeModel[];
  users: UserModel[];
  classes: ClassModel[];
  currentRole: UserRole;
  currentUserId?: string;
  childStudentId?: string;
  onAddTuitionFee: (data: Omit<TuitionFeeModel, 'id'>) => void;
  onUpdateTuitionFee: (id: string, data: Partial<TuitionFeeModel>) => void;
  onDeleteTuitionFee: (id: string) => void;
}

export const TuitionFeeManager: React.FC<TuitionFeeManagerProps> = ({
  tuitionFees,
  users,
  classes,
  currentRole,
  currentUserId,
  childStudentId,
  onAddTuitionFee,
  onUpdateTuitionFee,
  onDeleteTuitionFee,
}) => {
  const isParent = currentRole === 'parent';
  const child = isParent
    ? users.find((u) => u.id === (childStudentId || 'usr_student_2'))
    : null;

  const allStudents = users.filter((u) => u.role === 'student');

  // Filter states
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TuitionStatus>('all');
  const [filterPeriodType, setFilterPeriodType] = useState<'all' | TuitionPeriodType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TuitionFeeModel | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [showUploadReceiptModal, setShowUploadReceiptModal] = useState<TuitionFeeModel | null>(null);
  const [parentReceiptInputUrl, setParentReceiptInputUrl] = useState('');

  // Form states
  const [studentId, setStudentId] = useState(allStudents[0]?.id || '');
  const [title, setTitle] = useState('');
  const [periodType, setPeriodType] = useState<TuitionPeriodType>('month');
  const [periodLabel, setPeriodLabel] = useState('Tháng 10/2026');
  const [amount, setAmount] = useState<number>(2400000);
  const [status, setStatus] = useState<TuitionStatus>('debt');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [paidAt, setPaidAt] = useState('');
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [note, setNote] = useState('');

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setStudentId(allStudents[0]?.id || '');
    setTitle('Học phí Tháng 10/2026');
    setPeriodType('month');
    setPeriodLabel('Tháng 10/2026');
    setAmount(2400000);
    setStatus('debt');
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));
    setPaidAt('');
    setReceiptImageUrl('');
    setNote('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: TuitionFeeModel) => {
    setEditingItem(item);
    setStudentId(item.studentId);
    setTitle(item.title);
    setPeriodType(item.periodType);
    setPeriodLabel(item.periodLabel);
    setAmount(item.amount);
    setStatus(item.status);
    setDueDate(item.dueDate);
    setPaidAt(item.paidAt || '');
    setReceiptImageUrl(item.receiptImageUrl || '');
    setNote(item.note || '');
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const student = users.find((u) => u.id === studentId);

    if (editingItem) {
      onUpdateTuitionFee(editingItem.id, {
        studentId,
        classId: student?.classId,
        title,
        periodType,
        periodLabel,
        amount,
        status,
        dueDate,
        paidAt: status === 'paid' ? (paidAt || new Date().toISOString().substring(0, 16).replace('T', ' ')) : undefined,
        receiptImageUrl,
        note,
      });
    } else {
      onAddTuitionFee({
        studentId,
        classId: student?.classId,
        title,
        periodType,
        periodLabel,
        amount,
        status,
        dueDate,
        paidAt: status === 'paid' ? (paidAt || new Date().toISOString().substring(0, 16).replace('T', ' ')) : undefined,
        receiptImageUrl,
        note,
        createdAt: new Date().toISOString(),
      });
    }

    if (status === 'paid') {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });
    }

    setShowAddModal(false);
  };

  const handleQuickTogglePaid = (item: TuitionFeeModel) => {
    const isNowPaid = item.status !== 'paid';
    onUpdateTuitionFee(item.id, {
      status: isNowPaid ? 'paid' : 'debt',
      paidAt: isNowPaid ? new Date().toISOString().substring(0, 16).replace('T', ' ') : undefined,
    });
    if (isNowPaid) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleParentUploadReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUploadReceiptModal || !parentReceiptInputUrl.trim()) return;

    onUpdateTuitionFee(showUploadReceiptModal.id, {
      receiptImageUrl: parentReceiptInputUrl.trim(),
      note: (showUploadReceiptModal.note ? showUploadReceiptModal.note + ' • ' : '') + 'Phụ huynh đã gửi ảnh xác nhận chuyển khoản',
    });

    setShowUploadReceiptModal(null);
    setParentReceiptInputUrl('');
    alert('Đã gửi hình ảnh biên lai thành công! Trung tâm sẽ kiểm tra và xác nhận sớm nhất.');
  };

  // Filter list
  const filteredFees = tuitionFees.filter((item) => {
    if (isParent && child) {
      if (item.studentId !== child.id) return false;
    }

    if (filterClassId !== 'all') {
      const stu = users.find((u) => u.id === item.studentId);
      if (stu?.classId !== filterClassId && item.classId !== filterClassId) return false;
    }

    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPeriodType !== 'all' && item.periodType !== filterPeriodType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const stu = users.find((u) => u.id === item.studentId);
      const studentMatch = stu?.name.toLowerCase().includes(q) || stu?.studentCode?.toLowerCase().includes(q);
      const titleMatch = item.title.toLowerCase().includes(q) || item.periodLabel.toLowerCase().includes(q);
      if (!studentMatch && !titleMatch) return false;
    }

    return true;
  });

  // Calculate statistics
  const currentTargetFees = isParent && child
    ? tuitionFees.filter((f) => f.studentId === child.id)
    : tuitionFees;

  const totalAmount = currentTargetFees.reduce((acc, f) => acc + (f.amount || 0), 0);
  const paidAmount = currentTargetFees
    .filter((f) => f.status === 'paid')
    .reduce((acc, f) => acc + (f.amount || 0), 0);
  const debtAmount = totalAmount - paidAmount;
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 100;

  // ========================================================
  // VIEW FOR PARENTS (THEO DÕI RIÊNG CHO TỪNG CON EM MÌNH)
  // ========================================================
  if (isParent && child) {
    const childHasDebt = currentTargetFees.some((f) => f.status === 'debt');

    return (
      <div className="space-y-6">
        {/* Child Tuition Header Card */}
        <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all ${
          childHasDebt
            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900'
            : 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900'
        }`}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-white/15 backdrop-blur-md border border-white/20 mb-3 uppercase tracking-wider text-amber-300">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Sổ Theo Dõi Học Phí & Biên Lai Của Con</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black drop-shadow-xs">
                Học Phí Bé {child.name}
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 mt-2 leading-relaxed">
                Mã học viên: <strong className="text-amber-300 font-mono">{child.studentCode || 'LK-IELTS-204'}</strong> • Quý phụ huynh có thể theo dõi chi tiết từng kỳ học phí (theo tuần hoặc theo tháng) và xem trực tiếp biên lai đã thanh toán.
              </p>
            </div>

            {/* Financial Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
                <span className="text-[11px] font-bold text-blue-200 block uppercase">Tổng Học Phí</span>
                <span className="text-base sm:text-lg font-black text-white">{formatVND(totalAmount)}</span>
              </div>
              <div className="bg-emerald-500/20 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-400/30 text-center">
                <span className="text-[11px] font-bold text-emerald-300 block uppercase">Đã Thanh Toán</span>
                <span className="text-base sm:text-lg font-black text-emerald-300">{formatVND(paidAmount)}</span>
              </div>
              <div className={`p-3.5 rounded-2xl border text-center col-span-2 sm:col-span-1 backdrop-blur-md ${
                debtAmount > 0
                  ? 'bg-rose-500/25 border-rose-400/40'
                  : 'bg-white/10 border-white/15'
              }`}>
                <span className={`text-[11px] font-bold block uppercase ${debtAmount > 0 ? 'text-rose-300' : 'text-slate-300'}`}>
                  Còn Nợ
                </span>
                <span className={`text-base sm:text-lg font-black ${debtAmount > 0 ? 'text-rose-300' : 'text-white'}`}>
                  {formatVND(debtAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Transfer Guide Box for Parent */}
        {debtAmount > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏦</span>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Thông Tin Chuyển Khoản Đóng Học Phí (Trung Tâm LOOK ENGLISH)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-slate-500 text-[11px] block">Ngân hàng:</span>
                <strong className="text-slate-900 text-sm">Vietcombank (VCB)</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-slate-500 text-[11px] block">Số tài khoản:</span>
                <strong className="text-blue-900 text-sm font-mono tracking-wider">0121000678999</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-slate-500 text-[11px] block">Chủ tài khoản:</span>
                <strong className="text-slate-900 text-sm">TT NGOAI NGU LOOK ENGLISH</strong>
              </div>
            </div>
            <p className="text-xs text-amber-900">
              💡 Cú pháp chuyển khoản: <strong className="font-mono bg-amber-100 px-2 py-0.5 rounded text-amber-950 font-bold">HP {child.studentCode || 'LK-IELTS-204'} {child.name}</strong>. Sau khi chuyển khoản, phụ huynh có thể gửi ảnh biên lai bên dưới để nhân viên xác nhận ngay.
            </p>
          </div>
        )}

        {/* Tuition Fee List for Child */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span>Danh Sách Các Đợt Học Phí Của Bé {child.name}</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {filteredFees.length} khoản phí
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFees.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-semibold">
                Hiện tại bé chưa có thông báo học phí nào.
              </div>
            ) : (
              filteredFees.map((fee) => {
                const isPaid = fee.status === 'paid';

                return (
                  <div
                    key={fee.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {isPaid ? '✓ ĐÃ THANH TOÁN' : '⚠️ CÒN NỢ'}
                        </span>

                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {fee.periodType === 'week' ? '📅 Theo Tuần' : '🗓️ Theo Tháng'}: {fee.periodLabel}
                        </span>

                        <span className="text-xs text-slate-400">
                          Hạn đóng: <strong className="text-slate-700 font-mono">{fee.dueDate}</strong>
                        </span>
                      </div>

                      <h4 className="font-black text-slate-900 text-base">
                        {fee.title}
                      </h4>

                      <p className="text-lg font-black text-blue-900">
                        {formatVND(fee.amount)}
                      </p>

                      {fee.note && (
                        <p className="text-xs text-slate-500 italic">
                          Ghi chú: {fee.note}
                        </p>
                      )}

                      {isPaid && fee.paidAt && (
                        <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã thanh toán vào: {fee.paidAt}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions for Parent */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {/* Xem biên lai nếu có */}
                      {fee.receiptImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setViewingReceiptUrl(fee.receiptImageUrl!)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs shadow-2xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Biên Lai Thu Tiền</span>
                        </button>
                      ) : isPaid ? (
                        <span className="text-xs text-slate-400 italic">
                          Biên lai giấy đã giao tại trung tâm
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowUploadReceiptModal(fee)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Gửi Ảnh Biên Lai Chuyển Khoản</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal: View Receipt Image */}
        {viewingReceiptUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Biên Lai Thu Tiền Điện Tử (LOOK ENGLISH)</span>
                </h3>
                <button
                  onClick={() => setViewingReceiptUrl(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 p-2 flex items-center justify-center">
                <img
                  src={viewingReceiptUrl}
                  alt="Biên lai học phí"
                  className="max-h-[60vh] object-contain rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  ✓ Biên lai hợp lệ được trung tâm xác nhận
                </span>
                <button
                  onClick={() => setViewingReceiptUrl(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Parent Send Receipt URL */}
        {showUploadReceiptModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Gửi Ảnh Chụp Biên Lai / Ủy Nhiệm Chi
                </h3>
                <button
                  onClick={() => setShowUploadReceiptModal(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleParentUploadReceipt} className="space-y-4 text-xs sm:text-sm">
                <p className="text-xs text-slate-500">
                  Khoản phí: <strong>{showUploadReceiptModal.title}</strong> ({formatVND(showUploadReceiptModal.amount)})
                </p>

                <MediaDropzone
                  label="Tải Ảnh Biên Lai / Chuyển Khoản Trực Tiếp Từ Máy Tính"
                  sublabel="Chọn file ảnh chụp màn hình ủy nhiệm chi hoặc biên lai thu tiền từ máy tính của bạn"
                  accept="image"
                  valueUrl={parentReceiptInputUrl}
                  onChangeUrl={setParentReceiptInputUrl}
                  required
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadReceiptModal(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Gửi Biên Lai Cho Trung Tâm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // VIEW FOR ADMIN (QUẢN LÝ TOÀN BỘ HỌC PHÍ TRUNG TÂM)
  // ========================================================
  return (
    <div className="space-y-6">
      {/* Top Banner & Financial Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Quản Lý Học Phí Tuần / Tháng & Tình Trạng Nợ - Đã Thanh Toán</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sổ Quản Lý Học Phí & Biên Lai
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Thiết lập học phí linh hoạt theo tuần hoặc tháng, theo dõi công nợ từng học viên và đính kèm hình ảnh biên lai thu tiền.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Khoản Thu Học Phí Mới</span>
          </button>
        </div>

        {/* Live Financial Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Tổng Tiền Thu Đợt Này</span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 mt-1 block">
              {formatVND(totalAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {tuitionFees.length} khoản phí
            </span>
          </div>

          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-center">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">Đã Thanh Toán</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-800 mt-1 block">
              {formatVND(paidAmount)}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              {tuitionFees.filter((f) => f.status === 'paid').length} học viên đã hoàn thành
            </span>
          </div>

          <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 text-center">
            <span className="text-[11px] font-bold text-rose-700 uppercase block">Tổng Còn Nợ</span>
            <span className="text-lg sm:text-2xl font-black text-rose-800 mt-1 block">
              {formatVND(debtAmount)}
            </span>
            <span className="text-[10px] text-rose-600 block mt-0.5">
              {tuitionFees.filter((f) => f.status === 'debt').length} học viên cần thu
            </span>
          </div>

          <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-200 text-center">
            <span className="text-[11px] font-bold text-blue-700 uppercase block">Tỷ Lệ Thu Phí</span>
            <span className="text-lg sm:text-2xl font-black text-blue-800 mt-1 block">
              {collectionRate}%
            </span>
            <span className="text-[10px] text-blue-600 block mt-0.5">
              Mục tiêu hoàn tất 100%
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Lọc theo:</span>

            {/* Filter by class */}
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">Tất cả lớp ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </select>

            {/* Filter by status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="paid">✓ Đã thanh toán</option>
              <option value="debt">⚠️ Còn nợ</option>
            </select>

            {/* Filter by period type */}
            <select
              value={filterPeriodType}
              onChange={(e) => setFilterPeriodType(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">Tất cả kỳ (Tuần & Tháng)</option>
              <option value="month">🗓️ Học phí theo Tháng</option>
              <option value="week">📅 Học phí theo Tuần</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã học viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filteredFees.length} kết quả
            </span>
          </div>
        </div>
      </div>

      {/* Tuition Fees List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="p-4">Học Viên / Mã Số</th>
                <th className="p-4">Khoản Học Phí</th>
                <th className="p-4">Kỳ Thu</th>
                <th className="p-4">Số Tiền (VNĐ)</th>
                <th className="p-4">Tình Trạng</th>
                <th className="p-4">Hạn Đóng / Ngày Đóng</th>
                <th className="p-4">Biên Lai Thu Tiền</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    Không tìm thấy khoản học phí nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const student = users.find((u) => u.id === fee.studentId);
                  const isPaid = fee.status === 'paid';

                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Học viên */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'}
                            alt={student?.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-black text-slate-900 text-xs sm:text-sm">
                              {student?.name || 'Học viên'}
                            </div>
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                              {student?.studentCode || 'LK-STAR'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Khoản học phí */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {fee.title}
                        </div>
                        {fee.note && (
                          <span className="text-[10px] text-slate-400 block italic">
                            {fee.note}
                          </span>
                        )}
                      </td>

                      {/* Kỳ thu */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                          {fee.periodType === 'week' ? '📅 Tuần' : '🗓️ Tháng'}: {fee.periodLabel}
                        </span>
                      </td>

                      {/* Số tiền */}
                      <td className="p-4">
                        <span className="font-black text-slate-900 text-sm">
                          {formatVND(fee.amount)}
                        </span>
                      </td>

                      {/* Tình trạng */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePaid(fee)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black cursor-pointer border transition-all hover:scale-105 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                          title="Bấm để đổi trạng thái"
                        >
                          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          <span>{isPaid ? 'ĐÃ THANH TOÁN' : 'NỢ'}</span>
                        </button>
                      </td>

                      {/* Hạn đóng */}
                      <td className="p-4 text-[11px]">
                        <div>
                          Hạn: <strong className="font-mono text-slate-800">{fee.dueDate}</strong>
                        </div>
                        {isPaid && fee.paidAt && (
                          <div className="text-emerald-700 font-semibold mt-0.5">
                            Đóng: {fee.paidAt}
                          </div>
                        )}
                      </td>

                      {/* Biên lai */}
                      <td className="p-4">
                        {fee.receiptImageUrl ? (
                          <button
                            type="button"
                            onClick={() => setViewingReceiptUrl(fee.receiptImageUrl!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Xem Biên Lai</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Chưa có ảnh
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(fee)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa khoản phí"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa khoản học phí "${fee.title}"?`)) {
                                onDeleteTuitionFee(fee.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa khoản phí"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL: ADD / EDIT TUITION FEE (ADMIN)
         ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-700" />
                <h3 className="font-black text-slate-900 text-base">
                  {editingItem ? 'Chỉnh Sửa Khoản Học Phí' : 'Tạo Khoản Thu Học Phí Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs sm:text-sm">
              {/* 1. Chọn học viên */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn Học Viên *
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-blue-600"
                >
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || 'Chưa có mã'}) • Lớp {classes.find(c => c.id === s.classId)?.className || 'Lớp học'}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Tùy chọn học phí theo Tuần hoặc Tháng */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tùy Chọn Kỳ Thu Học Phí (Tuần Hoặc Tháng) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPeriodType('month');
                      if (!editingItem) {
                        setTitle('Học phí Tháng 10/2026');
                        setPeriodLabel('Tháng 10/2026');
                        setAmount(2400000);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      periodType === 'month'
                        ? 'bg-blue-600 text-white shadow-xs border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>🗓️ Theo Tháng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPeriodType('week');
                      if (!editingItem) {
                        setTitle('Học phí Tuần 40 (01/10 - 07/10)');
                        setPeriodLabel('Tuần 40 (01/10 - 07/10)');
                        setAmount(600000);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      periodType === 'week'
                        ? 'bg-blue-600 text-white shadow-xs border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>📅 Theo Tuần</span>
                  </button>
                </div>
              </div>

              {/* 3. Tên khoản phí & Tên kỳ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên Khoản Phí *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Học phí Tháng 10/2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Giai Đoạn / Nhãn Kỳ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tháng 10/2026 hoặc Tuần 40"
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* 4. Số tiền học phí & Tình trạng đóng */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số Tiền Học Phí (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    step="50000"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-black text-blue-900 bg-white focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Bằng chữ: {formatVND(amount)}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tình Trạng Đóng Học Phí *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TuitionStatus)}
                    className={`w-full px-3 py-2 border rounded-xl font-bold focus:ring-2 focus:ring-blue-600 ${
                      status === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="debt">🔴 Nợ (Chưa thanh toán)</option>
                    <option value="paid">🟢 Đã thanh toán</option>
                  </select>
                </div>
              </div>

              {/* 5. Thời gian hạn nộp & Thời gian đóng học phí */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Hạn Chót Nộp Học Phí *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs font-bold bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Thời Gian Đã Đóng (Nếu đã trả):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 2026-10-05 14:30"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* 6. Hình ảnh biên lai */}
              <div className="space-y-1.5">
                <MediaDropzone
                  label="Hình Ảnh Biên Lai / Hóa Đơn Thu Tiền (Tải từ máy tính)"
                  sublabel="Bấm hoặc kéo thả trực tiếp file ảnh biên lai từ máy tính"
                  accept="image"
                  valueUrl={receiptImageUrl}
                  onChangeUrl={setReceiptImageUrl}
                />
                {!receiptImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptImageUrl('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80');
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold underline inline-block"
                  >
                    + Sử dụng ảnh hóa đơn mẫu có mộc LOOK ENGLISH
                  </button>
                )}
              </div>

              {/* 7. Ghi chú thêm */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ghi Chú Của Quản Lý (Giảm giá, chiết khấu, hình thức CK):
                </label>
                <input
                  type="text"
                  placeholder="VD: Đã chiết khấu 10% học sinh xuất sắc, chuyển khoản VCB"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Tạo Khoản Thu Học Phí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Receipt Image (Admin) */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Chi Tiết Hình Ảnh Biên Lai Học Phí</span>
              </h3>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 p-2 flex items-center justify-center">
              <img
                src={viewingReceiptUrl}
                alt="Biên lai học phí"
                className="max-h-[60vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs"
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
