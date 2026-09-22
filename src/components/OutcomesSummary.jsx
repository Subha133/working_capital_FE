import React from 'react';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function OutcomesSummary({ summary }) {
  if (!summary) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="glass-panel wc-card p-6 border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" /> Cycle Outcomes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 shadow-xs">
          <div className="text-slate-700 dark:text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
            Total Working Capital Impact
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.total_impact_usd)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 shadow-xs">
          <div className="text-slate-700 dark:text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <Activity size={16} className="text-blue-600 dark:text-blue-400" />
            Cash Consumed
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.cash_consumed_usd)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 shadow-xs flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-700 dark:text-slate-400 text-sm font-medium">Approved Actions</span>
            <span className="text-slate-900 dark:text-white font-bold">{summary.approved_actions || 0}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-700 dark:text-slate-400 text-sm font-medium">Rejected Actions</span>
            <span className="text-slate-900 dark:text-white font-bold">{summary.rejected_actions || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-700 dark:text-slate-400 text-sm font-medium">Auto Executed</span>
            <span className="text-slate-900 dark:text-white font-bold">{summary.auto_executed || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
