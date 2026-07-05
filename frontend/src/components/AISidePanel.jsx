import { useState, useEffect } from 'react';
import { aiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineArrowPath,
  HiOutlineLightBulb,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';

/**
 * AI Summary side panel that slides in from the right.
 * Calls the Gemini API via the backend to summarize note content.
 */
export default function AISidePanel({ isOpen, onClose, noteId, existingSummary }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Load existing summary if available and recent (< 1 hour)
  useEffect(() => {
    if (isOpen && existingSummary?.summary) {
      const generatedAt = existingSummary.generatedAt
        ? new Date(existingSummary.generatedAt)
        : null;
      const isRecent = generatedAt && Date.now() - generatedAt.getTime() < 3600000;

      if (isRecent) {
        setSummary({
          summary: existingSummary.summary,
          keyPoints: existingSummary.keyPoints || [],
          generatedAt: existingSummary.generatedAt,
        });
      } else {
        setSummary(null);
      }
    } else {
      setSummary(null);
    }
  }, [isOpen, existingSummary]);

  const handleSummarize = async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const res = await aiService.summarize(noteId);
      setSummary({
        summary: res.data.summary,
        keyPoints: res.data.keyPoints || [],
        generatedAt: res.data.generatedAt,
      });
      addToast('Summary generated successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate summary.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onClose} />

      <div className="ai-panel fixed right-0 top-0 h-full z-50 w-full sm:w-[400px] bg-white dark:bg-dark-850 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <HiOutlineSparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">AI Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Generate / Regenerate button */}
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="btn btn-primary btn-md w-full gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing note...
              </>
            ) : summary ? (
              <>
                <HiOutlineArrowPath className="w-4 h-4" />
                Regenerate Summary
              </>
            ) : (
              <>
                <HiOutlineSparkles className="w-4 h-4" />
                Generate Summary
              </>
            )}
          </button>

          {/* Loading state */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="card p-4 space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
              <div className="card p-4 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="skeleton w-5 h-5 rounded-full flex-shrink-0 mt-0.5" />
                    <div className="skeleton h-4 w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary results */}
          {!loading && summary && (
            <div className="space-y-4 animate-fade-in">
              {/* Summary paragraph */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineLightBulb className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Summary</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {summary.summary}
                </p>
              </div>

              {/* Key points */}
              {summary.keyPoints?.length > 0 && (
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Key Points</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {summary.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timestamp */}
              {summary.generatedAt && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                  Generated {formatDistanceToNow(new Date(summary.generatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !summary && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <HiOutlineSparkles className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2">
                AI-Powered Summaries
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Click the button above to generate an AI summary with key points from your note content.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
