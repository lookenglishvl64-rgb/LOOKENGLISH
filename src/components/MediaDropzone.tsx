import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Video, X, Check, Link as LinkIcon, FileText } from 'lucide-react';

interface MediaDropzoneProps {
  label: string;
  sublabel?: string;
  accept?: 'image' | 'video' | 'any';
  valueUrl?: string;
  onChangeUrl: (dataUrl: string) => void;
  required?: boolean;
  helpText?: string;
}

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  label,
  sublabel,
  accept = 'image',
  valueUrl = '',
  onChangeUrl,
  required = false,
  helpText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const acceptTypes =
    accept === 'video'
      ? 'video/mp4,video/webm,video/quicktime,video/*'
      : accept === 'image'
      ? 'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/*'
      : 'image/*,video/*,.pdf';

  const handleProcessFile = (file: File) => {
    if (!file) return;

    // Check size limit (max 50MB for video, 15MB for image)
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 60) {
      alert(`File "${file.name}" quá lớn (${sizeInMB.toFixed(1)}MB). Vui lòng chọn file dưới 50MB.`);
      return;
    }

    setFileName(file.name);
    setFileSize(
      file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    );

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChangeUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleClear = () => {
    onChangeUrl('');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isVideo = accept === 'video' || valueUrl.startsWith('data:video') || valueUrl.includes('.mp4');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 text-xs sm:text-sm flex items-center gap-1.5">
          {accept === 'video' ? (
            <Video className="w-4 h-4 text-rose-600" />
          ) : (
            <ImageIcon className="w-4 h-4 text-blue-600" />
          )}
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Ẩn dán link' : 'Hoặc dán link'}</span>
        </button>
      </div>

      {sublabel && <p className="text-[11px] text-slate-500">{sublabel}</p>}

      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptTypes}
        className="hidden"
      />

      {/* File Dropzone & Picker Button */}
      {!valueUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80 bg-white'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
            <Upload className="w-6 h-6 animate-bounce" />
          </div>
          <div className="font-bold text-slate-800 text-xs sm:text-sm">
            Bấm để chọn file trực tiếp từ vi tính
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            hoặc kéo và thả file vào đây {accept === 'video' ? '(Video MP4, MOV, WebM)' : '(Ảnh JPG, PNG, WEBP, PDF)'}
          </div>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Chọn file từ máy tính</span>
          </div>
        </div>
      ) : (
        /* Preview Card When File Loaded */
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            {isVideo ? (
              <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-slate-300">
                <video src={valueUrl} className="w-full h-full object-cover" />
              </div>
            ) : (
              <img
                src={valueUrl}
                alt="Xem trước"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
              />
            )}

            <div className="text-xs space-y-0.5">
              <div className="font-bold text-slate-900 line-clamp-1">
                {fileName || (isVideo ? 'Video tải từ máy tính' : 'Ảnh tải từ máy tính')}
              </div>
              {fileSize && (
                <span className="text-[10px] text-slate-500 font-mono block">
                  Dung lượng: {fileSize}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3" />
                <span>Đã nạp file từ máy tính thành công</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
            >
              Đổi file khác
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
              title="Xóa file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Optional fallback URL input */}
      {showUrlInput && (
        <div className="pt-1">
          <input
            type="text"
            placeholder="Hoặc dán đường link URL trực tiếp tại đây..."
            value={valueUrl.startsWith('data:') ? '' : valueUrl}
            onChange={(e) => onChangeUrl(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 font-mono"
          />
        </div>
      )}

      {helpText && <p className="text-[10px] text-slate-400 italic">{helpText}</p>}
    </div>
  );
};
