import React, { useState } from 'react';
import { CertificateModel, UserModel, UserRole } from '../types';
import {
  Award,
  Upload,
  Eye,
  Download,
  Calendar,
  ShieldCheck,
  Plus,
  FileCheck,
  Search,
} from 'lucide-react';

interface CertificateVaultProps {
  certificates: CertificateModel[];
  users: UserModel[];
  currentRole: UserRole;
  currentUserId: string;
  onUploadCertificate: (cert: Omit<CertificateModel, 'id'>) => void;
}

export const CertificateVault: React.FC<CertificateVaultProps> = ({
  certificates,
  users,
  currentRole,
  currentUserId,
  onUploadCertificate,
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
  const [previewCert, setPreviewCert] = useState<CertificateModel | null>(null);

  // Form states
  const [certStudentId, setCertStudentId] = useState(students[0]?.id || '');
  const [certName, setCertName] = useState('');
  const [certType, setCertType] = useState('Cambridge Young Learners');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10));
  const [fileUrl, setFileUrl] = useState(
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80'
  );

  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  const filteredCerts = certificates.filter((c) => {
    if (selectedStudentFilter !== 'all' && c.studentId !== selectedStudentFilter) {
      return false;
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) return;

    onUploadCertificate({
      studentId: certStudentId,
      certName,
      certType,
      issueDate,
      fileUrl,
      verificationCode: `LE-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setCertName('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kho Lưu Trữ Chứng Chỉ Điện Tử</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hồ Sơ & Chứng Chỉ Học Viên
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Lưu trữ vĩnh viễn văn bằng Cambridge, IELTS, TOEIC và Giấy khen vinh danh để phụ huynh/học viên tải về.
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
                      {s.name}
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
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 sm:mt-0 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Chứng Chỉ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
          <Award className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-sm">Chưa có chứng chỉ nào trong danh mục này.</p>
          {isTeacherOrAdmin && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
            >
              + Upload chứng chỉ mới cho học viên
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
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Visual preview header */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setPreviewCert(cert)}>
                    <img
                      src={cert.fileUrl}
                      alt={cert.certName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xs font-bold text-white bg-indigo-600/90 backdrop-blur-xs px-2.5 py-1 rounded-md">
                        {cert.certType || 'Chứng chỉ hoàn thành'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                      {cert.certName}
                    </h4>

                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                        alt={student?.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {student?.name || 'Học viên'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Cấp ngày: {cert.issueDate}
                      </span>
                      {cert.verificationCode && (
                        <span className="font-mono text-indigo-600 font-semibold">
                          #{cert.verificationCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Xem Bản Đầy Đủ</span>
                  </button>

                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    title="Tải về file gốc"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: UPLOAD CERTIFICATE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Upload Chứng Chỉ Học Viên</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Học Viên Nhận Chứng Chỉ *</label>
                <select
                  value={certStudentId}
                  onChange={(e) => setCertStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Chứng Chỉ / Văn Bằng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cambridge Flyers - 15 Shields hoặc IELTS 7.5 Certificate"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Loại Chứng Chỉ</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Cambridge Young Learners">Cambridge Young Learners (Starters/Movers/Flyers)</option>
                  <option value="IELTS Official Certificate">IELTS Academic / General</option>
                  <option value="Center Honor Certificate">Giấy Khen / Vinh Danh Trung Tâm</option>
                  <option value="Certificate of Completion">Chứng Chỉ Tốt Nghiệp Khóa Học</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngày Cấp Chứng Chỉ *</label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">File Ảnh / PDF Chứng Chỉ</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Chọn file từ máy tính</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Lưu & Cấp Chứng Chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW CERTIFICATE FULL */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{previewCert.certName}</h3>
                <p className="text-xs text-slate-500">Mã xác thực: {previewCert.verificationCode || 'LE-AUTH'}</p>
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[360px]">
              <img
                src={previewCert.fileUrl}
                alt={previewCert.certName}
                className="max-h-[460px] w-auto object-contain rounded-lg shadow-lg border border-slate-700"
              />
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">Ngày cấp: <strong>{previewCert.issueDate}</strong></span>
              <a
                href={previewCert.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Tải File Chứng Chỉ</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
