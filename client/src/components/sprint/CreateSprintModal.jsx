import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

const CreateSprintModal = ({ isOpen, onClose }) => {
  const { activeProject, refreshProjectData } = useProject();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      addToast('Sprint name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      await axiosClient.post('/sprints', {
        name,
        goal,
        project: activeProject._id,
        durationWeeks: parseInt(durationWeeks)
      });

      addToast(`Sprint '${name}' created!`, 'success');
      await refreshProjectData();
      setName('');
      setGoal('');
      onClose();
    } catch (err) {
      addToast('Failed to create sprint', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Weekly Sprint"
      subtitle={`Project: ${activeProject?.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
            Create Sprint
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Sprint Name *"
          placeholder="e.g. Sprint 2 - Feature Rollout"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Sprint Duration"
          value={durationWeeks}
          onChange={(e) => setDurationWeeks(e.target.value)}
          options={[
            { value: '1', label: '1 Week (Weekly Sprint)' },
            { value: '2', label: '2 Weeks (Standard Sprint)' },
            { value: '3', label: '3 Weeks' },
            { value: '4', label: '4 Weeks' }
          ]}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Sprint Goal / Target Deliverable
          </label>
          <textarea
            rows={3}
            className="w-full rounded border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="What does the team aim to accomplish in this sprint?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateSprintModal;
