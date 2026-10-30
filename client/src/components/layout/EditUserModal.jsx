import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Lock, Building, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';

const generateRandomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

const EditUserModal = ({ isOpen, onClose, userToEdit }) => {
  const { fetchUsers } = useProject();
  const { user: currentUser, updateUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [department, setDepartment] = useState('Engineering');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit && isOpen) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setRole(userToEdit.role || 'Developer');
      setDepartment(userToEdit.department || 'Engineering');
      setNewPassword('');
      setShowPasswordInput(false);
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast('Name and Email are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        role,
        department: department.trim()
      };

      if (showPasswordInput && newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await axiosClient.put(`/users/${userToEdit._id}`, payload);

      addToast(`User '${res.data.name}' updated successfully!`, 'success');
      await fetchUsers();

      // If the edited user is the logged-in admin themselves, update the current user session
      if (currentUser && currentUser._id === userToEdit._id) {
        updateUser(res.data);
      }

      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!userToEdit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Team Member"
      subtitle={`Admin management for ${userToEdit.name} (${userToEdit.email})`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        <Input
          label="Full Name *"
          icon={User}
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          icon={Mail}
          placeholder="e.g. user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="System Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'Developer', label: 'Developer (Code & Fix)' },
              { value: 'Tester', label: 'Tester (QA Verification)' },
              { value: 'ProjectLead', label: 'Project Lead (Scrum & Sprints)' },
              { value: 'Admin', label: 'Admin (Full System Control)' },
              { value: 'Viewer', label: 'Viewer (Read Only)' }
            ]}
          />

          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Product', label: 'Product' },
              { value: 'QA & Testing', label: 'QA & Testing' },
              { value: 'Design', label: 'Design' },
              { value: 'Operations', label: 'Operations' }
            ]}
          />
        </div>

        {/* Password Reset Section */}
        <div className="pt-2 border-t border-slate-200">
          {!showPasswordInput ? (
            <button
              type="button"
              onClick={() => {
                setShowPasswordInput(true);
                setNewPassword(generateRandomPassword());
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Reset User Password</span>
            </button>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Set New Password</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    title="Generate another password"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordInput(false);
                      setNewPassword('');
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Cancel Reset
                  </button>
                </div>
              </div>

              <Input
                type="text"
                icon={Lock}
                placeholder="Enter or generate new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 italic">
                Note: Updating this will immediately set the user's login password.
              </p>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;

