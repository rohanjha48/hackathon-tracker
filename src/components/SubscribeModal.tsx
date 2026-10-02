'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bell,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { POPULAR_TAGS } from '@/lib/mockData';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['All']);
  const [notifyDays, setNotifyDays] = useState<number[]>([7, 3, 1]);
  const [showHelper, setShowHelper] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (tag === 'All') {
      setSelectedTags(['All']);
      return;
    }
    const withoutAll = selectedTags.filter((t) => t !== 'All');
    if (withoutAll.includes(tag)) {
      const filtered = withoutAll.filter((t) => t !== tag);
      setSelectedTags(filtered.length === 0 ? ['All'] : filtered);
    } else {
      setSelectedTags([...withoutAll, tag]);
    }
  };

  const toggleDay = (day: number) => {
    if (notifyDays.includes(day)) {
      if (notifyDays.length > 1) {
        setNotifyDays(notifyDays.filter((d) => d !== day));
      }
    } else {
      setNotifyDays([...notifyDays, day].sort((a, b) => b - a));
    }
  };

  const handleTestPing = async () => {
    if (!chatId.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your Telegram Chat ID before testing.',
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/telegram-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId.trim(),
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '✅ Test notification sent! Check your Telegram app.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to send test message. Check your bot settings.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error communicating with the notification endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatId.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Telegram Chat ID is required.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_chat_id: chatId.trim(),
          telegram_username: username.trim() || undefined,
          filter_tags: selectedTags,
          notify_days_before: notifyDays,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '🎉 Congratulations! You are now subscribed to automated deadline alerts.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to activate subscription.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error submitting subscription.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-purple-950/20 p-5 sm:p-6 relative flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 flex-shrink-0">
              <Bell size={20} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Instant Telegram Alerts</h2>
              <p className="text-xs text-slate-400">Automated Delivery • Zero Spam • Tailored to Your Tracks</p>
            </div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Telegram Chat ID Field with helper */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="telegram-chat-id" className="font-semibold text-slate-200">
                Telegram Chat ID <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
                onClick={() => setShowHelper(!showHelper)}
              >
                <HelpCircle size={13} />
                <span>How to find Chat ID?</span>
              </button>
            </div>

            <input
              type="text"
              id="telegram-chat-id"
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="e.g. 1092837465"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              required
            />

            {/* Quick Helper Box */}
            {showHelper && (
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 text-xs text-sky-200 mt-1">
                <h4 className="font-bold text-sky-300 mb-2">How to get your Telegram Chat ID in 10 seconds:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li>
                    Open Telegram and message{' '}
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 font-bold underline inline-flex items-center gap-0.5"
                    >
                      @userinfobot <ExternalLink size={11} />
                    </a>
                  </li>
                  <li>Click <strong>Start</strong>. The bot replies with your numerical <code>Id</code>.</li>
                  <li>Copy and paste that number into the box above.</li>
                  <li>
                    <em>(Optional)</em> Send <code>/start</code> to your bot first so it has permission to message you.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Username Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="telegram-username" className="text-xs font-semibold text-slate-200">
              Telegram Handle (Optional)
            </label>
            <input
              type="text"
              id="telegram-username"
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="@yourhandle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Select Tracks / Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Filter Alert Topics (Select multiple or &apos;All&apos;):
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800/80">
              {POPULAR_TAGS.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Frequency Windows */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-200">Alert Countdown Windows:</label>
            <div className="flex flex-wrap gap-4 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  checked={notifyDays.includes(7)}
                  onChange={() => toggleDay(7)}
                />
                <span>7 Days Before</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  checked={notifyDays.includes(3)}
                  onChange={() => toggleDay(3)}
                />
                <span>3 Days Before</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  checked={notifyDays.includes(1)}
                  onChange={() => toggleDay(1)}
                />
                <span>24 Hours (Final Call!)</span>
              </label>
            </div>
          </div>

          {/* Test & Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
              onClick={handleTestPing}
              disabled={isTesting || !chatId.trim()}
              id="modal-test-ping-btn"
            >
              {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Test Bot Ping</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center gap-1.5 disabled:opacity-50"
              disabled={isSubmitting}
              id="modal-submit-subscribe-btn"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>Activate Alerts</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
