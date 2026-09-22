import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getCycleSummary } from '../api';

export default function WorkingCapitalOverview({ cycleDate }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cycleDate) return;
    setLoading(true);
    getCycleSummary(cycleDate)
      .then((res) => {
        if (res && res.total_ar_usd !== undefined) {
          setSummary(res);
        }
      })
      .catch((err) => {
        console.error("Failed to load cycle summary", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cycleDate]);

  if (loading && !summary) {
    return (
      <div className="p-6 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center gap-3 text-slate-400 text-sm">
        <RefreshCw size={18} className="animate-spin text-indigo-400" />
        <span>Loading working capital metrics for {cycleDate}...</span>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-4">
      {/* Main KPI Panel */}
      <div className="p-6 bg-slate-900/90 rounded-xl border border-indigo-500/30 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
          <h3 className="text-base font-semibold text-indigo-300 flex items-center gap-2">
            <Cpu size={20} className="text-indigo-400" /> Working Capital Ground Truth ({cycleDate})
          </h3>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <ShieldCheck size={13} /> Deterministic Math
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
              <Sparkles size={13} /> AI Advisory
            </span>
          </div>
        </div>

        {/* Core 4 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-5">
          <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400 block mb-1">Net Accounts Receivable</span>
            <span className="text-xl font-bold text-emerald-400">
              ₹{summary.total_ar_usd?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            {summary.settled_ar_usd > 0 && (
              <span className="text-[11px] text-slate-400 block mt-1">
                (Gross ₹{summary.gross_ar_usd?.toLocaleString()} − Settled ₹{summary.settled_ar_usd?.toLocaleString()})
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400 block mb-1">Net Accounts Payable</span>
            <span className="text-xl font-bold text-rose-400">
              ₹{summary.total_ap_usd?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              (Purchase Invoices only; POs excluded)
            </span>
          </div>

          <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400 block mb-1">Inventory Valuation</span>
            <span className="text-xl font-bold text-amber-400">
              ₹{summary.inventory_value_usd?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              (Stock on hand × Unit cost)
            </span>
          </div>

          <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400 block mb-1">Cash Conversion Cycle</span>
            <span className="text-xl font-bold text-indigo-300">
              {summary.cash_conversion_cycle_days} Days
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              (DSO + DIO − DPO)
            </span>
          </div>
        </div>

        {/* Days Breakdown Row */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-center">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Days Sales Outstanding</span>
            <span className="text-sm font-semibold text-slate-200">{summary.dso_days} Days</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Days Inventory Outstanding</span>
            <span className="text-sm font-semibold text-slate-200">{summary.dio_days} Days</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Days Payable Outstanding</span>
            <span className="text-sm font-semibold text-slate-200">{summary.dpo_days} Days</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Warnings */}
      {summary.discrepancies?.erp_stale_invoices?.length > 0 && (
        <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-2">
            <AlertTriangle size={18} />
            <span>Reconciliation Alerts ({summary.discrepancies.erp_stale_invoices.length} Discrepancy Found)</span>
          </div>
          <div className="space-y-2 text-xs text-amber-200/90">
            {summary.discrepancies.erp_stale_invoices.map((disc, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-amber-950/40 p-2.5 rounded border border-amber-900/50">
                <span className="font-mono font-bold text-amber-300">{disc.invoice_id}:</span>
                <span>
                  Payment of ₹{disc.amount?.toLocaleString()} is COMPLETED in bank records, but ERP ledger lists it as {disc.erp_status}. Deducted from Net AR to avoid double-counting.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Executive Advisory Layer */}
      {summary.ai_advisory && (
        <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 rounded-xl border border-indigo-500/30 shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" /> AI Executive Advisory & Strategy
            </h4>
            {summary.ai_advisory.health_score !== undefined && (
              <div className="flex items-center gap-2 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/60">
                <span className="text-xs text-indigo-300">Health Score:</span>
                <span className="text-sm font-bold text-white">{summary.ai_advisory.health_score}/100</span>
              </div>
            )}
          </div>

          {summary.ai_advisory.executive_summary && (
            <p className="text-sm text-slate-300 mb-4 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
              {summary.ai_advisory.executive_summary}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.ai_advisory.liquidity_risks?.length > 0 && (
              <div className="bg-slate-900/70 p-3.5 rounded-lg border border-slate-800">
                <h5 className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-rose-400" /> Key Liquidity Risks
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {summary.ai_advisory.liquidity_risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.ai_advisory.recommendations?.length > 0 && (
              <div className="bg-slate-900/70 p-3.5 rounded-lg border border-slate-800">
                <h5 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-400" /> Recommended Actions
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {summary.ai_advisory.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
