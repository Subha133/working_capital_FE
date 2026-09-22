import React from 'react';
import { Activity, CheckCircle, AlertTriangle, AlertOctagon, PauseCircle } from 'lucide-react';

export default function CycleStatus({ data }) {
  if (!data) return null;

  const getStatusIcon = (status, halted) => {
    if (halted) return <AlertOctagon className="text-red-500" size={24} />;
    switch (status) {
      case 'running': return <Activity className="text-blue-500 animate-pulse" size={24} />;
      case 'pending_approval': return <PauseCircle className="text-amber-500" size={24} />;
      case 'complete': return <CheckCircle className="text-emerald-500" size={24} />;
      default: return <AlertTriangle className="text-slate-400" size={24} />;
    }
  };

  const getStatusColor = (status, halted) => {
    if (halted) return 'text-red-600 dark:text-red-400';
    switch (status) {
      case 'running': return 'text-blue-600 dark:text-blue-400';
      case 'pending_approval': return 'text-amber-600 dark:text-amber-400';
      case 'complete': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div className="glass-panel wc-card p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cycle Status</h2>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          {getStatusIcon(data.status, data.halted)}
          <span className={`font-semibold capitalize ${getStatusColor(data.status, data.halted)}`}>
            {data.halted ? 'Halted' : data.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Thread ID</div>
          <div className="text-sm font-mono text-slate-900 dark:text-slate-200 truncate font-bold" title={data.thread_id}>
            {data.thread_id.substring(0, 8)}...
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Cycle Date</div>
          <div className="text-sm text-slate-900 dark:text-slate-200 font-bold">{data.cycle_date || '—'}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Auto Actions</div>
          <div className="text-sm text-slate-900 dark:text-slate-200 font-bold">{data.auto_action_count}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Pending</div>
          <div className="text-sm text-amber-700 dark:text-amber-400 font-bold">{data.approval_backlog_remaining}</div>
        </div>
      </div>

      {data.halt_reason && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <h3 className="text-red-600 dark:text-red-400 font-medium mb-2 flex items-center gap-2">
            <AlertOctagon size={18} /> Cycle Halted
          </h3>
          <p className="text-red-800 dark:text-red-200 text-sm whitespace-pre-wrap">{data.halt_reason}</p>
        </div>
      )}

      {data.dq_issues && data.dq_issues.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
          <h3 className="text-amber-700 dark:text-amber-400 font-medium mb-2 flex items-center gap-2">
            <AlertTriangle size={18} /> Data Quality Issues ({data.dq_issues.length})
          </h3>
          <ul className="list-disc list-inside text-sm text-amber-900 dark:text-amber-200 space-y-1">
            {data.dq_issues.slice(0, 5).map((issue, idx) => (
              <li key={idx}>
                <span className="font-semibold">{issue.record_id}</span>: {issue.message}
              </li>
            ))}
            {data.dq_issues.length > 5 && (
              <li className="text-amber-600 dark:text-amber-400/70 italic">...and {data.dq_issues.length - 5} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
