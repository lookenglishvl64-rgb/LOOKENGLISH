import React, { useState, useRef } from 'react';
import { CertificateModel, UserModel, UserRole } from '../types';
import {
  Award,
  Download,
  Eye,
  Plus,
  Upload,
  Calendar,
  CheckCircle,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface CertificateVaultProps {
  certificates: CertificateModel[];
  users: UserModel[];
  currentRole: UserRole;
  currentUserId: string;
  onUploadCertificate: (cert: Omit<CertificateModel, 'id'>) => void;
  onUpdateCertificate?: (certId: string, data: Partial<CertificateModel>) => void;
  onDeleteCertificate?: (certId: string) => void;
}

export const CertificateVault: React.FC<CertificateVaultProps> = ({
  certificates,
  users,
  currentRole,
  currentUserId,
  onUploadCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
}) => {
  const students = users.filter((u) => u.role === 'student');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(
    currentRole === 'student'
      ? currentUserId
      : currentRole === 'parent'
      ? users.find((u) => u.id === currentUserId)?.parentOfStudentId || 'all'
      : 'all'
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateModel | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateModel | null>(null);

  // Form states
  const [certStudentId, setCertStudentId] = useState(students[0]?.id || '');
  const [certName, setCertName] = useState('');
  const [certType, setCertType] = useState('Cambridge Young Learners');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10));
  const [verificationCode, setVerificationCode] = useState('');
  const [fileUrl, setFileUrl] = useState(
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  const filteredCerts = certificates.filter((c) => {
    if (selectedStudentFilter !== 'all' && c.studentId !== selectedStudentFilter) {
      return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingCert(null);
    setCertStudentId(students[0]?.id || '');
    setCertName('');
    setCertType('Cambridge Young Learners');
    setIssueDate(new Date().toISOString().substring(0, 10));
    setVerificationCode(`LE-CERT-${Math.floor(1000 + Math.random() * 9000)}`);
    setFileUrl('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80');
    setShowUploadModal(true);
  };

  const handleOpenEditModal = (cert: CertificateModel) => {
    setEditingCert(cert);
    setCertStudentId(cert.studentId);
    setCertName(cert.certName);
    setCertType(cert.certType || 'Cambridge Young Learners');
    setIssueDate(cert.issueDate);
    setVerificationCode(cert.verificationCode || `LE-CERT-${Math.floor(1000 + Math.random() * 9000)}`);
    setFileUrl(cert.fileUrl);
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) return;

    if (editingCert && onUpdateCertificate) {
      onUpdateCertificate(editingCert.id, {
        studentId: certStudentId,
        certName,
        certType,
        issueDate,
        fileUrl,
        verificationCode: verificationCode || `LE-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } else {
      onUploadCertificate({
        studentId: certStudentId,
        certName,
        certType,
        issueDate,
        fileUrl,
        verificationCode: verificationCode || `LE-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }

    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kho Lưu Trữ Chứng Chỉ Học Viên Điện Tử</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hồ Sơ & Chứng Chỉ Học Viên
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lưu trữ vĩnh viễn văn bằng Cambridge, IELTS, TOEIC và Giấy khen vinh danh. Admin có thể thêm mới, điều chỉnh hoặc xóa chứng chỉ của học sinh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Only Admin and Teacher can filter students. Parents can ONLY see their child's certificates */}
            {(currentRole === 'admin' || currentRole === 'teacher') && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Lọc Học Viên:
                </label>
                <select
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                  className="text-xs sm:text-sm font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">Tất cả học viên ({certificates.length} chứng chỉ)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || 'LK'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentRole === 'parent' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-1.5 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Hồ sơ chứng chỉ:</span>
                <span className="font-extrabold text-blue-900">
                  {students.find((s) => s.id === selectedStudentFilter)?.name || 'Học viên của bạn'}
                </span>
              </div>
            )}

            {isTeacherOrAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 sm:mt-0 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Chứng Chỉ Mới</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
          <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h4 className="font-bold text-slate-700 text-base">Chưa có chứng chỉ nào</h4>
          <p className="text-xs mt-1">Học viên này hiện chưa được cấp chứng chỉ hoặc giấy khen.</p>
          {isTeacherOrAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#1E40AF] text-white text-xs font-bold rounded-xl"
            >
              Cấp chứng chỉ đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => {
            const student = users.find((u) => u.id === cert.studentId);

            return (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Admin controls badge */}
                {isTeacherOrAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1 rounded-xl">
                    <button
                      onClick={() => handleOpenEditModal(cert)}
                      className="p-1 text-white hover:text-amber-300 transition-colors"
                      title="Điều chỉnh thông tin chứng chỉ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteCertificate && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa chứng chỉ "${cert.certName}" của học sinh ${student?.name || ''}?`)) {
                            onDeleteCertificate(cert.id);
                          }
                        }}
                        className="p-1 text-white hover:text-rose-400 transition-colors"
                        title="Xóa chứng chỉ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <div>
                  {/* Certificate Image Preview */}
                  <div
                    onClick={() => setPreviewCert(cert)}
                    className="relative h-44 overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    <img
                      src={cert.fileUrl}
                      alt={cert.certName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                    
                    <span className="absolute bottom-3 left-3 bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg uppercase shadow-sm">
                      {cert.certType || 'Official Certificate'}
                    </span>
                  </div>

                  {/* Certificate Info */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {student?.name || 'Học viên'}
                      </span>
                      <span className="text-slate-400 font-medium">{cert.issueDate}</span>
                    </div>

                    <h4 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                      {cert.certName}
                    </h4>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                      <span>Mã xác thực:</span>
                      <span className="font-mono text-blue-700 font-bold bg-slate-50 px-2 py-0.5 rounded">
                        #{cert.verificationCode || 'LK-CERT-2026'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xem Bản Gốc</span>
                  </button>

                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition-colors"
                    title="Tải về file chất lượng cao"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT CERTIFICATE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingCert ? 'Điều Chỉnh Thông Tin Chứng Chỉ' : 'Cấp Chứng Chỉ Cho Học Viên'}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Học Viên Nhận Chứng Chỉ *</label>
                <select
                  value={certStudentId}
                  onChange={(e) => setCertStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Chứng Chỉ / Danh Hiệu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cambridge Flyers - 15 Khiên Tuyệt Đối"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại Chứng Chỉ</label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Cambridge Starters">Cambridge Starters</option>
                    <option value="Cambridge Movers">Cambridge Movers</option>
                    <option value="Cambridge Flyers">Cambridge Flyers</option>
                    <option value="IELTS Certificate">IELTS Official Band</option>
                    <option value="Top 1 Monthly Award">Top 1 Vinh Danh Tháng</option>
                    <option value="Honor Roll Award">Học Bổng Honor Roll</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Cấp</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã Số Xác Thực Tra Cứu</label>
                <input
                  type="text"
                  placeholder="LE-CERT-9999"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono uppercase"
                />
              </div>

              {/* File / Image Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hình Ảnh Bản Scan Chứng Chỉ *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-3 text-center bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="font-bold text-slate-800 text-xs">
                    Tải ảnh scan chứng chỉ từ máy tính / điện thoại
                  </p>
                  <p className="text-[11px] text-slate-400">Hỗ trợ JPG, PNG, WEBP độ phân giải cao</p>
                </div>

                {fileUrl && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img
                      src={fileUrl}
                      alt="Cert Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">Bản xem trước chứng chỉ</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">✓ Sẵn sàng lưu</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900 shadow-xs active:scale-95 transition-all"
                >
                  {editingCert ? 'Lưu Điều Chỉnh' : 'Lưu & Cấp Chứng Chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULL PREVIEW */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm sm:text-base">{previewCert.certName}</h4>
                <p className="text-xs text-slate-400">
                  Học viên: {users.find((u) => u.id === previewCert.studentId)?.name} • Mã: #{previewCert.verificationCode}
                </p>
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="text-white/80 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-950/90">
              <img
                src={previewCert.fileUrl}
                alt={previewCert.certName}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Ngày cấp: {previewCert.issueDate}</span>
              <a
                href={previewCert.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-xl text-xs font-bold hover:bg-blue-900"
              >
                <Download className="w-4 h-4" />
                <span>Tải File Gốc Về Máy</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
