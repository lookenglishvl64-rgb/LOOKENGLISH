import React, { useState } from 'react';
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
} from 'lucide-react';

interface HomeworkManagerProps {
  assignments: AssignmentModel[];
  classes: ClassModel[];
  users: UserModel[];
  currentRole: UserRole;
  currentUserId: string;
  onAddAssignment: (assignment: Omit<AssignmentModel, 'id'>) => void;
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
  onSubmitHomework,
  onGradeSubmission,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);

  // New assignment form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('Unit_Assignment_Prompt.pdf');
  const [dueDate, setDueDate] = useState('2026-10-10');

  // Submit form
  const [submissionFileName, setSubmissionFileName] = useState('My_English_Homework.pdf');

  // Teacher feedback modal
  const [gradingModalData, setGradingModalData] = useState<{ assignmentId: string; studentId: string; studentName: string } | null>(null);
  const [giveScore, setGiveScore] = useState<number>(8.5);
  const [giveFeedback, setGiveFeedback] = useState('Bài làm tốt, cấu trúc rõ ràng!');

  const currentUser = users.find((u) => u.id === currentUserId);
  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  const classAssignments = assignments.filter((a) => a.classId === selectedClassId);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddAssignment({
      classId: selectedClassId,
      title,
      description,
      fileName,
      fileUrl: `https://example.com/materials/${encodeURIComponent(fileName)}`,
      dueDate,
      submissions: [],
    });
    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModal || !currentUser) return;
    onSubmitHomework(showSubmitModal, {
      studentId: currentUser.id,
      studentName: currentUser.name,
      fileName: submissionFileName,
      fileUrl: `https://example.com/submissions/${encodeURIComponent(submissionFileName)}`,
    });
    setShowSubmitModal(null);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Giao Bài Tập & Nộp Bài Trực Tuyến</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Bài Tập Về Nhà
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Giáo viên giao đề bài kèm file PDF/Audio và chấm bài trực tiếp sau khi học viên nộp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Lớp Học:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs sm:text-sm font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Giao Bài Mới</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {classAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">Chưa có bài tập nào được giao cho lớp này.</p>
            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
              >
                + Bấm vào đây để tạo bài tập đầu tiên
              </button>
            )}
          </div>
        ) : (
          classAssignments.map((asg) => {
            const mySubmission = asg.submissions?.find(
              (s) => s.studentId === currentUserId
            );
            const submissionsCount = asg.submissions?.length || 0;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:border-indigo-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      Hạn nộp: {asg.dueDate}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {asg.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {asg.description}
                    </p>
                  </div>

                  {/* Attached material pill */}
                  {asg.fileName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate max-w-[160px]">{asg.fileName}</span>
                    </div>
                  )}
                </div>

                {/* Submissions Section */}
                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      {submissionsCount} bài đã nộp
                    </span>
                    {currentRole === 'student' && (
                      <span>
                        {mySubmission ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Em đã nộp bài ({mySubmission.fileName})
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Chưa nộp bài
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Action button based on role */}
                  <div className="flex items-center gap-2">
                    {currentRole === 'student' && (
                      <button
                        onClick={() => setShowSubmitModal(asg.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
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

                {/* Teacher view: list of submissions */}
                {isTeacherOrAdmin && submissionsCount > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Danh sách bài nộp của học viên:
                    </h5>
                    <div className="space-y-1.5">
                      {asg.submissions?.map((sub) => (
                        <div
                          key={sub.studentId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs gap-2"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{sub.studentName}</span>
                            <span className="text-slate-400 ml-2">({sub.submittedAt})</span>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              File: <strong>{sub.fileName}</strong>
                            </div>
                            {sub.teacherFeedback && (
                              <p className="text-[11px] text-indigo-700 mt-0.5 italic">
                                Nhận xét GV: "{sub.teacherFeedback}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {sub.score !== undefined ? (
                              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                                {sub.score.toFixed(1)} Điểm
                              </span>
                            ) : null}

                            <button
                              onClick={() => {
                                setGradingModalData({
                                  assignmentId: asg.id,
                                  studentId: sub.studentId,
                                  studentName: sub.studentName,
                                });
                                setGiveScore(sub.score || 8.5);
                                setGiveFeedback(sub.teacherFeedback || 'Bài làm tốt!');
                              }}
                              className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200"
                            >
                              {sub.score !== undefined ? 'Chấm lại' : 'Chấm điểm & Nhận xét'}
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

      {/* MODAL: CREATE ASSIGNMENT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Giao Bài Tập Về Nhà Mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu Đề Bài Tập *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Unit 3: Speaking Practice - Voice Recording"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Yêu Cầu Chi Tiết</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Hướng dẫn học viên cách làm và định dạng file nộp..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên File Đính Kèm</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hạn Nộp *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Giao Bài Tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT HOMEWORK */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Nộp Bài Tập Về Nhà</h3>
              <button
                onClick={() => setShowSubmitModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chọn file bài nộp (PDF, MP3, DOCX hoặc Ảnh)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Tải lên file bài làm</p>
                  <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ PDF, MP3 (Speaking audio), DOCX</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên File Bài Nộp</label>
                <input
                  type="text"
                  required
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  Xác Nhận Nộp Bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRADE SUBMISSION */}
      {gradingModalData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Chấm Điểm: {gradingModalData.studentName}
              </h3>
              <button
                onClick={() => setGradingModalData(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Điểm Số (0 - 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={giveScore}
                  onChange={(e) => setGiveScore(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lời Nhận Xét Của Giáo Viên</label>
                <textarea
                  rows={3}
                  required
                  value={giveFeedback}
                  onChange={(e) => setGiveFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingModalData(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Lưu Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
