import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { fetchProjects, setActiveProject } = useProject();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !key) {
      addToast('Project Name and Key are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/projects', {
        name,
        key: key.toUpperCase(),
        description
      });

      addToast(`Project '${res.data.name}' created successfully!`, 'success');
      await fetchProjects();
      setActiveProject(res.data);
      setName('');
      setKey('');
      setDescription('');
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      subtitle="Set up a workspace for your team tickets & sprints"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
            Create Project
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Project Name *"
          placeholder="e.g. Mobile Application Dev"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!key && e.target.value) {
              setKey(e.target.value.substring(0, 3).toUpperCase());
            }
          }}
          required
        />
        <Input
          label="Project Key (Short Prefix) *"
          placeholder="e.g. MOB"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          maxLength={6}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full rounded border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Brief description of project goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
