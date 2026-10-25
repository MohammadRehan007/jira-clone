import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../api/axiosClient';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import Avatar from '../common/Avatar';
import { TypeBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import TicketDetailModal from '../ticket/TicketDetailModal';
import CreateTicketModal from '../ticket/CreateTicketModal';
import { ListTodo, Plus, Search, ArrowRight, Layers } from 'lucide-react';

const BacklogView = () => {
  const { activeProject, sprints, fetchTickets, fetchSprints } = useProject();
  const { addToast } = useToast();

  const [backlogTickets, setBacklogTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadBacklog = async () => {
    if (!activeProject) return;
    try {
      setLoading(true);
      const res = await axiosClient.get(`/tickets?project=${activeProject._id}`);
      setBacklogTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBacklog();
  }, [activeProject]);

  const handleMoveToSprint = async (ticketId, sprintId) => {
    try {
      await axiosClient.put(`/tickets/${ticketId}`, {
        sprint: sprintId || null
      });
      addToast(`Ticket destination updated!`, 'success');
      loadBacklog();
    } catch (err) {
      addToast('Failed to update ticket sprint', 'error');
    }
  };

  const filteredTickets = backlogTickets.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.ticketKey.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const unassignedBacklog = filteredTickets.filter((t) => !t.sprint);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-600" />
            <span>Product Backlog & Sprint Planning</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize unassigned issues and drag/assign them into weekly sprints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <Input
              placeholder="Filter backlog..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Create Issue
          </Button>
        </div>
      </div>

      {/* Sprints & Backlog Container */}
      <div className="flex flex-col gap-6">
        {/* Planned & Active Sprints Buckets */}
        {sprints.map((sprint) => {
          const sprintTickets = filteredTickets.filter((t) => t.sprint?._id === sprint._id);
          const totalPoints = sprintTickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

          return (
            <div key={sprint._id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    sprint.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sprint.status}
                  </span>
                  <h3 className="text-base font-bold text-slate-800">{sprint.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    ({sprintTickets.length} issues • {totalPoints} story points)
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {sprintTickets.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTicketId(t._id)}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <TypeBadge type={t.type} />
                      <span className="text-xs font-bold text-slate-500 w-16">{t.ticketKey}</span>
                      <span className="text-sm font-semibold text-slate-800 truncate">{t.title}</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                      <Avatar user={t.assignee} size="xs" />

                      {/* Sprint Switcher Dropdown */}
                      <select
                        value={t.sprint?._id || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleMoveToSprint(t._id, e.target.value)}
                        className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="">Move to Backlog</option>
                        {sprints.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {sprintTickets.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    No issues assigned to this sprint. Select issues from Backlog below to move them here.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Main Product Backlog Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-600" />
              <span>Product Backlog</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold ml-2">
                {unassignedBacklog.length} Issues
              </span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {unassignedBacklog.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTicketId(t._id)}
                className="flex items-center justify-between p-3.5 hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <TypeBadge type={t.type} />
                  <span className="text-xs font-bold text-slate-500 w-16">{t.ticketKey}</span>
                  <span className="text-sm font-semibold text-slate-800 truncate">{t.title}</span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                  <Avatar user={t.assignee} size="xs" />

                  {/* Assign to Sprint */}
                  <select
                    value=""
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleMoveToSprint(t._id, e.target.value)}
                    className="text-xs bg-blue-50 text-blue-700 font-semibold border border-blue-200 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="" disabled>
                      + Add to Sprint
                    </option>
                    {sprints.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {unassignedBacklog.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                Backlog is currently empty! Create new issues or clear filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onUpdate={loadBacklog}
        />
      )}

      <CreateTicketModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default BacklogView;
