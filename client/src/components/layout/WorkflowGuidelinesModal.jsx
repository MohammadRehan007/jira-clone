import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Video, 
  MessageSquare, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  ListChecks, 
  Code2, 
  CheckSquare, 
  Send, 
  Flame, 
  UserCheck, 
  Play, 
  RotateCcw, 
  HelpCircle,
  FileCheck,
  AtSign
} from 'lucide-react';

const WorkflowGuidelinesModal = ({ isOpen, onClose, user }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in">
      <div 
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colorful Gradient Header */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 px-6 py-5 text-white shrink-0 shadow-md">
          {/* Decorative background glow circles */}
          <div className="absolute top-0 right-1/4 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/30 flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  Standard Operating Procedures
                </span>
                {user && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-900 flex items-center gap-1 shadow-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    Role: {user.role} ({user.name})
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Ticketing System – Developer & Tester Workflow Guidelines
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium max-w-2xl">
                Please review these guidelines carefully to ensure proper ownership, rigorous QA verification, clear communication, and seamless sprint execution.
              </p>
            </div>

            {/* Close Button Top Right */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-105 active:scale-95 shrink-0 border border-white/20 shadow-sm"
              title="Close Guidelines"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 text-slate-800 bg-slate-50/50">

          {/* Section 1: Ticket Creation and Assignment */}
          <section className="bg-white rounded-xl p-5 border border-indigo-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-indigo-50">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Ticket Creation and Assignment</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Ownership First
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Every issue must have clarity and assigned responsibility</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-indigo-950 font-bold block mb-0.5">Universal Creation</strong>
                  Anyone can create a ticket, whether they are a <strong>Developer</strong> or a <strong>Tester</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-indigo-950 font-bold block mb-0.5">Relevant Assignment</strong>
                  Every ticket must be assigned to the <strong>relevant Developer or Tester</strong> responsible for handling it.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-indigo-950 font-bold block mb-0.5">Verify Before Starting</strong>
                  Ensure that the correct team member is assigned <strong>before starting any work</strong>.
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Ticket Status Workflow */}
          <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Ticket Status Workflow</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    5-Stage Progression
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Step-by-step lifecycle from initial development to QA closure</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Step 1: In Progress */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-blue-50/70 border-2 border-blue-200 hover:border-blue-400 transition-colors shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                      Step 1
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  </div>
                  <h4 className="text-sm font-black text-blue-950 mb-1.5 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-blue-600" />
                    In Progress
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• Move status to <strong>In Progress</strong> when starting work.</li>
                    <li>• Assigned member is responsible for keeping status updated.</li>
                  </ul>
                </div>
              </div>

              {/* Step 2: In Review */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-purple-50/70 border-2 border-purple-200 hover:border-purple-400 transition-colors shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white">
                      Step 2
                    </span>
                    <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-black text-purple-950 mb-1.5 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                    In Review
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• Move to <strong>In Review</strong> once implementation is complete.</li>
                    <li>• Developer must <strong>reassign to Tester</strong> for verification.</li>
                    <li>• Include implementation notes in comments.</li>
                  </ul>
                </div>
              </div>

              {/* Step 3: In Testing */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-amber-50/70 border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white">
                      Step 3
                    </span>
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="text-sm font-black text-amber-950 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    In Testing
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• Tester moves ticket to <strong>In Testing</strong> upon starting QA.</li>
                    <li>• Test thoroughly against all expected requirements and edge cases.</li>
                  </ul>
                </div>
              </div>

              {/* Step 4: Testing Failed */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-rose-50/80 border-2 border-rose-300 hover:border-rose-400 transition-colors shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                      Step 4 (Fail)
                    </span>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <h4 className="text-sm font-black text-rose-950 mb-1.5 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    Testing Failed
                  </h4>
                  <ul className="text-[11px] text-rose-900 space-y-1 leading-relaxed">
                    <li>1. Move back to <strong>In Progress</strong>.</li>
                    <li>2. Reassign to <strong>Developer</strong>.</li>
                    <li>3. Add comment with reproduction steps.</li>
                    <li>4. <strong>Attach video link</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Step 5: Testing Passed */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-emerald-50/80 border-2 border-emerald-300 hover:border-emerald-400 transition-colors shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                      Step 5 (Pass)
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-black text-emerald-950 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Testing Passed
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• If testing passes, Tester moves ticket to <strong>Done</strong> / <strong>Completed</strong>.</li>
                    <li>• Goal accomplished for current sprint.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Mandatory Commenting and Mentions */}
          <section className="bg-white rounded-xl p-5 border border-sky-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-sky-50">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Mandatory Commenting and Mentions</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    Always Tag Colleagues
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Keep discussion transparent, contextual, and auditable</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <AtSign className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>Every ticket has a comment box for direct communication between Developers and Testers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AtSign className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>Whenever you post a comment directed at another member, you <strong>must mention/tag the relevant Developer or Tester</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AtSign className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>Use mentions to ask questions, report issues, request clarification, or communicate updates.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-amber-800 font-semibold">Avoid leaving comments that require someone's attention without tagging the responsible person.</span>
                </div>
              </div>

              {/* Styled Example Box */}
              <div className="bg-slate-900 rounded-xl p-4 text-slate-200 shadow-sm border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 font-bold text-sky-400">
                    <MessageSquare className="w-3.5 h-3.5" /> Required Comment Format Example
                  </span>
                  <span>Ticket #TC-104</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-lg text-xs font-mono leading-relaxed text-slate-200">
                  <span className="text-blue-400 font-bold bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                    @DeveloperName
                  </span>
                  {", the login API is returning a 500 error when invalid credentials are submitted. Please check and fix this issue."}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  ✓ The recipient receives an instant email notification and mention alert.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Mandatory Testing Videos */}
          <section className="bg-white rounded-xl p-5 border border-pink-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-pink-50">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Mandatory Testing Videos</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                    Video Proof (e.g. Loom)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Record and share video demonstrations for rapid bug resolution</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-xl p-4 border border-pink-200/70">
              <p className="text-xs text-slate-700 font-medium mb-3">
                Testers must record and provide a video demonstrating their testing whenever applicable or required by the ticket. Tools like <strong className="text-pink-600 font-bold">Loom</strong> can be used.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-pink-600 uppercase">Step A</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1">1. Record & copy video link</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-pink-600 uppercase">Step B</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1">2. Open the relevant ticket</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-pink-600 uppercase">Step C</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1">3. Paste link in comment box</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-pink-600 uppercase">Step D</span>
                  <span className="text-xs font-semibold text-slate-800 mt-1">4. Mention the Developer</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-pink-900 bg-white/70 p-2.5 rounded-lg border border-pink-200">
                <Video className="w-4 h-4 text-pink-600 shrink-0" />
                <span>The video should clearly demonstrate the <strong>issue</strong>, the <strong>steps performed</strong>, and the <strong>actual result</strong>.</span>
              </div>
            </div>
          </section>

          {/* Section 5: Responsibilities */}
          <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Role Responsibilities</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Clear Division of Labor
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Know exactly what is expected of your role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Developers Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-200">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-blue-950 uppercase tracking-wider">
                    Developers
                  </h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Update ticket statuses when starting and completing work.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Move completed development tasks to <strong>In Review</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Assign tickets to the relevant <strong>Tester</strong> for testing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Review failed test cases and fix reported issues promptly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Respond to comments and questions by <strong>mentioning the relevant team member</strong>.</span>
                  </li>
                </ul>
              </div>

              {/* Testers Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border-2 border-emerald-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                    Testers
                  </h4>
                </div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Start testing by moving the ticket to <strong>In Testing</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Test the functionality thoroughly against requirements.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Record and share testing videos when required.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Report failed test cases with clear explanations and reproduction steps.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Reassign failed tickets to the Developer and move to <strong>In Progress</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Mention the relevant team member in every comment requiring attention.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Important Rules */}
          <section className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-xl p-5 border-2 border-amber-300 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-amber-200">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
                  <span>6. Important Rules to Always Follow</span>
                </h3>
                <p className="text-xs text-amber-800">Critical rules for team integrity and sprint velocity</p>
              </div>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-800">
              <li className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Every ticket must have the <strong>correct assignee</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span><strong>Always update ticket status</strong> when moving to another stage.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Developers must assign completed development tickets to the <strong>relevant Tester</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
                <span>Failed testing must result in reassignment to the relevant Developer and a status change to <strong>In Progress</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
                <span>Testing videos must be shared through ticket comments whenever required.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center justify-center shrink-0">6</span>
                <span><strong>Always tag the relevant Developer or Tester in comments directed at them.</strong></span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-lg border border-amber-200 col-span-1 md:col-span-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold text-[11px] flex items-center justify-center shrink-0">7</span>
                <span>Keep all ticket-related communication within the ticket's comment section so discussion and history remain accessible to the team.</span>
              </li>
            </ol>
          </section>

          {/* Inspirational summary block */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center shadow-sm">
            <p className="text-xs sm:text-sm font-semibold tracking-wide">
              🌟 Following these guidelines will ensure a clear workflow, proper ownership, effective communication, and a smoother development and testing process.
            </p>
          </div>
        </div>

        {/* Footer with Close Option */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You can re-open these guidelines anytime from the top navigation bar.</span>
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Understand & Accept Guidelines</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowGuidelinesModal;

