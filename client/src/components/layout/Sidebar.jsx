import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { 
  Kanban, 
  ListTodo, 
  CalendarRange, 
  BarChart3, 
  FolderKanban,
  Clock,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { activeProject, activeSprint } = useProject();

  const navItems = [
    {
      name: 'Kanban Board',
      path: '/board',
      icon: Kanban,
      badge: activeSprint ? activeSprint.name : 'No Active Sprint'
    },
    {
      name: 'Backlog',
      path: '/backlog',
      icon: ListTodo
    },
    {
      name: 'Weekly Sprints',
      path: '/sprints',
      icon: CalendarRange
    },
    {
      name: 'Analytics Dashboard',
      path: '/dashboard',
      icon: BarChart3
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)]">
      {/* Active Project Card */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-bold text-slate-100 truncate">
              {activeProject ? activeProject.name : 'Select Project'}
            </h2>
            <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
              {activeProject ? `Key: ${activeProject.key}` : 'Software Project'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Planning & Execution
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 truncate max-w-[90px]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Active Sprint Live Banner */}
      {activeSprint && (
        <div className="m-3 p-3 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Active Sprint</span>
          </div>
          <p className="font-semibold text-slate-200 truncate">{activeSprint.name}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Ends: {new Date(activeSprint.endDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* System Footer info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Jira Engine v1.0
        </span>
        <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-mono">
          MONGODB
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
