import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Lock, Building, RefreshCw, Send } from 'lucide-react';

const generateClientPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

const AddUserModal = ({ isOpen, onClose }) => {
  const { fetchUsers } = useProject();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [department, setDepartment] = useState('Engineering');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword(generateClientPassword());
    }
  }, [isOpen]);

  const handleRegeneratePassword = () => {
    setPassword(generateClientPassword());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      addToast('Name and Email are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/users', {
        name,
        email,
        password,
        role,
        department
      });

      addToast(`User '${res.data.name}' (${res.data.role}) created! Credentials sent to ${email}`, 'success');
      await fetchUsers();
      
      setName('');
      setEmail('');
      setPassword(generateClientPassword());
      setRole('Developer');
      setDepartment('Engineering');
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add team member', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Team Member"
      subtitle="Only Admins & Project Leads can provision user accounts"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
            Create Account & Send Email
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name *"
          icon={User}
          placeholder="e.g. Michael Scott"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          icon={Mail}
          placeholder="e.g. michael@jira.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Auto-Generated Password *
            </label>
            <button
              type="button"
              onClick={handleRegeneratePassword}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          </div>
          <Input
            type="text"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
            <Send className="w-3 h-3" /> This password will be automatically emailed to {email || 'the user'}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assigned Role *"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'Developer', label: 'Developer' },
              { value: 'Tester', label: 'Tester (QA)' },
              { value: 'ProjectLead', label: 'Project Lead' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Viewer', label: 'Viewer' }
            ]}
          />

          <Input
            label="Department"
            icon={Building}
            placeholder="e.g. QA & Testing"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
