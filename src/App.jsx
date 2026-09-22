import React, { useState, useEffect } from 'react';
import CycleControl from './components/CycleControl';
import CycleStatus from './components/CycleStatus';
import ApprovalQueue from './components/ApprovalQueue';
import OutcomesSummary from './components/OutcomesSummary';
import DataUpload from './components/DataUpload';
import WorkingCapitalOverview from './components/WorkingCapitalOverview';
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
  Activity
} from 'lucide-react';

function App() {
  const [threadId, setThreadId] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'upload'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="flex h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-hidden">
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside
        className={`bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out z-30 relative shrink-0 ${
          isSidebarCollapsed ? 'w-[90px]' : 'w-64'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo / Header Area */}
          <div className="h-16 px-3 flex items-center justify-between border-b border-slate-800/80 w-full shrink-0">
            {/* DB Icon & Text Container */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0 flex items-center justify-center">
                <Database size={20} className="text-white shrink-0" />
              </div>

              {!isSidebarCollapsed && (
                <div className="whitespace-nowrap min-w-0 flex-1 overflow-hidden transition-opacity duration-200">
                  <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent truncate">
                    Working Capital
                  </h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">Treasury Agent</p>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700/50 shrink-0 ml-1"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2">
            {/* Optimization Dashboard Tab */}
            <div className="relative group">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeSection === 'dashboard'
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
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
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Optimization Dashboard
                  {hasPendingApproval && " (Action Needed)"}
                </div>
              )}
            </div>

            {/* Data Upload & Ingestion Tab */}
            <div className="relative group">
              <button
                onClick={() => setActiveSection('upload')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeSection === 'upload'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <UploadCloud size={20} className="shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">Data Upload & Ingestion</span>
                )}
              </button>

              {/* Tooltip on Collapsed State */}
              {isSidebarCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Data Upload & Ingestion
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Indicator */}
        <div className="p-3 border-t border-slate-800/80">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <Activity size={16} className="text-emerald-400 shrink-0 animate-pulse" />
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[11px] font-medium text-slate-300 truncate">System Online</p>
                <p className="text-[9px] text-slate-500 truncate">Agent Ready</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 2. TOP HEADER */}
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20 h-16 shrink-0">
          <div className="h-full px-6 flex items-center justify-between gap-4">
            {/* Status Badge & Actions */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Active Badge */}
              <span className="text-xs text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/80 shadow-sm">
                <Zap size={14} className="text-amber-400 fill-amber-400/20" />
                <span className="font-medium">Autonomous Optimizer</span>
              </span>

              {/* Refresh Button */}
              {threadId && (
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white border border-slate-800"
                  title="Refresh Status"
                >
                  <RefreshCw size={16} className={isPolling ? "animate-spin text-blue-400" : ""} />
                </button>
              )}

              {/* Notification Icon */}
              <div className="relative">
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white border border-slate-800 relative">
                  <Bell size={16} />
                  {hasPendingApproval && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  )}
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  <User size={16} />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200">Treasury Admin</p>
                  <p className="text-[10px] text-slate-500">Enterprise Mode</p>
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
                <DataUpload cycleDate={cycleDate} setCycleDate={setCycleDate} />
              </div>
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
                      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center text-slate-400 border-dashed border-2 border-slate-700/50 bg-slate-900/20 rounded-xl">
                        <Database size={48} className="mb-4 opacity-40 text-blue-400" />
                        <h3 className="text-lg font-semibold text-slate-300">No Active Optimization Cycle</h3>
                        <p className="text-sm opacity-70 max-w-md mt-1">
                          Start a new cycle using the parameters panel on the left or upload fresh enterprise datasets in the Data Upload section.
                        </p>
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => setActiveSection('upload')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors flex items-center gap-2"
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