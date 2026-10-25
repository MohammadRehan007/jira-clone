import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, ExternalLink, Loader2, Paperclip } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const ImageUpload = ({
  attachments = [],
  onChange,
  onUploaded,
  folder = 'jira-clone/attachments',
  maxFiles = 5,
  disabled = false,
  compact = false
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    // Filter image types
    const validImages = fileList.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      addToast('Please select valid image files (JPG, PNG, WebP, GIF, SVG)', 'error');
      return;
    }

    if (attachments.length + validImages.length > maxFiles) {
      addToast(`You can upload at most ${maxFiles} attachments in total`, 'warning');
      return;
    }

    try {
      setUploading(true);
      const uploadedResults = [];

      for (const file of validImages) {
        if (file.size > 10 * 1024 * 1024) {
          addToast(`File '${file.name}' is larger than 10MB limit`, 'error');
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        const res = await axiosClient.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (res.data?.success && res.data.file) {
          uploadedResults.push(res.data.file);
          if (onUploaded) {
            onUploaded(res.data.file);
          }
        }
      }

      if (uploadedResults.length > 0) {
        if (onChange) {
          onChange([...attachments, ...uploadedResults]);
        }
        addToast(`Uploaded ${uploadedResults.length} image(s) to Cloudinary successfully!`, 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Image upload failed';
      addToast(msg, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = async (index, att) => {
    if (disabled || uploading) return;
    try {
      if (att.publicId) {
        // Asynchronously delete from Cloudinary
        axiosClient.delete(`/upload/${encodeURIComponent(att.publicId)}`).catch(() => {});
      }
      const updated = attachments.filter((_, i) => i !== index);
      if (onChange) {
        onChange(updated);
      }
    } catch (err) {
      console.warn('Remove error:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        disabled={disabled || uploading}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Trigger Area */}
      {attachments.length < maxFiles && (
        <div
          onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
            compact ? 'p-3' : 'p-5'
          } ${
            dragOver
              ? 'border-blue-500 bg-blue-50/70 text-blue-700'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-blue-600 py-1">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-slate-700">
                <span className="text-blue-600 font-semibold underline underline-offset-2">
                  Click to upload
                </span>{' '}
                or drag & drop images
              </div>
              <p className="text-[11px] text-slate-400">
                PNG, JPG, WebP, GIF, SVG up to 10MB (Cloudinary CDN)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attachments Preview Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {attachments.map((att, idx) => (
            <div
              key={att._id || att.publicId || idx}
              className="group relative flex flex-col rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="relative h-24 bg-slate-100 overflow-hidden flex items-center justify-center">
                <img
                  src={att.url}
                  alt={att.name || 'Attachment'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    title="View preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(att);
                    }}
                    className="p-1.5 bg-white/90 text-slate-800 rounded-full hover:bg-white hover:scale-110 transition-transform"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  {onChange && !disabled && (
                    <button
                      type="button"
                      title="Remove image"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx, att);
                      }}
                      className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-2 flex flex-col">
                <span className="text-xs font-semibold text-slate-800 truncate" title={att.name || 'Image'}>
                  {att.name || 'image.jpg'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatFileSize(att.size)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-700 truncate max-w-md">
                {previewImage.name || 'Attachment Preview'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open original
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-slate-900/5 max-h-[75vh]">
              <img
                src={previewImage.url}
                alt={previewImage.name || 'Preview'}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
