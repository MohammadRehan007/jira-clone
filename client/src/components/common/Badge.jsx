import React from 'react';
import { 
  Bug, 
  CheckSquare, 
  Bookmark, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  AlertOctagon 
} from 'lucide-react';

export const TypeBadge = ({ type }) => {
  const configs = {
    Bug: { icon: Bug, color: 'bg-rose-500 text-white', label: 'Bug' },
    Story: { icon: Bookmark, color: 'bg-emerald-600 text-white', label: 'Story' },
    Task: { icon: CheckSquare, color: 'bg-blue-600 text-white', label: 'Task' },
    Epic: { icon: Zap, color: 'bg-purple-600 text-white', label: 'Epic' }
  };

  const item = configs[type] || configs.Task;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${item.color}`}>
      <Icon className="w-3 h-3" />
      <span>{item.label}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const configs = {
    Highest: { icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    High: { icon: ArrowUp, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    Medium: { icon: Minus, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    Low: { icon: ArrowDown, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    Lowest: { icon: ArrowDown, color: 'text-slate-500 bg-slate-50 border-slate-200' }
  };

  const item = configs[priority] || configs.Medium;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${item.color}`}>
      <Icon className="w-3 h-3" />
      <span>{priority}</span>
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const configs = {
    'To Do': 'bg-slate-100 text-slate-700 border-slate-300',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-300',
    'In Review': 'bg-purple-50 text-purple-700 border-purple-300',
    'Testing': 'bg-amber-50 text-amber-800 border-amber-300',
    'Done': 'bg-emerald-50 text-emerald-700 border-emerald-300'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${configs[status] || configs['To Do']}`}>
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const configs = {
    Admin: 'bg-purple-100 text-purple-800 border-purple-200',
    ProjectLead: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Developer: 'bg-blue-100 text-blue-800 border-blue-200',
    Tester: 'bg-amber-100 text-amber-800 border-amber-200',
    Viewer: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${configs[role] || configs.Developer}`}>
      {role}
    </span>
  );
};
