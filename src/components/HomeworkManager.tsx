import React, { useState, useRef } from 'react';
import { AssignmentModel, ClassModel, UserModel, UserRole } from '../types';
import {
  FileText,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Send,
  FileCheck,
  Download,
  AlertCircle,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Eye,
  File,
  X,
} from 'lucide-react';

interface HomeworkManagerProps {
  assignments: AssignmentModel[];
  classes: ClassModel[];
  users: UserModel[];
  currentRole: UserRole;
  currentUserId: string;
  onAddAssignment: (assignment: Omit<AssignmentModel, 'id'>) => void;
  onUpdateAssignment?: (assignmentId: string, data: Partial<AssignmentModel>) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
  onSubmitHomework: (assignmentId: string, submission: { studentId: string; studentName: string; fileName: string; fileUrl: string }) => void;
  onGradeSubmission?: (assignmentId: string, studentId: string, score: number, feedback: string) => void;
}

export const HomeworkManager: React.FC<HomeworkManagerProps> = ({
  assignments,
  classes,
  users,
  currentRole,
  currentUserId,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onSubmitHomework,
  onGradeSubmission,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);
  const [previewFileModal, setPreviewFileModal] = useState<{ title: string; fileUrl: string; fileName?: string } | null>(null);

  // New assignment form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'doc' | 'other'>('pdf');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );

  // File input ref for Teacher/Admin
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  // Submit form state for student/parent
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');

  // Teacher feedback modal state
  const [gradingModalData, setGradingModalData] = useState<{ assignmentId: string; studentId: string; studentName: string } | null>(null);
  const [giveScore, setGiveScore] = useState<number>(8.5);
  const [giveFeedback, setGiveFeedback] = useState('Bài làm tốt, cấu trúc rõ ràng!');

  const currentUser = users.find((u) => u.id === currentUserId);
  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  const classAssignments = assignments.filter((a) => a.classId === selectedClassId);

  // Teacher / Admin file upload handler
  const handleTeacherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type.startsWith('image/')) {
      setFileType('image');
    } else if (file.type.includes('pdf')) {
      setFileType('pdf');
    } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      setFileType('doc');
    } else {
      setFileType('other');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Student submission file upload handler
  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmissionFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSubmissionFileUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddAssignment({
      classId: selectedClassId,
      title,
      description,
      fileName: fileName || 'De_Bai_Tap_Ve_Nha.pdf',
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      dueDate,
      submissions: [],
    });

    setTitle('');
    setDescription('');
    setFileName('');
    setFileUrl('');
    setShowCreateModal(false);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModal || !currentUser) return;

    onSubmitHomework(showSubmitModal, {
      studentId: currentUser.id,
      studentName: currentUser.name,
      fileName: submissionFileName || 'Bai_Lam_Hoc_Vien.pdf',
      fileUrl: submissionFileUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
    });

    setShowSubmitModal(null);
    setSubmissionFileName('');
    setSubmissionFileUrl('');
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingModalData || !onGradeSubmission) return;
    onGradeSubmission(
      gradingModalData.assignmentId,
      gradingModalData.studentId,
      giveScore,
      giveFeedback
    );
    setGradingModalData(null);
  };

  const isImageFile = (url?: string, name?: string) => {
    if (!url && !name) return false;
    return (
      url?.startsWith('data:image/') ||
      url?.includes('images.unsplash.com') ||
      name?.toLowerCase().endsWith('.png') ||
      name?.toLowerCase().endsWith('.jpg') ||
      name?.toLowerCase().endsWith('.jpeg') ||
      name?.toLowerCase().endsWith('.webp')
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Giao Bài Tập & Nộp Bài Trực Tuyến</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Bài Tập Về Nhà
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Giáo viên và Admin có thể trực tiếp upload file đề bài (PDF, DOCX) hoặc chụp/tải hình ảnh phiếu bài tập về nhà cho học sinh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Chọn Lớp Học:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs sm:text-sm font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} ({c.level})
                  </option>
                ))}
              </select>
            </div>

            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 sm:mt-0 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Bài Tập Mới</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Assignments List */}
      <div className="space-y-4">
        {classAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-700 text-base">Chưa có bài tập nào</h4>
            <p className="text-xs mt-1">Lớp học này hiện chưa được giao bài tập về nhà.</p>
            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-[#1E40AF] text-white text-xs font-bold rounded-xl"
              >
                Tải lên bài tập đầu tiên
              </button>
            )}
          </div>
        ) : (
          classAssignments.map((asg) => {
            const submissionsCount = asg.submissions?.length || 0;
            const mySubmission = asg.submissions?.find((s) => s.studentId === currentUserId);
            const hasImage = isImageFile(asg.fileUrl, asg.fileName);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Hạn nộp: {asg.dueDate}
                      </span>

                      {asg.fileName && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          {hasImage ? <ImageIcon className="w-3 h-3" /> : <Paperclip className="w-3 h-3" />}
                          <span>{asg.fileName}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{asg.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {asg.description}
                    </p>

                    {/* Image / File Thumbnail Preview */}
                    {hasImage && asg.fileUrl && (
                      <div className="pt-2">
                        <div
                          onClick={() =>
                            setPreviewFileModal({
                              title: asg.title,
                              fileUrl: asg.fileUrl || '',
                              fileName: asg.fileName,
                            })
                          }
                          className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group/img max-w-sm"
                        >
                          <img
                            src={asg.fileUrl}
                            alt={asg.title}
                            className="max-h-48 w-auto object-cover group-hover/img:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span>Bấm để phóng to xem đề bài</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Delete for Teacher/Admin */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View / Download Attached file */}
                    {asg.fileUrl && (
                      <button
                        onClick={() =>
                          setPreviewFileModal({
                            title: asg.title,
                            fileUrl: asg.fileUrl || '',
                            fileName: asg.fileName,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Xem Đề Bài</span>
                      </button>
                    )}

                    {isTeacherOrAdmin && onDeleteAssignment && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa bài tập "${asg.title}"?`)) {
                            onDeleteAssignment(asg.id);
                          }
                        }}
                        className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Xóa bài tập"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Submissions stats and Student Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      {submissionsCount} học sinh đã nộp
                    </span>

                    {currentRole === 'student' && (
                      <span>
                        {mySubmission ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Em đã nộp bài ({mySubmission.fileName})
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Chưa nộp bài
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {currentRole === 'student' && (
                      <button
                        onClick={() => {
                          setShowSubmitModal(asg.id);
                          setSubmissionFileName(`Bai_Tap_${currentUser?.name || 'HocVien'}.pdf`);
                        }}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          mySubmission
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{mySubmission ? 'Nộp lại bài tập' : 'Nộp Bài Tập'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Teacher / Admin view: List of student submissions */}
                {isTeacherOrAdmin && submissionsCount > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                    <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Danh sách bài nộp của học viên ({submissionsCount}):
                    </h5>
                    <div className="space-y-2">
                      {asg.submissions?.map((sub) => (
                        <div
                          key={sub.studentId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs gap-3 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900">{sub.studentName}</span>
                              <span className="text-slate-400 font-mono text-[11px]">({sub.submittedAt})</span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                              <span>File nộp: <strong>{sub.fileName}</strong></span>
                              {sub.fileUrl && (
                                <button
                                  onClick={() =>
                                    setPreviewFileModal({
                                      title: `Bài nộp: ${sub.studentName}`,
                                      fileUrl: sub.fileUrl,
                                      fileName: sub.fileName,
                                    })
                                  }
                                  className="text-blue-700 hover:underline font-bold ml-1"
                                >
                                  [Xem bài làm]
                                </button>
                              )}
                            </div>

                            {sub.teacherFeedback && (
                              <p className="text-[11px] text-blue-800 mt-1 italic font-medium">
                                Lời nhận xét: "{sub.teacherFeedback}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {sub.score !== undefined ? (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-lg text-xs">
                                Điểm: {sub.score} / 10
                              </span>
                            ) : (
                              <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                                Chưa chấm điểm
                              </span>
                            )}

                            <button
                              onClick={() => {
                                setGradingModalData({
                                  assignmentId: asg.id,
                                  studentId: sub.studentId,
                                  studentName: sub.studentName,
                                });
                                setGiveScore(sub.score ?? 8.5);
                                setGiveFeedback(sub.teacherFeedback ?? 'Bài làm tốt, trình bày sạch sẽ.');
                              }}
                              className="px-3 py-1.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-lg font-bold text-xs shadow-2xs transition-all"
                            >
                              {sub.score !== undefined ? 'Sửa Điểm' : 'Chấm Điểm'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          MODAL: TEACHER & ADMIN UPLOAD ASSIGNMENT (FILE / IMAGE)
         ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                Upload & Giao Bài Tập Về Nhà Mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bài Tập *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Unit 4: Reading & Vocabulary Worksheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hướng Dẫn Cho Học Sinh</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Yêu cầu học viên hoàn thành các bài tập trong file đính kèm trước hạn nộp..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* REAL FILE & IMAGE UPLOAD DROPZONE */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Đính Kèm File Đề Bài / Hình Ảnh Phiếu Bài Tập (Bắt buộc) *
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleTeacherFileChange}
                  accept="image/*,.pdf,.doc,.docx,.mp3,.zip"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-blue-50/40 hover:bg-blue-50/80 cursor-pointer transition-all"
                >
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-1.5" />
                  <p className="font-black text-slate-800 text-xs sm:text-sm">
                    {fileName ? `Đã chọn: ${fileName}` : 'Bấm vào đây để chọn File hoặc Hình ảnh từ máy tính / điện thoại'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Hỗ trợ: Hình ảnh (PNG, JPG, WEBP), PDF, Word (DOCX), hoặc Audio nghe (MP3)
                  </p>
                </div>

                {/* Instant Image Preview */}
                {fileType === 'image' && fileUrl && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img
                      src={fileUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">{fileName}</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        ✓ Hình ảnh sẵn sàng tải lên
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hạn Nộp Bài Tập *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900 active:scale-95 transition-all shadow-xs"
                >
                  Xác Nhận Giao Bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STUDENT SUBMIT HOMEWORK (FILE / IMAGE UPLOAD)
         ======================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Nộp File / Hình Ảnh Bài Làm</h3>
              <button
                onClick={() => setShowSubmitModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn File hoặc Chụp Ảnh Bài Viết Từ Điện Thoại *
                </label>

                <input
                  type="file"
                  ref={studentFileInputRef}
                  onChange={handleStudentFileChange}
                  accept="image/*,.pdf,.doc,.docx,.mp3"
                  className="hidden"
                />

                <div
                  onClick={() => studentFileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-4 text-center bg-emerald-50/40 hover:bg-emerald-50/80 cursor-pointer transition-all"
                >
                  <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-800 text-xs sm:text-sm">
                    {submissionFileName ? `Đã chọn: ${submissionFileName}` : 'Bấm để tải ảnh chụp bài làm hoặc file PDF'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Hỗ trợ ảnh chụp vở ghi, PDF, Word</p>
                </div>

                {submissionFileUrl.startsWith('data:image/') && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img
                      src={submissionFileUrl}
                      alt="Submission Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">{submissionFileName}</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">✓ Ảnh bài làm đã tải</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Hoặc Tên File Nộp</label>
                <input
                  type="text"
                  required
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Xác Nhận Nộp Bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: TEACHER GRADE SUBMISSION
         ======================================================== */}
      {gradingModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                Chấm Điểm Bài Nộp: {gradingModalData.studentName}
              </h3>
              <button
                onClick={() => setGradingModalData(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Điểm Số (Thang điểm 10 hoặc IELTS Band) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  required
                  value={giveScore}
                  onChange={(e) => setGiveScore(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-black text-base focus:ring-2 focus:ring-blue-600 text-blue-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lời Nhận Xét / Dặn Dò Của Giáo Viên
                </label>
                <textarea
                  rows={3}
                  required
                  value={giveFeedback}
                  onChange={(e) => setGiveFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingModalData(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E40AF] text-white rounded-xl font-bold hover:bg-blue-900 shadow-xs"
                >
                  Lưu Kết Quả Chấm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PREVIEW FULL FILE / IMAGE
         ======================================================== */}
      {previewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{previewFileModal.title}</h4>
                <p className="text-[11px] text-slate-400">{previewFileModal.fileName || 'Đề bài tập'}</p>
              </div>
              <button
                onClick={() => setPreviewFileModal(null)}
                className="text-white/80 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100 min-h-[300px]">
              {isImageFile(previewFileModal.fileUrl, previewFileModal.fileName) ? (
                <img
                  src={previewFileModal.fileUrl}
                  alt={previewFileModal.title}
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                  <File className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                  <h5 className="font-bold text-slate-800 text-base">{previewFileModal.fileName}</h5>
                  <p className="text-xs text-slate-500 mt-1">
                    File tài liệu học tập được tải lên bởi Giáo viên.
                  </p>
                  <a
                    href={previewFileModal.fileUrl}
                    download={previewFileModal.fileName || 'De_Bai.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1E40AF] text-white rounded-xl text-xs font-bold hover:bg-blue-900"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File Về Máy</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
