import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import ImageUpload from '../common/ImageUpload';
import { TypeBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import CommentSection from './CommentSection';
import ConfirmModal from '../common/ConfirmModal';
import { Clock, History, Save, Trash2, Paperclip } from 'lucide-react';

const TicketDetailModal = ({ ticketId, onClose, onUpdate }) => {
  const { users, sprints, fetchTickets, activeProject } = useProject();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form editable states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [sprint, setSprint] = useState('');
  const [storyPoints, setStoryPoints] = useState(1);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/tickets/${ticketId}`);
      const t = res.data.ticket;
      setTicket(t);
      setActivities(res.data.activities || []);
      setAttachments(t.attachments || []);

      setTitle(t.title);
      setDescription(t.description || '');
      setStatus(t.status);
      setPriority(t.priority);
      setAssignee(t.assignee?._id || '');
      setSprint(t.sprint?._id || '');
      setStoryPoints(t.storyPoints || 1);
    } catch (err) {
      addToast('Failed to load ticket details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentUploaded = async (file) => {
    try {
      await axiosClient.post(`/tickets/${ticketId}/attachments`, { attachment: file });
      addToast('Attachment added to issue!', 'success');
      fetchTicketDetails();
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachmentRemove = async (index, att) => {
    if (att._id) {
      try {
        await axiosClient.delete(`/tickets/${ticketId}/attachments/${att._id}`);
        addToast('Attachment removed', 'info');
        fetchTicketDetails();
        onUpdate();
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete attachment', 'error');
      }
    } else {
      setAttachments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axiosClient.put(`/tickets/${ticketId}`, {
        title,
        description,
        status,
        priority,
        assignee: assignee || null,
        sprint: sprint || null,
        storyPoints: parseInt(storyPoints) || 1,
        attachments
      });

      addToast(`Ticket ${res.data.ticketKey} updated! Email notification dispatched if status/assignee changed.`, 'success');
      onUpdate();
      fetchTicketDetails();
    } catch (err) {
      addToast('Failed to save ticket updates', 'error');
    } finally {
      setSaving(false);
    }
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await axiosClient.delete(`/tickets/${ticketId}`);
      addToast(`Ticket ${ticket?.ticketKey} deleted successfully`, 'info');
      onUpdate();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete ticket', 'error');
    } finally {
      setDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  if (loading || !ticket) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Loading Issue Details...">
        <div className="flex items-center justify-center p-12 text-slate-400">
          Loading ticket contents...
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <TypeBadge type={ticket.type} />
          <span className="text-slate-600 font-bold text-base">{ticket.ticketKey}</span>
        </div>
      }
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setIsConfirmDeleteOpen(true)}>
            Delete Issue
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Save} isLoading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (Left 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Input
            label="Issue Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Add issue description..."
            />
          </div>

          {/* Attachments Section */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" /> Attachments & Screenshots ({attachments.length})
            </h4>
            <ImageUpload
              attachments={attachments}
              onChange={(updated) => setAttachments(updated)}
              onUploaded={handleAttachmentUploaded}
              folder="jira-clone/attachments"
              maxFiles={8}
            />
          </div>

          {/* Activity Log Feed */}
          {activities.length > 0 && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" /> Recent Activity Log
              </h4>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                {activities.slice(0, 5).map((act) => (
                  <div key={act._id} className="text-xs text-slate-600 bg-slate-50 p-2 rounded flex justify-between">
                    <span><strong>{act.user?.name || 'User'}</strong>: {act.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(act.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <CommentSection ticketId={ticket._id} />
        </div>

        {/* Sidebar Column (Right 1 col) */}
        <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Issue Attributes</h4>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'To Do', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'In Review', label: 'In Review' },
              { value: 'Testing', label: 'Testing' },
              { value: 'Done', label: 'Done' }
            ]}
          />

          <Select
            label="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Unassigned"
            options={users.map((u) => ({
              value: u._id,
              label: `${u.name} — ${u.email} (${u.role})`
            }))}
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

          <Select
            label="Sprint"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            placeholder="Product Backlog"
            options={sprints.map((s) => ({
              value: s._id,
              label: `${s.name} (${s.status})`
            }))}
          />

          <Input
            label="Story Points"
            type="number"
            value={storyPoints}
            onChange={(e) => setStoryPoints(e.target.value)}
          />

          <div className="border-t border-slate-200 pt-3 text-xs text-slate-500 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>Reporter:</span>
              <span className="font-semibold text-slate-700">{ticket.reporter?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created:</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Alert Modal (replaces browser confirm popups) */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete Ticket ${ticket?.ticketKey}?`}
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmText="Delete Issue"
        variant="danger"
        isLoading={deleting}
      />
    </Modal>
  );
};

export default TicketDetailModal;
