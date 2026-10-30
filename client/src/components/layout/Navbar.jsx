import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { Plus, Search, LogOut, ChevronDown, Layers, CheckSquare, Sparkles, BookOpen } from 'lucide-react';
import CreateTicketModal from '../ticket/CreateTicketModal';
import CreateProjectModal from './CreateProjectModal';
import AddUserModal from './AddUserModal';
import ProfileModal from './ProfileModal';
import WorkflowGuidelinesModal from './WorkflowGuidelinesModal';
import { UserPlus, Camera } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { projects, activeProject, setActiveProject, projectsLoading, dataLoading } = useProject();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Auto-display guidelines popup on login when user is Developer or Tester
  useEffect(() => {
    if (user && (user.role === 'Developer' || user.role === 'Tester')) {
      const seen = sessionStorage.getItem(`jira_guidelines_seen_${user._id}`);
      if (!seen) {
        setIsGuidelinesModalOpen(true);
      }
    }
  }, [user]);

  const handleCloseGuidelines = () => {
    if (user?._id) {
      sessionStorage.setItem(`jira_guidelines_seen_${user._id}`, 'true');
    }
    setIsGuidelinesModalOpen(false);
  };

  return (
    <>
      <header className="h-14 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 sticky top-0 z-40 shadow-md">
        {/* Left Section: Logo & Project Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-black text-lg tracking-tight text-white">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline">Jira Engine</span>
          </div>

          {/* Project Switcher */}
          <div className="relative flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
            <Layers className="w-4 h-4 text-blue-400" />
            <select
              value={activeProject?._id || ''}
              onChange={(e) => {
                const found = projects.find((p) => p._id === e.target.value);
                if (found) setActiveProject(found);
              }}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer pr-4"
            >
              {projects.length === 0 ? (
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  {projectsLoading ? 'Loading projects...' : 'No projects found'}
                </option>
              ) : (
                projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-slate-900 text-slate-200">
                    {p.name} ({p.key})
                  </option>
                ))
              )}
            </select>
            {dataLoading && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping mr-1" title="Syncing project data..." />
            )}
            {(user?.role === 'Admin' || user?.role === 'ProjectLead') && (
              <button
                onClick={() => setIsProjectModalOpen(true)}
                title="Create New Project"
                className="text-xs text-blue-400 hover:text-blue-300 font-bold ml-1 border-l border-slate-700 pl-2"
              >
                + New
              </button>
            )}
          </div>
        </div>

        {/* Center: Search & Create Ticket & Guidelines */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGuidelinesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500/35 hover:to-purple-500/35 border border-indigo-400/30 text-indigo-200 hover:text-white text-xs font-bold transition-all shadow-xs"
            title="View Developer & Tester Workflow Guidelines"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Workflow Guidelines</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsTicketModalOpen(true)}
            className="shadow-md font-semibold"
          >
            Create Ticket
          </Button>

          {(user?.role === 'Admin' || user?.role === 'ProjectLead') && (
            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              onClick={() => setIsUserModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
            >
              Add Member
            </Button>
          )}
        </div>

        {/* Right Section: User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Avatar user={user} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</span>
                <RoleBadge role={user?.role} />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 text-slate-800 z-50 animate-scale-up">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1">
                    <RoleBadge role={user?.role} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors border-b border-slate-100"
                >
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span>Profile & Photo</span>
                </button>

                {(user?.role === 'Admin' || user?.role === 'ProjectLead') && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsUserModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors border-b border-slate-100"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>Add Team Member</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsGuidelinesModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 transition-colors border-b border-slate-100"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Workflow Guidelines</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Ticket Modal */}
      <CreateTicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
      {/* Project Modal */}
      <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      {/* Add User Modal */}
      <AddUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
      {/* Profile & Avatar Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      {/* Workflow Guidelines Modal (auto-shows on Developer/Tester login) */}
      <WorkflowGuidelinesModal
        isOpen={isGuidelinesModalOpen}
        onClose={handleCloseGuidelines}
        user={user}
      />
    </>
  );
};

export default Navbar;
