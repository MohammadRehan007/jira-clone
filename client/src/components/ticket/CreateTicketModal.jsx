import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

const CreateTicketModal = ({ isOpen, onClose }) => {
  const { activeProject, sprints, users, refreshProjectData } = useProject();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Task');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [sprint, setSprint] = useState('');
  const [storyPoints, setStoryPoints] = useState(3);
  const [tagsInput, setTagsInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      addToast('Ticket title is required', 'error');
      return;
    }
    if (!activeProject) {
      addToast('Please select a project first', 'error');
      return;
    }

    try {
      setLoading(true);
      const tags = tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [];

      const res = await axiosClient.post('/tickets', {
        title,
        description,
        type,
        priority,
        project: activeProject._id,
        sprint: sprint || null,
        assignee: assignee || null,
        storyPoints: parseInt(storyPoints) || 1,
        tags,
        attachments
      });

      addToast(`Ticket '${res.data.ticketKey}' created! Email notification dispatched.`, 'success');
      await refreshProjectData();
      
      // Reset
      setTitle('');
      setDescription('');
      setType('Task');
      setPriority('Medium');
      setAssignee('');
      setSprint('');
      setTagsInput('');
      setAttachments([]);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Ticket"
      subtitle={`Project: ${activeProject?.name || 'None'}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
            Create Issue
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Issue Title *"
          placeholder="e.g. Implement OAuth login flow"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Issue Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'Task', label: 'Task' },
              { value: 'Bug', label: 'Bug' },
              { value: 'Story', label: 'Story' },
              { value: 'Epic', label: 'Epic' }
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'Highest', label: 'Highest' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
              { value: 'Lowest', label: 'Lowest' }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assignee (Developer / Tester)"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Unassigned"
            options={users.map((u) => ({
              value: u._id,
              label: `${u.name} — ${u.email} (${u.role})`
            }))}
          />

          <Select
            label="Sprint Destination"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            placeholder="Product Backlog (No Sprint)"
            options={sprints.map((s) => ({
              value: s._id,
              label: `${s.name} (${s.status})`
            }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Story Points (Estimate)"
            type="number"
            min={1}
            max={21}
            value={storyPoints}
            onChange={(e) => setStoryPoints(e.target.value)}
          />

          <Input
            label="Tags (Comma Separated)"
            placeholder="frontend, auth, priority"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Description & Acceptance Criteria
          </label>
          <textarea
            rows={4}
            className="w-full rounded border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Detailed description of the task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Attachments Section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Image Attachments (Cloudinary)
          </label>
          <ImageUpload
            attachments={attachments}
            onChange={setAttachments}
            folder="jira-clone/attachments"
            maxFiles={5}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateTicketModal;
