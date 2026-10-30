import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { BarChart3, CheckCircle2, Clock, Bug, CheckSquare, AlertTriangle, Users, Trash2, Pencil } from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EditUserModal from '../layout/EditUserModal';

const AnalyticsDashboard = () => {
  const { activeProject, activeSprint, tickets, users, dataLoading } = useProject();
  const { user: currentUser } = useAuth();
  
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openDeleteModal = (targetUser) => {
    setSelectedUserForDelete(targetUser);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (targetUser) => {
    setSelectedUserForEdit(targetUser);
    setIsEditModalOpen(true);
  };

  const totalTickets = tickets.length;
  const doneTickets = tickets.filter((t) => t.status === 'Done').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'In Progress' || t.status === 'In Review').length;
  const testingTickets = tickets.filter((t) => t.status === 'Testing').length;
  const toDoTickets = tickets.filter((t) => t.status === 'To Do').length;

  const bugsCount = tickets.filter((t) => t.type === 'Bug').length;
  const storiesCount = tickets.filter((t) => t.type === 'Story').length;
  const tasksCount = tickets.filter((t) => t.type === 'Task').length;
  const highestPriorityCount = tickets.filter((t) => t.priority === 'Highest' || t.priority === 'High').length;

  const completionPercent = totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Sprint Velocity & Analytics Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metric breakdown for {activeProject?.name} ({activeSprint ? activeSprint.name : 'All Sprints'})
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-blue-600">{completionPercent}%</span>
          <span className="text-xs font-semibold text-slate-500 block uppercase">Completed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Sprint Completion Progress</span>
          <span>{doneTickets} of {totalTickets} Issues Closed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
          <div style={{ width: `${(doneTickets / (totalTickets || 1)) * 100}%` }} className="bg-emerald-500 transition-all duration-500" title="Done" />
          <div style={{ width: `${(testingTickets / (totalTickets || 1)) * 100}%` }} className="bg-amber-500 transition-all duration-500" title="Testing" />
          <div style={{ width: `${(inProgressTickets / (totalTickets || 1)) * 100}%` }} className="bg-blue-500 transition-all duration-500" title="In Progress" />
          <div style={{ width: `${(toDoTickets / (totalTickets || 1)) * 100}%` }} className="bg-slate-300 transition-all duration-500" title="To Do" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Done</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{doneTickets}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">In Progress</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{inProgressTickets}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Bugs Reported</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{bugsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">High Priority</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{highestPriorityCount}</h3>
          </div>
        </div>
      </div>

      {/* Team Workload Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Developer & Tester Workload Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Team Member</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Assigned Tickets</th>
                <th className="p-3.5">Workload Status</th>
                {currentUser?.role === 'Admin' && (
                  <th className="p-3.5 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const assignedCount = tickets.filter((t) => t.assignee?._id === u._id).length;
                return (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                      <Avatar user={u} size="xs" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-3.5 text-slate-600">{u.department}</td>
                    <td className="p-3.5 font-bold text-slate-800">{assignedCount} issues</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        assignedCount > 4
                          ? 'bg-rose-100 text-rose-800'
                          : assignedCount > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {assignedCount > 4 ? 'High Load' : assignedCount > 0 ? 'Active' : 'Available'}
                      </span>
                    </td>
                    {currentUser?.role === 'Admin' && (
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold transition-colors border border-blue-200 flex items-center gap-1 cursor-pointer text-xs"
                            title="Edit User"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {u._id !== currentUser._id ? (
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold transition-colors border border-rose-200 flex items-center gap-1 cursor-pointer text-xs"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic px-1">(You)</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        userToEdit={selectedUserForEdit}
      />

      {/* Custom Reusable Delete User Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }}
        userToDelete={selectedUserForDelete}
      />
    </div>
  );
};

export default AnalyticsDashboard;
