import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Database, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { chatWithData, getIndexStatus } from '../api';

const ChatPanel = ({ cycleDate, theme = 'dark', embedded = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [indexStatus, setIndexStatus] = useState([]);
  const [showStatus, setShowStatus] = useState(false);

  const messagesEndRef = useRef(null);

  // When embedded, treat it as always open
  const panelOpen = embedded ? true : isOpen;

  useEffect(() => {
    if (panelOpen && cycleDate) {
      fetchIndexStatus();
    }
  }, [panelOpen, cycleDate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchIndexStatus = async () => {
    try {
      const data = await getIndexStatus(cycleDate);
      setIndexStatus(data.statuses || []);
    } catch (err) {
      console.error('Failed to fetch index status', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !cycleDate) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithData(cycleDate, userMessage.content, history);
      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.response?.data?.detail || err.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'indexed': return 'text-emerald-400';
      case 'pending': return 'text-amber-400';
      case 'failed': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  // ── FLOATING MODE (right-side button) ────────────────────────────────────────
  if (!embedded) {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 z-50 flex items-center gap-2 group"
        >
          <MessageSquare size={24} />
          <span className="hidden group-hover:inline pr-2 font-medium">Talk To Your Data</span>
        </button>
      );
    }

    return (
      <div className="fixed bottom-6 right-6 w-[450px] h-[600px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <MessageSquare className="text-indigo-400" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold leading-tight">Talk To Your Data</h3>
              <p className="text-xs text-slate-400">Cycle: {cycleDate || 'None'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowStatus(!showStatus); if (!showStatus) fetchIndexStatus(); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Index Status"
            >
              <Database size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        <ChatBody
          messages={messages} isLoading={isLoading} input={input} setInput={setInput}
          handleSend={handleSend} cycleDate={cycleDate} showStatus={showStatus}
          setShowStatus={setShowStatus} fetchIndexStatus={fetchIndexStatus}
          indexStatus={indexStatus} getStatusColor={getStatusColor}
          messagesEndRef={messagesEndRef}
        />
      </div>
    );
  }

  // ── EMBEDDED MODE (left sidebar nav → main content area) ─────────────────────
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden font-sans ${
      isDark
        ? 'bg-slate-900 border-slate-700/60'
        : 'bg-white border-slate-200 shadow-sm'
    }`} style={{ height: 'calc(100vh - 7rem)' }}>

      {/* Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
        isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-violet-500/20' : 'bg-violet-100'
          }`}>
            <MessageSquare className="text-violet-400" size={20} />
          </div>
          <div>
            <h2 className={`font-semibold text-base leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Talk To Your Data
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Cycle: {cycleDate || 'None selected'}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowStatus(!showStatus); if (!showStatus) fetchIndexStatus(); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isDark
              ? 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 border-slate-600'
              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
          }`}
          title="Vector Index Status"
        >
          <Database size={14} />
          {showStatus ? 'Hide Status' : 'Index Status'}
        </button>
      </div>

      {/* Index Status Panel */}
      {showStatus && (
        <div className={`border-b px-6 py-3 shrink-0 max-h-40 overflow-y-auto text-sm ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <h4 className={`font-medium text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Vector Index Status
            </h4>
            <button onClick={fetchIndexStatus} className="text-xs text-violet-400 hover:text-violet-300">Refresh</button>
          </div>
          {indexStatus.length === 0 ? (
            <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No data indexed for this cycle.</p>
          ) : (
            <div className="space-y-1">
              {indexStatus.map((s, i) => (
                <div key={i} className={`flex justify-between items-center p-2 rounded ${isDark ? 'bg-slate-900/50' : 'bg-white border border-slate-200'}`}>
                  <span className={`font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.file_type}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.record_count} recs</span>
                    <span className={`text-xs font-medium ${getStatusColor(s.status)}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
              <MessageSquare size={32} className="text-violet-400" />
            </div>
            <div className="text-center">
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Ask about your working capital
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                e.g. "What is driving my DSO risk?"
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                "Show me Acme Corp's overdue invoices"
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-br-none'
                : msg.isError
                  ? 'bg-rose-900/50 border border-rose-700 text-rose-200 rounded-bl-none'
                  : isDark
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                    : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.sources && <SourcesAccordion sources={msg.sources} isDark={isDark} />}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-sm ${
              isDark ? 'bg-slate-800 border border-slate-700 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-500'
            }`}>
              <Loader size={16} className="animate-spin" />
              Thinking & Searching...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`px-6 py-4 border-t shrink-0 ${isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={cycleDate ? 'Ask a question about your data...' : 'Select a cycle date first'}
            disabled={!cycleDate || isLoading}
            className={`w-full rounded-xl pl-4 pr-12 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !cycleDate || isLoading}
            className="absolute right-2 p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Shared chat body for floating mode ────────────────────────────────────────
const ChatBody = ({ messages, isLoading, input, setInput, handleSend, cycleDate, showStatus, setShowStatus, fetchIndexStatus, indexStatus, getStatusColor, messagesEndRef }) => (
  <>
    {showStatus && (
      <div className="bg-slate-800/80 border-b border-slate-700 p-3 shrink-0 max-h-40 overflow-y-auto text-sm">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-slate-300 font-medium text-xs uppercase tracking-wider">Vector Index Status</h4>
          <button onClick={fetchIndexStatus} className="text-xs text-indigo-400 hover:text-indigo-300">Refresh</button>
        </div>
        {indexStatus.length === 0 ? (
          <p className="text-slate-500 text-xs italic">No data indexed for this cycle.</p>
        ) : (
          <div className="space-y-1">
            {indexStatus.map((s, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                <span className="text-slate-300 font-mono text-xs">{s.file_type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{s.record_count} recs</span>
                  <span className={`text-xs font-medium ${getStatusColor(s.status)}`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
          <MessageSquare size={48} className="text-slate-700" />
          <div className="text-center">
            <p className="font-medium text-slate-400">Ask about your working capital</p>
            <p className="text-sm mt-1">e.g. "What is driving my DSO risk?"</p>
            <p className="text-sm">"Show me Acme Corp's overdue invoices"</p>
          </div>
        </div>
      )}
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-none'
              : msg.isError
                ? 'bg-rose-900/50 border border-rose-700 text-rose-200 rounded-bl-none'
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
            {msg.sources && <SourcesAccordion sources={msg.sources} isDark={true} />}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
            <Loader size={16} className="animate-spin" />
            Thinking & Searching...
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    <div className="p-4 bg-slate-800 border-t border-slate-700 shrink-0">
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={cycleDate ? 'Ask a question...' : 'Select a cycle date first'}
          disabled={!cycleDate || isLoading}
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !cycleDate || isLoading}
          className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  </>
);

// ── Sources accordion ─────────────────────────────────────────────────────────
const SourcesAccordion = ({ sources, isDark = true }) => {
  const [open, setOpen] = useState(false);
  if (!sources || Object.keys(sources).length === 0) return null;
  const hasSql = sources.sql_results && sources.sql_results.length > 0;
  const hasVector = sources.vector_hits && sources.vector_hits.length > 0;
  if (!hasSql && !hasVector) return null;

  return (
    <div className="mt-3 border-t border-slate-700 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 w-full"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>Context Sources ({[
          hasSql && `${sources.sql_results.length} SQL records`,
          hasVector && `${sources.vector_hits.length} vector hits`
        ].filter(Boolean).join(', ')})</span>
      </button>
      {open && (
        <div className="mt-2 space-y-3 bg-slate-900/50 p-3 rounded-lg text-xs font-mono text-slate-400 max-h-60 overflow-y-auto">
          {hasSql && (
            <div>
              <div className="text-indigo-400 font-semibold mb-1 border-b border-slate-700 pb-1">SQL Matches</div>
              {sources.sql_results.map((r, i) => (
                <div key={i} className="mb-2 bg-slate-800 p-2 rounded">{JSON.stringify(r, null, 2)}</div>
              ))}
            </div>
          )}
          {hasVector && (
            <div>
              <div className="text-emerald-400 font-semibold mb-1 border-b border-slate-700 pb-1">Vector Search Hits</div>
              {sources.vector_hits.map((h, i) => (
                <div key={i} className="mb-2 bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">Distance: {h.distance?.toFixed(3)}</span><br />
                  {h.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
