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
    <div className="glass-panel p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-green-400" /> Cycle Outcomes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 shadow-inner">
          <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            Total Working Capital Impact
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(summary.total_impact_usd)}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 shadow-inner">
          <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            Cash Consumed
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(summary.cash_consumed_usd)}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 shadow-inner flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Approved Actions</span>
            <span className="text-white font-semibold">{summary.approved_actions || 0}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Rejected Actions</span>
            <span className="text-white font-semibold">{summary.rejected_actions || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Auto Executed</span>
            <span className="text-white font-semibold">{summary.auto_executed || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
