import React, { useState, useEffect } from 'react';
import CycleControl from './components/CycleControl';
import CycleStatus from './components/CycleStatus';
import ApprovalQueue from './components/ApprovalQueue';
import OutcomesSummary from './components/OutcomesSummary';
import DataUpload from './components/DataUpload';
import { getCycle } from './api';
import { Database, Zap, RefreshCw, LayoutDashboard, UploadCloud, AlertCircle } from 'lucide-react';

function App() {
  const [threadId, setThreadId] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'upload'
  
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
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Database size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Working Capital Agent
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Autonomous Treasury & Cashflow Optimization</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <Zap size={14} className="text-amber-400" /> Autonomous Optimizer
            </span>
            {threadId && (
              <button 
                onClick={handleRefresh}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                title="Refresh Status"
              >
                <RefreshCw size={18} className={isPolling ? "animate-spin text-blue-400" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeSection === 'dashboard'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Optimization Dashboard</span>
            {hasPendingApproval && (
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                <AlertCircle size={12} /> Action Needed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('upload')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeSection === 'upload'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UploadCloud size={18} />
            <span>Data Upload & Ingestion</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'upload' ? (
          /* Data Upload Section */
          <div className="space-y-6">
            <DataUpload cycleDate={cycleDate} setCycleDate={setCycleDate} />
          </div>
        ) : (
          /* Dashboard Section */
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
        )}
      </main>
    </div>
  );
}

export default App;
