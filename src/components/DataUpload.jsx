import React, { useState } from 'react';
import { UploadCloud, CheckCircle, FileText, AlertCircle, Database, Cpu } from 'lucide-react';
import { uploadData, getCycleSummary } from '../api';

export default function DataUpload({ cycleDate, setCycleDate }) {
  const [loading, setLoading] = useState({});
  const [success, setSuccess] = useState({});
  const [error, setError] = useState({});
  const [summary, setSummary] = useState(null);

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!cycleDate) {
      setError({ ...error, [fileType]: 'Please set a Cycle Date first.' });
      return;
    }

    setLoading({ ...loading, [fileType]: true });
    setError({ ...error, [fileType]: null });
    
    try {
      const res = await uploadData(file, cycleDate, fileType);
      setSuccess({ ...success, [fileType]: true });
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      setError({ 
        ...error, 
        [fileType]: err.response?.data?.detail || err.message || 'Upload failed' 
      });
      setSuccess({ ...success, [fileType]: false });
    } finally {
      setLoading({ ...loading, [fileType]: false });
    }
  };

  const UploadRow = ({ label, description, fileType }) => (
    <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-lg border border-slate-700/80 hover:border-indigo-500/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-700/50 rounded-md text-indigo-400">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{label}</h4>
          {error[fileType] ? (
            <p className="text-xs text-red-400 mt-0.5">{error[fileType]}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {success[fileType] && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60 font-medium">
            <CheckCircle size={14} /> Normalized
          </span>
        )}
        {loading[fileType] && <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
        
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-1.5 px-4 rounded-md transition-colors shadow-sm">
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
    <div className="glass-panel p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <UploadCloud size={26} className="text-indigo-400" /> Enterprise Data Ingestion & Normalization
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload raw enterprise CSV extracts. Data is automatically validated, normalized, and stored in MySQL.
          </p>
        </div>

        {setCycleDate && (
          <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700 shrink-0">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cycle Date:</label>
            <input 
              type="date" 
              value={cycleDate} 
              onChange={(e) => setCycleDate(e.target.value)} 
              className="bg-slate-800 text-white border border-slate-600 rounded px-2.5 py-1 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>
      
      {!cycleDate && (
        <div className="mb-6 bg-amber-950/40 text-amber-200 p-4 rounded-lg text-sm flex items-center gap-3 border border-amber-800/60">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <span>Please select a <strong>Cycle Date</strong> above before uploading datasets.</span>
        </div>
      )}

      <div className="space-y-3.5 mb-8">
        <UploadRow label="ERP Data (Invoices & Purchase Orders)" description="Invoices, Purchase Orders, and Sales Orders extract" fileType="ERP" />
        <UploadRow label="CRM Data (Customer Profiles & Disputes)" description="Credit limits, payment risk tiers, dispute tracking" fileType="CRM" />
        <UploadRow label="Supplier Data (Vendor Terms & Discounts)" description="Payment terms, early payment discount policies" fileType="SUPPLIER" />
        <UploadRow label="Payment Data (Bank Logs & Remittances)" description="Inbound/outbound bank logs and remittance velocity" fileType="PAYMENT" />
        <UploadRow label="Inventory Data (Stock & SKU Costs)" description="Stock levels, holding cost ratios, replenishment lead times" fileType="INVENTORY" />
      </div>

      {summary && (
        <div className="p-5 bg-slate-900/90 rounded-xl border border-indigo-500/30">
          <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2 mb-4">
            <Cpu size={18} /> Derived Working Capital KPIs ({cycleDate})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Total AR</span>
              <span className="text-lg font-bold text-emerald-400">${summary.total_ar_usd?.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Total AP</span>
              <span className="text-lg font-bold text-rose-400">${summary.total_ap_usd?.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Inventory Value</span>
              <span className="text-lg font-bold text-amber-400">${summary.inventory_value_usd?.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Cash Conversion Cycle</span>
              <span className="text-lg font-bold text-indigo-300">{summary.cash_conversion_cycle_days} Days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

