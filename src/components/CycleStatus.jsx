import React from 'react';
import { Activity, CheckCircle, AlertTriangle, AlertOctagon, PauseCircle } from 'lucide-react';

export default function CycleStatus({ data }) {
  if (!data) return null;

  const getStatusIcon = (status, halted) => {
    if (halted) return <AlertOctagon className="text-red-500" size={24} />;
    switch (status) {
      case 'running': return <Activity className="text-blue-500 animate-pulse" size={24} />;
      case 'pending_approval': return <PauseCircle className="text-yellow-500" size={24} />;
      case 'complete': return <CheckCircle className="text-green-500" size={24} />;
      default: return <AlertTriangle className="text-gray-400" size={24} />;
    }
  };

  const getStatusColor = (status, halted) => {
    if (halted) return 'text-red-400';
    switch (status) {
      case 'running': return 'text-blue-400';
      case 'pending_approval': return 'text-yellow-400';
      case 'complete': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Cycle Status</h2>
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
          {getStatusIcon(data.status, data.halted)}
          <span className={`font-medium capitalize ${getStatusColor(data.status, data.halted)}`}>
            {data.halted ? 'Halted' : data.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/40 p-3 rounded border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thread ID</div>
          <div className="text-sm font-mono text-slate-200 truncate" title={data.thread_id}>
            {data.thread_id.substring(0, 8)}...
          </div>
        </div>
        <div className="bg-slate-800/40 p-3 rounded border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cycle Date</div>
          <div className="text-sm text-slate-200">{data.cycle_date || '—'}</div>
        </div>
        <div className="bg-slate-800/40 p-3 rounded border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Auto Actions</div>
          <div className="text-sm text-slate-200 font-semibold">{data.auto_action_count}</div>
        </div>
        <div className="bg-slate-800/40 p-3 rounded border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pending</div>
          <div className="text-sm text-yellow-400 font-semibold">{data.approval_backlog_remaining}</div>
        </div>
      </div>

      {data.halt_reason && (
        <div className="bg-red-900/30 border border-red-800 rounded p-4 mb-4">
          <h3 className="text-red-400 font-medium mb-2 flex items-center gap-2">
            <AlertOctagon size={18} /> Cycle Halted
          </h3>
          <p className="text-red-200 text-sm whitespace-pre-wrap">{data.halt_reason}</p>
        </div>
      )}

      {data.dq_issues && data.dq_issues.length > 0 && (
        <div className="bg-orange-900/20 border border-orange-800/50 rounded p-4">
          <h3 className="text-orange-400 font-medium mb-2 flex items-center gap-2">
            <AlertTriangle size={18} /> Data Quality Issues ({data.dq_issues.length})
          </h3>
          <ul className="list-disc list-inside text-sm text-orange-200 space-y-1">
            {data.dq_issues.slice(0, 5).map((issue, idx) => (
              <li key={idx}>
                <span className="font-semibold">{issue.record_id}</span>: {issue.message}
              </li>
            ))}
            {data.dq_issues.length > 5 && (
              <li className="text-orange-400/70 italic">...and {data.dq_issues.length - 5} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
