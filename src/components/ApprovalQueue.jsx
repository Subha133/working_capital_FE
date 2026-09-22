import React, { useState } from 'react';
import { Check, X, Edit2, ShieldAlert } from 'lucide-react';
import { submitApproval } from '../api';

export default function ApprovalQueue({ threadId, pendingApproval, onApprovalComplete }) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCash, setEditCash] = useState(pendingApproval?.proposed_cash_usd || 0);
  const [error, setError] = useState('');

  if (!pendingApproval) return null;

  const handleDecision = async (decision) => {
    setLoading(true);
    setError('');
    try {
      const editedCash = decision === 'edit' ? editCash : null;
      await submitApproval(threadId, pendingApproval.action_id, decision, editedCash);
      setEditing(false);
      onApprovalComplete();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit approval');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 border-l-4 border-yellow-500">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="text-yellow-500" size={24} />
        <h2 className="text-xl font-semibold text-white">Human Approval Required</h2>
      </div>

      <div className="bg-slate-800/80 rounded p-4 mb-6 border border-slate-600">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Action ID</div>
            <div className="font-mono text-slate-200">{pendingApproval.action_id}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Lever</div>
            <div className="font-medium text-slate-200">{pendingApproval.lever}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Description</div>
            <div className="text-slate-200">{pendingApproval.description}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Proposed Cash Impact</div>
            <div className="text-lg font-semibold text-green-400">
              ${pendingApproval.proposed_cash_usd?.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Confidence Score</div>
            <div className="text-lg font-semibold text-blue-400">
              {pendingApproval.confidence_score?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm border border-red-800">
          {error}
        </div>
      )}

      {editing ? (
        <div className="mb-6 bg-slate-800/50 p-4 rounded border border-slate-600">
          <label className="block text-sm font-medium text-gray-300 mb-2">Edit Proposed Cash (USD)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={editCash}
              onChange={(e) => setEditCash(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleDecision('edit')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded transition-colors"
            >
              Confirm Edit
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => handleDecision('approve')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition-colors"
          >
            <Check size={18} /> Approve
          </button>
          
          <button
            onClick={() => setEditing(true)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors"
          >
            <Edit2 size={18} /> Edit
          </button>
          
          <button
            onClick={() => handleDecision('reject')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded transition-colors"
          >
            <X size={18} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}
