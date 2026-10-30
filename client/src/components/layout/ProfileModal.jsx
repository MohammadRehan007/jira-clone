import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { Camera, Loader2, Check, UploadCloud } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size cannot exceed 10MB', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const res = await axiosClient.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success && res.data.user) {
        updateUser(res.data.user);
        addToast('Profile avatar updated successfully via Cloudinary!', 'success');
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Avatar upload failed';
      addToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="User Profile & Avatar"
      subtitle="Manage your profile photo powered by Cloudinary"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            Cancel
          </Button>
          {selectedFile && (
            <Button
              variant="primary"
              size="sm"
              icon={Check}
              isLoading={uploading}
              onClick={handleUploadAvatar}
            >
              Save New Photo
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Avatar with Camera Overlay */}
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500/20 shadow-md">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Avatar user={user} size="lg" className="w-24 h-24 text-2xl" />
            )}
          </div>

          <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-semibold">Change Photo</span>
          </div>

          <button
            type="button"
            className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors ring-2 ring-white"
            title="Upload photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center text-center gap-1">
          <h3 className="text-base font-bold text-slate-800">{user?.name}</h3>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <RoleBadge role={user?.role} />
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {user?.department || 'Engineering'}
            </span>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="w-full border-t border-slate-100 pt-4 flex flex-col items-center text-center">
          {selectedFile ? (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg font-medium">
              <span>Ready to upload: <strong>{selectedFile.name}</strong></span>
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-400 hover:text-slate-600 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload photo to Cloudinary</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
