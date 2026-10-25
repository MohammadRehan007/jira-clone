import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { AlertTriangle, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

const ConfirmDeleteModal = ({ isOpen, onClose, userToDelete }) => {
  const { fetchUsers } = useProject();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!userToDelete) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.delete(`/users/${userToDelete._id}`);
      addToast(res.data.message || `User '${userToDelete.name}' deleted successfully!`, 'success');
      await fetchUsers();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Team Member"
      subtitle="Permanently remove user from Jira Engine workspace"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={loading}
            onClick={handleDelete}
            icon={Trash2}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
          >
            Delete User
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-900">Warning: Irreversible Action</p>
            <p className="mt-0.5 text-rose-700">
              Removing this account will unassign their tickets and revoke their access to all workspace projects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Avatar user={userToDelete} size="md" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm">{userToDelete.name}</span>
            <span className="text-xs text-slate-500">{userToDelete.email}</span>
            <div className="mt-1">
              <RoleBadge role={userToDelete.role} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
