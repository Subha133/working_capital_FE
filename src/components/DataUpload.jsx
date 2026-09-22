import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle,
  FileText,
  AlertCircle,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import { uploadData, startCycle } from '../api';

export default function DataUpload({
  cycleDate,
  setCycleDate,
  onCycleStarted,
  cashUsd = '1000000',
  overrideDq = false,
  setActiveSection,
}) {
  const [loading, setLoading] = useState({});
  const [success, setSuccess] = useState({});
  const [error, setError] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!cycleDate) {
      setError((prev) => ({ ...prev, [fileType]: 'Please set a Cycle Date first.' }));
      return;
    }

    setLoading((prev) => ({ ...prev, [fileType]: true }));
    setError((prev) => ({ ...prev, [fileType]: null }));

    try {
      await uploadData(file, cycleDate, fileType);
      setSuccess((prev) => ({ ...prev, [fileType]: true }));
      setUploadedFiles((prev) => Array.from(new Set([...prev, fileType])));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        [fileType]: err.response?.data?.detail || err.message || 'Upload failed',
      }));
      setSuccess((prev) => ({ ...prev, [fileType]: false }));
    } finally {
      setLoading((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  const handleRunAnalytics = async () => {
    if (!cycleDate) return;

    setAnalyzing(true);
    setError((prev) => ({ ...prev, global: null }));

    try {
      // Trigger Autonomous Optimization Agent Cycle (Option B)
      const data = await startCycle(cycleDate, cashUsd, overrideDq);
      if (onCycleStarted && data?.thread_id) {
        onCycleStarted(data.thread_id);
      }
      if (setActiveSection) {
        setActiveSection('dashboard');
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        global: err.response?.data?.detail || err.message || 'Failed to start optimization analysis cycle.',
      }));
    } finally {
      setAnalyzing(false);
    }
  };

  const UploadRow = ({ label, description, fileType }) => (
    <div className="flex items-center justify-between p-4 wc-inner-card rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-colors shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 dark:bg-slate-700/50 rounded-lg text-indigo-600 dark:text-indigo-400">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{label}</h4>
          {error[fileType] ? (
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error[fileType]}</p>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {success[fileType] && (
          <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-medium">
            <CheckCircle size={14} /> Normalized
          </span>
        )}
        {loading[fileType] && (
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        )}

        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors shadow-sm active:scale-95">
          Upload
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFileUpload(e, fileType)}
            disabled={loading[fileType]}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="glass-panel wc-card p-6 md:p-8 space-y-8 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <UploadCloud size={26} className="text-indigo-600 dark:text-indigo-400" /> Enterprise Data Ingestion & Normalization
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Upload raw enterprise CSV extracts. Data is automatically validated, normalized, and reconciled in MySQL.
          </p>
        </div>

        {setCycleDate && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Cycle Date:</label>
            <input
              type="date"
              value={cycleDate}
              onChange={(e) => setCycleDate(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1 text-sm outline-none focus:border-indigo-500 transition-colors font-medium"
            />
          </div>
        )}
      </div>

      {!cycleDate && (
        <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 p-4 rounded-lg text-sm flex items-center gap-3 border border-amber-200 dark:border-amber-800/60">
          <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Please select a <strong>Cycle Date</strong> above before uploading datasets.</span>
        </div>
      )}

      <div className="space-y-3.5">
        <UploadRow label="ERP Data (Invoices & Purchase Orders)" description="Invoices, Purchase Orders, and Sales Orders extract" fileType="ERP" />
        <UploadRow label="CRM Data (Customer Profiles & Disputes)" description="Credit limits, payment risk tiers, dispute tracking" fileType="CRM" />
        <UploadRow label="Supplier Data (Vendor Terms & Discounts)" description="Payment terms, early payment discount policies" fileType="SUPPLIER" />
        <UploadRow label="Payment Data (Bank Logs & Remittances)" description="Inbound/outbound bank logs and remittance velocity" fileType="PAYMENT" />
        <UploadRow label="Inventory Data (Stock & SKU Costs)" description="Stock levels, holding cost ratios, replenishment lead times" fileType="INVENTORY" />
      </div>

      {error.global && (
        <div className="bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 p-4 rounded-lg text-sm flex items-center gap-3 border border-red-200 dark:border-red-800/60">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
          <span>{error.global}</span>
        </div>
      )}

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
          Uploaded Datasets: <strong className="text-slate-900 dark:text-white">{uploadedFiles.length}</strong> / 5
        </span>

        <button
          onClick={handleRunAnalytics}
          disabled={analyzing || !cycleDate}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md ${
            !cycleDate
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95 shadow-indigo-600/20'
          }`}
        >
          {analyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Starting Analysis...
            </>
          ) : (
            <>
              <PlayCircle size={18} />
              Start Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
}