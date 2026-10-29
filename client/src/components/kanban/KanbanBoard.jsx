import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../api/axiosClient';
import KanbanColumn from './KanbanColumn';
import TicketDetailModal from '../ticket/TicketDetailModal';
import Input from '../common/Input';
import Select from '../common/Select';
import Avatar from '../common/Avatar';
import { Search, Filter, RefreshCw, CalendarRange } from 'lucide-react';

const COLUMNS = [
  { status: 'To Do', title: 'To Do', color: 'bg-slate-400' },
  { status: 'In Progress', title: 'In Progress', color: 'bg-blue-500' },
  { status: 'In Review', title: 'In Review', color: 'bg-purple-500' },
  { status: 'Testing', title: 'Testing', color: 'bg-amber-500' },
  { status: 'Done', title: 'Done', color: 'bg-emerald-500' }
];

const KanbanBoard = () => {
  const { 
    activeProject, 
    activeSprint, 
    tickets, 
    setTickets, 
    refreshProjectData, 
    dataLoading, 
    users 
  } = useProject();
  const { addToast } = useToast();
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Scoped to active sprint if one exists; otherwise shows all project tickets
  const sprintTickets = activeSprint
    ? tickets.filter((t) => (t.sprint?._id || t.sprint) === activeSprint._id)
    : tickets;

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Optimistic UI Update
    const updatedTickets = tickets.map((t) => {
      if (t._id === draggableId) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    setTickets(updatedTickets);

    try {
      await axiosClient.put(`/tickets/${draggableId}/status`, { status: newStatus });
      addToast(`Moved ticket status to '${newStatus}'. Email notification sent!`, 'success');
    } catch (err) {
      addToast('Failed to update ticket status', 'error');
      refreshProjectData();
    }
  };

  // Filter tickets
  const filteredTickets = sprintTickets.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchKey = t.ticketKey?.toLowerCase().includes(q);
      const matchEmail = t.assignee?.email?.toLowerCase().includes(q);
      const matchName = t.assignee?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchKey && !matchEmail && !matchName) return false;
    }
    if (assigneeFilter && (t.assignee?._id || t.assignee) !== assigneeFilter) return false;
    if (typeFilter && t.type !== typeFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">
              {activeSprint ? activeSprint.name : 'Active Board (All Tickets)'}
            </h1>
            {activeSprint && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                <CalendarRange className="w-3.5 h-3.5" /> Active Sprint
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeProject ? `${activeProject.name} (${activeProject.key})` : 'Select a project'} • {filteredTickets.length} issues
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="w-48">
            <Input
              placeholder="Search issues..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* User Quick Avatars filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setAssigneeFilter('')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                !assigneeFilter ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => setAssigneeFilter(assigneeFilter === u._id ? '' : u._id)}
                className={`p-0.5 rounded-full transition-transform ${
                  assigneeFilter === u._id ? 'ring-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title={`Filter by ${u.name}`}
              >
                <Avatar user={u} size="xs" />
              </button>
            ))}
          </div>

          <div className="w-32">
            <Select
              placeholder="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'Bug', label: 'Bug' },
                { value: 'Story', label: 'Story' },
                { value: 'Task', label: 'Task' },
                { value: 'Epic', label: 'Epic' }
              ]}
            />
          </div>

          <button
            onClick={() => refreshProjectData()}
            className={`p-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors ${
              dataLoading ? 'opacity-70' : ''
            }`}
            title="Refresh Board"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Drag & Drop Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
          {COLUMNS.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tickets={colTickets}
                colorHeader={col.color}
                isLoading={dataLoading && sprintTickets.length === 0}
                onCardClick={(t) => setSelectedTicket(t)}
              />
            );
          })}
        </div>
      </DragDropContext>

      {/* Ticket Detail Drawer Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticketId={selectedTicket._id}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => refreshProjectData()}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
