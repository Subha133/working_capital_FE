import React, { useState, useEffect } from 'react';
import CycleControl from './components/CycleControl';
import CycleStatus from './components/CycleStatus';
import ApprovalQueue from './components/ApprovalQueue';
import OutcomesSummary from './components/OutcomesSummary';
import DataUpload from './components/DataUpload';
import WorkingCapitalOverview from './components/WorkingCapitalOverview';
import ChatPanel from './components/ChatPanel';
import { getCycle } from './api';
import {
  Database,
  Zap,
  RefreshCw,
  LayoutDashboard,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Activity,
  MessageSquare
} from 'lucide-react';

function App() {
  const [threadId, setThreadId] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'upload' | 'chat'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Lifted form state
  const [cycleDate, setCycleDate] = useState('2026-09-19');
  const [cashUsd, setCashUsd] = useState('1000000');
  const [overrideDq, setOverrideDq] = useState(false);

  useEffect(() => {
    let interval;
    if (isPolling && threadId) {
      interval = setInterval(async () => {
        try {
          const data = await getCycle(threadId);
          setCycleData(data);
          // Stop polling if complete or halted without pending approvals
          if ((data.status === 'complete' || data.status === 'halted') && !data.pending_approval) {
            setIsPolling(false);
          }
        } catch (error) {
          console.error("Failed to poll cycle data", error);
          setIsPolling(false);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPolling, threadId]);

  const handleCycleStarted = async (newThreadId) => {
    setThreadId(newThreadId);
    try {
      const data = await getCycle(newThreadId);
      setCycleData(data);
      if (data.status !== 'complete' && data.status !== 'halted') {
        setIsPolling(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovalComplete = () => {
    // Resume polling to get next state
    setIsPolling(true);
  };

  const handleRefresh = async () => {
    if (threadId) {
      try {
        const data = await getCycle(threadId);
        setCycleData(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const hasPendingApproval = cycleData?.status === 'pending_approval' && cycleData?.pending_approval;

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-100/70 text-slate-900'} selection:bg-blue-500/30 overflow-hidden transition-colors duration-300`}>
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside
        className={`flex flex-col justify-between transition-all duration-300 ease-in-out z-30 relative shrink-0 ${
          isSidebarCollapsed ? 'w-[90px]' : 'w-64'
        } ${theme === 'dark' ? 'bg-slate-900/90 border-r border-slate-800' : 'bg-white/95 border-r border-slate-200 shadow-sm'}`}
      >
        <div className="flex flex-col">
          {/* Logo / Header Area */}
          <div className={`h-16 px-3 flex items-center justify-between border-b w-full shrink-0 ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}>
            {/* DB Icon & Text Container */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0 flex items-center justify-center">
                <Database size={20} className="text-white shrink-0" />
              </div>

              {!isSidebarCollapsed && (
                <div className="whitespace-nowrap min-w-0 flex-1 overflow-hidden transition-opacity duration-200">
                  <h1 className="text-sm font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 bg-clip-text text-transparent truncate">
                    Working Capital
                  </h1>
                  <p className={`text-[10px] uppercase tracking-wider truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Treasury Agent</p>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 rounded-lg border shrink-0 ml-1 transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 border-slate-700/50' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2">
            {/* 1st: Data Upload & Integration Tab */}
            <div className="relative group">
              <button
                onClick={() => setActiveSection('upload')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeSection === 'upload'
                    ? (theme === 'dark' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm' : 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm')
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <UploadCloud size={20} className="shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">Data Upload & Ingestion</span>
                )}
              </button>

              {/* Tooltip on Collapsed State */}
              {isSidebarCollapsed && (
                <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 text-xs font-medium rounded-md shadow-xl border whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-200 shadow-md'
                }`}>
                  Data Upload & Ingestion
                </div>
              )}
            </div>

            {/* 2nd: Optimization Dashboard Tab */}
            <div className="relative group">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeSection === 'dashboard'
                    ? (theme === 'dark' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm' : 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm')
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <LayoutDashboard size={20} className="shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">Optimization Dashboard</span>
                )}
                {hasPendingApproval && (
                  <span className={`flex items-center justify-center bg-amber-500 text-slate-950 font-bold rounded-full ${isSidebarCollapsed ? 'absolute top-1 right-1 w-2.5 h-2.5' : 'w-2 h-2 animate-ping'}`} />
                )}
              </button>

              {/* Tooltip on Collapsed State */}
              {isSidebarCollapsed && (
                <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 text-xs font-medium rounded-md shadow-xl border whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-200 shadow-md'
                }`}>
                  Optimization Dashboard
                  {hasPendingApproval && " (Action Needed)"}
                </div>
              )}
            </div>

            {/* 3rd: Talk To Your Data Tab */}
            <div className="relative group">
              <button
                onClick={() => setActiveSection('chat')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeSection === 'chat'
                    ? (theme === 'dark' ? 'bg-violet-600/15 text-violet-400 border border-violet-500/30 shadow-sm' : 'bg-violet-50 text-violet-600 border border-violet-200 shadow-sm')
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <MessageSquare size={20} className="shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">Talk To Your Data</span>
                )}
              </button>

              {/* Tooltip on Collapsed State */}
              {isSidebarCollapsed && (
                <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 text-xs font-medium rounded-md shadow-xl border whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-200 shadow-md'
                }`}>
                  Talk To Your Data
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Indicator */}
        <div className={`p-3 border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/80 border-slate-200'
          } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <Activity size={16} className="text-emerald-500 shrink-0 animate-pulse" />
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>System Online</p>
                <p className={`text-[9px] truncate ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Agent Ready</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 2. TOP HEADER */}
        <header className={`border-b sticky top-0 z-20 h-16 shrink-0 transition-colors duration-300 ${
          theme === 'dark' ? 'border-slate-800 bg-slate-900/60 backdrop-blur' : 'border-slate-200 bg-white/80 backdrop-blur shadow-sm'
        }`}>
          <div className="h-full px-6 flex items-center justify-between gap-4">
            {/* Status Badge & Actions */}
            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
              {/* Modern Sleek Theme Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                onClick={toggleTheme}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span className="sr-only">Toggle theme</span>
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    theme === 'dark' ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>

              {/* Active Badge */}
              <span className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm ${
                theme === 'dark' ? 'text-slate-300 bg-slate-800/80 border-slate-700/80' : 'text-slate-700 bg-slate-100/90 border-slate-200'
              }`}>
                <Zap size={14} className="text-amber-500 fill-amber-500/20" />
                <span className="font-medium">Autonomous Optimizer</span>
              </span>

              {/* Refresh Button */}
              {threadId && (
                <button
                  onClick={handleRefresh}
                  className={`p-2 rounded-lg transition-colors border ${
                    theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                  title="Refresh Status"
                >
                  <RefreshCw size={16} className={isPolling ? "animate-spin text-blue-500" : ""} />
                </button>
              )}

              {/* Notification Icon */}
              <div className="relative">
                <button className={`p-2 rounded-lg transition-colors border relative ${
                  theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                }`}>
                  <Bell size={16} />
                  {hasPendingApproval && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  )}
                </button>
              </div>

              {/* User Profile */}
              <div className={`flex items-center gap-2 pl-2 border-l ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  <User size={16} />
                </div>
                <div className="hidden lg:block text-left">
                  <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Treasury Admin</p>
                  <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Enterprise Mode</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'upload' ? (
              /* Data Upload Section */
              <div className="space-y-6">
                <DataUpload
                  cycleDate={cycleDate}
                  setCycleDate={setCycleDate}
                  onCycleStarted={handleCycleStarted}
                  cashUsd={cashUsd}
                  overrideDq={overrideDq}
                  setActiveSection={setActiveSection}
                />
              </div>
            ) : activeSection === 'chat' ? (
              /* Talk To Your Data Section */
              <ChatPanel cycleDate={cycleDate} theme={theme} embedded />
            ) : (
              /* Dashboard Section */
              <div className="space-y-6">
                {/* Working Capital Ground Truth & AI Strategy Overview */}
                <WorkingCapitalOverview cycleDate={cycleDate} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                    <CycleControl
                      onCycleStarted={handleCycleStarted}
                      cycleDate={cycleDate}
                      setCycleDate={setCycleDate}
                      cashUsd={cashUsd}
                      setCashUsd={setCashUsd}
                      overrideDq={overrideDq}
                      setOverrideDq={setOverrideDq}
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    {!cycleData ? (
                      <div className={`glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-2 rounded-xl ${
                        theme === 'dark' ? 'text-slate-400 border-slate-700/50 bg-slate-900/20' : 'text-slate-500 border-slate-300 bg-white/50'
                      }`}>
                        <Database size={48} className="mb-4 opacity-40 text-blue-500" />
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>No Active Optimization Cycle</h3>
                        <p className="text-sm opacity-70 max-w-md mt-1">
                          Start a new cycle using the parameters panel on the left or upload fresh enterprise datasets in the Data Upload section.
                        </p>
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => setActiveSection('upload')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                              theme === 'dark'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                          >
                            <UploadCloud size={16} /> Go to Data Upload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CycleStatus data={cycleData} />

                        {cycleData.status === 'pending_approval' && cycleData.pending_approval && (
                          <ApprovalQueue
                            threadId={threadId}
                            pendingApproval={cycleData.pending_approval}
                            onApprovalComplete={handleApprovalComplete}
                          />
                        )}

                        {cycleData.status === 'complete' && cycleData.outcomes_summary && (
                          <OutcomesSummary summary={cycleData.outcomes_summary} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;