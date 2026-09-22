import React, { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import { startCycle } from '../api';

export default function CycleControl({ 
  onCycleStarted, 
  cycleDate, setCycleDate, 
  cashUsd, setCashUsd, 
  overrideDq, setOverrideDq 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await startCycle(cycleDate, cashUsd, overrideDq);
      onCycleStarted(data.thread_id);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to start cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <Play size={20} className="text-blue-400" /> Start Optimization Cycle
      </h2>
      
      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Cycle Date</label>
          <input
            type="date"
            value={cycleDate}
            onChange={(e) => setCycleDate(e.target.value)}
            required
            className="w-full bg-slate-800/50 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Available Cash (USD)</label>
          <input
            type="number"
            value={cashUsd}
            onChange={(e) => setCashUsd(e.target.value)}
            required
            min="0"
            className="w-full bg-slate-800/50 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="override_dq"
            checked={overrideDq}
            onChange={(e) => setOverrideDq(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
          />
          <label htmlFor="override_dq" className="text-sm text-gray-300">
            Override Data Quality Halts
          </label>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-3 rounded text-sm flex items-start gap-2 border border-red-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'Start Cycle'}
        </button>
      </form>
    </div>
  );
}
