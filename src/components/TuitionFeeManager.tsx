import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { MediaDropzone } from './MediaDropzone';
import {
  TuitionFeeModel,
  TuitionPeriodType,
  TuitionStatus,
  UserModel,
  ClassModel,
  UserRole,
  CenterBankConfig,
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
  Settings,
  Building2,
  Copy,
  Check,
  QrCode,
  PieChart as PieChartIcon,
  BarChart3,
  Users,
  Wallet,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  List,
  ChevronRight,
} from 'lucide-react';

const DEFAULT_BANK_CONFIG: CenterBankConfig = {
  bankName: 'Vietcombank (VCB)',
  accountNumber: '0121000678999',
  accountHolder: 'TT NGOAI NGU LOOK ENGLISH',
  branch: 'Chi nhánh Vĩnh Long',
  note: 'Vui lòng ghi đúng cú pháp chuyển khoản để hệ thống tự động nhận diện và cập nhật học phí nhanh nhất.',
};

interface TuitionFeeManagerProps {
  tuitionFees: TuitionFeeModel[];
  users: UserModel[];
  classes: ClassModel[];
  currentRole: UserRole;
  currentUserId?: string;
  childStudentId?: string;
  bankConfig?: CenterBankConfig;
  onUpdateBankConfig?: (config: CenterBankConfig) => void;
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
  bankConfig,
  onUpdateBankConfig,
  onAddTuitionFee,
  onUpdateTuitionFee,
  onDeleteTuitionFee,
}) => {
  const isParent = currentRole === 'parent';
  const child = isParent
    ? users.find((u) => u.id === (childStudentId || 'usr_student_2'))
    : null;

  const allStudents = users.filter((u) => u.role === 'student');

  const effectiveBank = bankConfig || DEFAULT_BANK_CONFIG;
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState<CenterBankConfig>(effectiveBank);
  const [copiedStk, setCopiedStk] = useState(false);

  const handleCopyStk = () => {
    navigator.clipboard.writeText(effectiveBank.accountNumber);
    setCopiedStk(true);
    setTimeout(() => setCopiedStk(false), 2000);
  };

  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateBankConfig) {
      onUpdateBankConfig(bankFormData);
    }
    setShowBankModal(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    alert('Đã cập nhật thông tin tài khoản ngân hàng của trung tâm thành công!');
  };

  // Admin Tab: 'dashboard' vs 'list'
  const [adminTab, setAdminTab] = useState<'dashboard' | 'list'>('dashboard');
  const [chartMetric, setChartMetric] = useState<'amount' | 'count'>('amount');
  const [chartPeriodFilter, setChartPeriodFilter] = useState<'all' | 'month' | 'week'>('all');

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

  // Chart source data filtered by chartPeriodFilter for Recharts Dashboard
  const chartSourceFees = tuitionFees.filter((f) => {
    if (chartPeriodFilter === 'all') return true;
    return f.periodType === chartPeriodFilter;
  });

  const chartTotalAmount = chartSourceFees.reduce((acc, f) => acc + (f.amount || 0), 0);
  const chartPaidAmount = chartSourceFees
    .filter((f) => f.status === 'paid')
    .reduce((acc, f) => acc + (f.amount || 0), 0);
  const chartDebtAmount = chartTotalAmount - chartPaidAmount;
  const chartCollectionRate = chartTotalAmount > 0 ? Math.round((chartPaidAmount / chartTotalAmount) * 100) : 100;

  const chartPaidCount = chartSourceFees.filter((f) => f.status === 'paid').length;
  const chartDebtCount = chartSourceFees.filter((f) => f.status === 'debt').length;
  const chartTotalCount = chartPaidCount + chartDebtCount;

  // Pie chart data for Recharts (Đã thanh toán vs Nợ)
  const pieData = [
    {
      name: 'Đã thanh toán',
      value: chartMetric === 'amount' ? chartPaidAmount : chartPaidCount,
      amount: chartPaidAmount,
      count: chartPaidCount,
      percentStr: chartMetric === 'amount'
        ? (chartTotalAmount > 0 ? ((chartPaidAmount / chartTotalAmount) * 100).toFixed(1) : '100')
        : (chartTotalCount > 0 ? ((chartPaidCount / chartTotalCount) * 100).toFixed(1) : '100'),
      color: '#10B981', // Emerald 500
    },
    {
      name: 'Còn nợ (Chưa thu)',
      value: chartMetric === 'amount' ? chartDebtAmount : chartDebtCount,
      amount: chartDebtAmount,
      count: chartDebtCount,
      percentStr: chartMetric === 'amount'
        ? (chartTotalAmount > 0 ? ((chartDebtAmount / chartTotalAmount) * 100).toFixed(1) : '0')
        : (chartTotalCount > 0 ? ((chartDebtCount / chartTotalCount) * 100).toFixed(1) : '0'),
      color: '#EF4444', // Rose 500
    },
  ];

  // Bar chart data for classes
  const classBreakdown = classes.map((c) => {
    const classFees = chartSourceFees.filter((f) => f.classId === c.id);
    const paid = classFees.filter((f) => f.status === 'paid').reduce((a, b) => a + (b.amount || 0), 0);
    const debt = classFees.filter((f) => f.status === 'debt').reduce((a, b) => a + (b.amount || 0), 0);
    return {
      className: c.className.length > 12 ? c.className.substring(0, 12) + '...' : c.className,
      fullName: c.className,
      'Đã thanh toán': paid,
      'Còn nợ': debt,
      total: paid + debt,
    };
  }).filter((c) => c.total > 0);

  // Urgent debtors
  const urgentDebtors = tuitionFees.filter((f) => f.status === 'debt');

  // Custom Tooltips for Recharts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-black text-sm">{data.name}</span>
          </div>
          <p className="text-slate-300">
            Số tiền: <strong className="text-white font-mono">{formatVND(data.amount)}</strong>
          </p>
          <p className="text-slate-300">
            Số lượng: <strong className="text-white">{data.count} học viên ({data.percentStr}%)</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs space-y-1">
          <span className="font-bold text-slate-300 block">{label}</span>
          {payload.map((entry: any, index: number) => (
            <p key={`bar-${index}`} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}:</span>
              <strong className="font-mono text-white">{formatVND(entry.value)}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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

        {/* Bank Transfer Guide Box for Parent (Configured dynamically by Admin) */}
        {debtAmount > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏦</span>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Thông Tin Chuyển Khoản Đóng Học Phí ({effectiveBank.accountHolder || 'Trung Tâm LOOK ENGLISH'})
                </h4>
              </div>
              {effectiveBank.branch && (
                <span className="text-xs text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                  Chi nhánh: {effectiveBank.branch}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] block">Ngân hàng:</span>
                <strong className="text-slate-900 text-sm block truncate">{effectiveBank.bankName}</strong>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs relative">
                <span className="text-slate-500 text-[11px] block">Số tài khoản:</span>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <strong className="text-blue-900 text-base font-mono tracking-wider font-black select-all">
                    {effectiveBank.accountNumber}
                  </strong>
                  <button
                    type="button"
                    onClick={handleCopyStk}
                    className="p-1 text-slate-500 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                    title="Sao chép số tài khoản"
                  >
                    {copiedStk ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {copiedStk && (
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5 animate-pulse">
                    ✓ Đã sao chép số tài khoản!
                  </span>
                )}
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] block">Chủ tài khoản:</span>
                <strong className="text-slate-900 text-sm uppercase block truncate font-black">
                  {effectiveBank.accountHolder}
                </strong>
              </div>
            </div>

            {effectiveBank.qrImageUrl && (
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex items-center gap-3">
                <img
                  src={effectiveBank.qrImageUrl}
                  alt="QR Ngân Hàng"
                  className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white shrink-0"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Mã QR Chuyển Khoản Ngân Hàng</span>
                  <span className="text-[11px] text-slate-500 block">
                    Quý phụ huynh có thể quét mã QR trên qua app ngân hàng để chuyển khoản nhanh mà không cần nhập số tài khoản.
                  </span>
                </div>
              </div>
            )}

            <div className="p-2.5 bg-amber-100/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <span className="text-base leading-none">💡</span>
              <div>
                <p>
                  Cú pháp chuyển khoản: <strong className="font-mono bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 font-bold select-all">HP {child.studentCode || 'LK-IELTS-204'} {child.name}</strong>. Sau khi chuyển khoản, phụ huynh có thể gửi ảnh biên lai bên dưới để nhân viên xác nhận ngay.
                </p>
                {effectiveBank.note && (
                  <p className="text-[11px] text-amber-800 mt-1 italic">
                    Lưu ý: {effectiveBank.note}
                  </p>
                )}
              </div>
            </div>
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setBankFormData(effectiveBank);
                setShowBankModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs sm:text-sm shadow-2xs transition-all active:scale-95 shrink-0"
              title="Thay đổi số tài khoản ngân hàng và thông tin trung tâm"
            >
              <Settings className="w-4 h-4 text-blue-700" />
              <span>⚙️ Cài Đặt STK Ngân Hàng</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo Khoản Thu Học Phí Mới</span>
            </button>
          </div>
        </div>

        {/* Active Bank Account Display Card for Admin */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 rounded-2xl p-4 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-blue-800 uppercase block tracking-wider">
                Tài Khoản Nhận Chuyển Khoản Học Phí Của Trung Tâm (Hiển thị cho phụ huynh)
              </span>
              <div className="text-sm font-black text-slate-900 flex items-center gap-2 flex-wrap mt-0.5">
                <span className="text-blue-950">{effectiveBank.bankName}</span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{effectiveBank.accountNumber}</span>
                <span className="text-slate-400">•</span>
                <span className="uppercase text-slate-800 font-bold">{effectiveBank.accountHolder}</span>
              </div>
              {effectiveBank.branch && (
                <span className="text-[11px] text-slate-500 mt-0.5 block">Chi nhánh: {effectiveBank.branch}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBankFormData(effectiveBank);
              setShowBankModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-xs shrink-0 self-start md:self-auto transition-all active:scale-95"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Chỉnh Sửa STK / Tên Ngân Hàng</span>
          </button>
        </div>

        {/* Navigation Tabs between Dashboard and List */}
        <div className="flex items-center gap-2 border-b border-slate-200 pt-2 pb-2">
          <button
            type="button"
            onClick={() => setAdminTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              adminTab === 'dashboard'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span>Dashboard Tổng Quan (Recharts)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              adminTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {chartCollectionRate}% đã thu
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              adminTab === 'list'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Sổ Danh Sách Chi Tiết ({tuitionFees.length})</span>
            {chartDebtCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                adminTab === 'list' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {chartDebtCount} nợ
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: DASHBOARD TỔNG QUAN HỌC PHÍ VỚI RECHARTS
         ======================================================== */}
      {adminTab === 'dashboard' && (
          <div className="space-y-6 pt-1">
            {/* Filter and Metric Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">Xem dữ liệu theo kỳ:</span>
                <div className="inline-flex rounded-xl bg-white p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChartPeriodFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      chartPeriodFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả ({tuitionFees.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartPeriodFilter('month')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      chartPeriodFilter === 'month'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🗓️ Theo Tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartPeriodFilter('week')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      chartPeriodFilter === 'week'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📅 Theo Tuần
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-600">Hiển thị biểu đồ tròn theo:</span>
                <div className="inline-flex rounded-xl bg-white p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChartMetric('amount')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      chartMetric === 'amount'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💰 Số Tiền (VNĐ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('count')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      chartMetric === 'count'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👥 Số Khoản Phí
                  </button>
                </div>
              </div>
            </div>

            {/* Live Financial Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-1.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Tổng Doanh Thu</span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 mt-1 block">
                  {formatVND(chartTotalAmount)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {chartTotalCount} khoản phí
                </span>
              </div>

              <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-center shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase block">Đã Thanh Toán</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-800 mt-1 block">
                  {formatVND(chartPaidAmount)}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-semibold">
                  {chartPaidCount} học viên đã hoàn thành
                </span>
              </div>

              <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 text-center shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-1.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-rose-700 uppercase block">Tổng Còn Nợ</span>
                <span className="text-lg sm:text-2xl font-black text-rose-800 mt-1 block">
                  {formatVND(chartDebtAmount)}
                </span>
                <span className="text-[10px] text-rose-600 block mt-0.5 font-semibold">
                  {chartDebtCount} học viên cần thu
                </span>
              </div>

              <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-200 text-center shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-1.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-blue-700 uppercase block">Tỷ Lệ Thu Phí</span>
                <span className="text-lg sm:text-2xl font-black text-blue-800 mt-1 block">
                  {chartCollectionRate}%
                </span>
                <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">
                  Mục tiêu hoàn tất 100%
                </span>
              </div>
            </div>

            {/* RECHARTS SECTION: PIE CHART & BAR CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* 1. Biểu đồ tròn Recharts (Pie Chart) */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <PieChartIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">
                          Biểu Đồ Tròn Tình Trạng Thanh Toán
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {chartMetric === 'amount' ? 'Đã thanh toán vs Nợ (Số tiền VNĐ)' : 'Đã thanh toán vs Nợ (Số lượng khoản)'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      Recharts
                    </span>
                  </div>

                  {/* Donut Chart with Centered Rate */}
                  <div className="relative h-64 w-full flex items-center justify-center my-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={96}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomPieTooltip />} />
                        <RechartsLegend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Donut Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {chartCollectionRate}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Đã thu
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Pie Chart Breakdown Badges */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Đã thanh toán</span>
                    </div>
                    <div className="font-black text-slate-900 text-sm mt-1">
                      {formatVND(chartPaidAmount)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      {chartPaidCount} khoản ({pieData[0].percentStr}%)
                    </div>
                  </div>

                  <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Còn nợ học phí</span>
                    </div>
                    <div className="font-black text-slate-900 text-sm mt-1">
                      {formatVND(chartDebtAmount)}
                    </div>
                    <div className="text-[10px] text-rose-700 font-semibold">
                      {chartDebtCount} khoản ({pieData[1].percentStr}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Biểu đồ cột Recharts (Bar Chart phân bổ theo Lớp) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">
                          Phân Bổ Thu & Nợ Theo Lớp Học
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Doanh thu thực thu và số tiền công nợ theo từng lớp học
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAdminTab('list')}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      <span>Xem sổ chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-64 w-full my-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classBreakdown} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey="className"
                          tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748B' }}
                          tickFormatter={(val) => {
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}tr`;
                            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                            return val;
                          }}
                        />
                        <RechartsTooltip content={<CustomBarTooltip />} />
                        <RechartsLegend verticalAlign="bottom" height={30} />
                        <Bar dataKey="Đã thanh toán" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Còn nợ" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>💡 Tự động cập nhật dữ liệu khi Admin thêm hoặc sửa học phí.</span>
                  <span className="font-bold text-slate-700">{classBreakdown.length} lớp học</span>
                </div>
              </div>
            </div>

            {/* Quick Action: Urgent Debtors Alert Table */}
            {urgentDebtors.length > 0 && (
              <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                    <h4 className="font-black text-rose-950 text-sm">
                      Danh Sách Học Viên Còn Nợ Học Phí Cần Thu Hồi ({urgentDebtors.length} học viên)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('debt');
                      setAdminTab('list');
                    }}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                  >
                    Xem tất cả trong danh sách →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {urgentDebtors.slice(0, 6).map((fee) => {
                    const student = users.find((u) => u.id === fee.studentId);
                    const studentClass = classes.find((c) => c.id === fee.classId);

                    return (
                      <div
                        key={fee.id}
                        className="bg-white p-3.5 rounded-2xl border border-rose-200/80 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-black text-slate-900 text-xs">
                            {student?.name || 'Học viên'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold">
                            {studentClass?.className || 'Lớp học'} • Mã: <span className="font-mono">{student?.studentCode || 'N/A'}</span>
                          </div>
                          <div className="text-xs font-black text-rose-600 font-mono">
                            {formatVND(fee.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Hạn chót: {fee.dueDate}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickTogglePaid(fee)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] shadow-2xs whitespace-nowrap active:scale-95"
                          title="Bấm để xác nhận học viên đã đóng học phí"
                        >
                          ✓ Thu Tiền
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: SỔ QUẢN LÝ & DANH SÁCH CHI TIẾT
           ======================================================== */}
        {adminTab === 'list' && (
          <div className="space-y-5">
            {/* Filter Bar Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
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
          </div>
        )}

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

      {/* ========================================================
          MODAL: CÀI ĐẶT THÔNG TIN TÀI KHOẢN NGÂN HÀNG (ADMIN)
         ======================================================== */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="font-black text-slate-900 text-base">
                  Cài Đặt Tài Khoản Ngân Hàng Nhận Học Phí
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBankConfig} className="space-y-4 text-xs sm:text-sm">
              <p className="text-xs text-slate-500 leading-relaxed">
                Thông tin này sẽ được hiển thị trực tiếp cho phụ huynh trong mục <strong>Sổ Theo Dõi Học Phí & Chuyển Khoản Của Con</strong> trên cả máy vi tính và điện thoại.
              </p>

              {/* 1. Tên ngân hàng */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Ngân Hàng *
                </label>
                <div className="space-y-2">
                  <select
                    value={bankFormData.bankName}
                    onChange={(e) => {
                      if (e.target.value !== 'other') {
                        setBankFormData({ ...bankFormData, bankName: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-blue-600 text-xs"
                  >
                    <option value="Vietcombank (VCB)">Vietcombank (Ngoại Thương - VCB)</option>
                    <option value="MB Bank (Quân Đội)">MB Bank (Ngân Hàng Quân Đội)</option>
                    <option value="Techcombank (TCB)">Techcombank (Kỹ Thương - TCB)</option>
                    <option value="ACB (Á Châu)">ACB (Ngân Hàng Á Châu)</option>
                    <option value="BIDV">BIDV (Đầu Tư & Phát Triển)</option>
                    <option value="Agribank">Agribank (Nông Nghiệp & PTNT)</option>
                    <option value="VietinBank">VietinBank (Công Thương)</option>
                    <option value="TPBank">TPBank (Tiên Phong)</option>
                    <option value="VPBank">VPBank (Việt Nam Thịnh Vượng)</option>
                    <option value="Sacombank">Sacombank (Sài Gòn Thương Tín)</option>
                    <option value="HDBank">HDBank (Phát Triển TP.HCM)</option>
                    <option value="MSB">MSB (Hàng Hải)</option>
                    <option value="OCB">OCB (Phương Đông)</option>
                    <option value="VIB">VIB (Quốc Tế)</option>
                    <option value="SHB">SHB (Sài Gòn - Hà Nội)</option>
                    <option value="other">Tên ngân hàng khác (Tự nhập tay bên dưới)...</option>
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="Hoặc gõ tên ngân hàng cụ thể..."
                    value={bankFormData.bankName}
                    onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-slate-50 focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              {/* 2. Số tài khoản & Chủ tài khoản */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số Tài Khoản Ngân Hàng *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 0121000678999"
                    value={bankFormData.accountNumber}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value.replace(/\s+/g, '') })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-blue-900 bg-white focus:ring-2 focus:ring-blue-600 text-sm tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên Chủ Tài Khoản / Trung Tâm *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TT NGOAI NGU LOOK ENGLISH"
                    value={bankFormData.accountHolder}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountHolder: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-black uppercase text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              {/* 3. Chi nhánh */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chi Nhánh Ngân Hàng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: Chi nhánh Vĩnh Long / CN Bình Minh"
                  value={bankFormData.branch || ''}
                  onChange={(e) => setBankFormData({ ...bankFormData, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              {/* 4. Ảnh mã QR thanh toán từ máy tính */}
              <div>
                <MediaDropzone
                  label="Ảnh Mã QR Chuyển Khoản Ngân Hàng (Tải từ máy tính)"
                  sublabel="Chọn file ảnh mã QR VietQR hoặc mã QR ngân hàng từ máy tính để phụ huynh quét mã tiện lợi"
                  accept="image"
                  valueUrl={bankFormData.qrImageUrl || ''}
                  onChangeUrl={(url) => setBankFormData({ ...bankFormData, qrImageUrl: url })}
                />
              </div>

              {/* 5. Ghi chú thêm cho phụ huynh */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ghi Chú Hướng Dẫn Thêm Khi Phụ Huynh Chuyển Khoản:
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Vui lòng ghi đúng cú pháp chuyển khoản để hệ thống tự động cập nhật học phí..."
                  value={bankFormData.note || ''}
                  onChange={(e) => setBankFormData({ ...bankFormData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  Lưu Cài Đặt Ngân Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
