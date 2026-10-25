import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../api/axiosClient';
import Button from '../common/Button';
import CreateSprintModal from './CreateSprintModal';
import { CalendarRange, Play, CheckCircle, Plus, Clock, Target } from 'lucide-react';

const SprintManager = () => {
  const { activeProject, sprints, fetchSprints } = useProject();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStartSprint = async (sprintId) => {
    try {
      setUpdatingId(sprintId);
      await axiosClient.put(`/sprints/${sprintId}/status`, { status: 'Active' });
      addToast('Sprint started! Active board updated.', 'success');
      await fetchSprints(activeProject._id);
    } catch (err) {
      addToast('Failed to start sprint', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      setUpdatingId(sprintId);
      await axiosClient.put(`/sprints/${sprintId}/status`, {
        status: 'Completed',
        rolloverOption: 'backlog'
      });
      addToast('Sprint marked as Completed. Unfinished tickets rolled over to Backlog.', 'info');
      await fetchSprints(activeProject._id);
    } catch (err) {
      addToast('Failed to complete sprint', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-blue-600" />
            <span>Weekly Sprints & Lifecycle</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage sprint cycles, start weekly sprints, and complete sprint goals for {activeProject?.name}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create Sprint
        </Button>
      </div>

      {/* Sprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sprints.map((s) => (
          <div
            key={s._id}
            className={`flex flex-col justify-between bg-white p-5 rounded-xl border transition-all ${
              s.status === 'Active'
                ? 'border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    s.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : s.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600 border border-slate-300'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {s.status}
                </span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">{s.name}</h3>
              {s.goal && (
                <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 mb-4">
                  <Target className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Goal:</strong> {s.goal}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
              {s.status === 'Planned' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  isLoading={updatingId === s._id}
                  onClick={() => handleStartSprint(s._id)}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full"
                >
                  Start Sprint
                </Button>
              )}

              {s.status === 'Active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={CheckCircle}
                  isLoading={updatingId === s._id}
                  onClick={() => handleCompleteSprint(s._id)}
                  className="w-full text-slate-700 hover:bg-slate-200"
                >
                  Complete Sprint
                </Button>
              )}

              {s.status === 'Completed' && (
                <span className="text-xs text-slate-400 italic mx-auto">Sprint Completed</span>
              )}
            </div>
          </div>
        ))}

        {sprints.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center">
            <CalendarRange className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Sprints Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Set up your first 1-week or 2-week sprint to start tracking team deliverables.
            </p>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Create First Sprint
            </Button>
          </div>
        )}
      </div>

      <CreateSprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SprintManager;
