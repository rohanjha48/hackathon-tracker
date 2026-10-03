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
  MapPin,
} from 'lucide-react';
import { POPULAR_TAGS } from '@/lib/mockData';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_CITIES = ['Bangalore', 'Delhi', 'Mumbai', 'Hyderabad', 'Pune', 'All Cities'];

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['All']);
  const [preferredCountry, setPreferredCountry] = useState('All');
  const [preferredCity, setPreferredCity] = useState('All');
  const [preferredMode, setPreferredMode] = useState<'both' | 'online' | 'in-person'>('both');
  const [customCity, setCustomCity] = useState('');
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

  const handleCitySelect = (city: string) => {
    if (city === 'All Cities') {
      setPreferredCity('All');
      setCustomCity('');
    } else {
      setPreferredCity(city);
      setCustomCity(city);
      if (['Bangalore', 'Delhi', 'Mumbai', 'Hyderabad', 'Pune'].includes(city)) {
        setPreferredCountry('India');
      }
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
      const effectiveCity = customCity.trim() || preferredCity;
      const res = await fetch('/api/telegram-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId.trim(),
          tags: selectedTags,
          preferred_city: effectiveCity !== 'All' ? effectiveCity : undefined,
          preferred_country: preferredCountry !== 'All' ? preferredCountry : undefined,
          preferred_mode: preferredMode,
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

    const effectiveCity = customCity.trim() || preferredCity;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_chat_id: chatId.trim(),
          telegram_username: username.trim() || undefined,
          filter_tags: selectedTags,
          notify_days_before: notifyDays,
          preferred_country: preferredCountry !== 'All' ? preferredCountry : undefined,
          preferred_city: effectiveCity !== 'All' ? effectiveCity : undefined,
          preferred_mode: preferredMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '🎉 Congratulations! You are now subscribed to automated localized deadline alerts.',
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
              <p className="text-xs text-slate-400">Localized by City & Country • Zero Spam • Pure Signal</p>
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
                    <em>(Important)</em> Send <code>/start</code> to{' '}
                    <a
                      href="https://t.me/MyHackthonAlert_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 font-bold underline inline-flex items-center gap-0.5"
                    >
                      @MyHackthonAlert_bot <ExternalLink size={11} />
                    </a>{' '}
                    so it has permission to message you.
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

          {/* NEW: Preferred Location & City (Phase 3 Requirement) */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <MapPin size={14} className="text-purple-400" />
              <span>Location Preferences (City & Country)</span>
            </div>

            {/* Mode Preference Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400">Preferred Hackathon Format:</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(
                  [
                    { value: 'both', label: 'All / Both' },
                    { value: 'online', label: 'Online Only' },
                    { value: 'in-person', label: 'In-Person Only' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                      preferredMode === m.value
                        ? 'bg-purple-600 text-white font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                    onClick={() => setPreferredMode(m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City Selection: Quick Select Chips */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-400">Preferred City:</span>
                <span className="text-[10px] text-emerald-400 font-medium">Focus on Major Indian Hubs</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CITIES.map((c) => {
                  const isSelected =
                    (c === 'All Cities' && (preferredCity === 'All' || preferredCity === '')) ||
                    preferredCity.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      id={`pref-city-chip-${c.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                      onClick={() => handleCitySelect(c)}
                    >
                      {c === 'Bangalore' ? 'Bangalore 🇮🇳' : c}
                    </button>
                  );
                })}
              </div>

              {/* Custom City Input or Selected Display */}
              <div className="mt-1">
                <input
                  type="text"
                  id="preferred-city-input"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  placeholder="Or type custom city (e.g. Bangalore, San Francisco)..."
                  value={customCity}
                  onChange={(e) => {
                    setCustomCity(e.target.value);
                    setPreferredCity(e.target.value || 'All');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Select Tracks / Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Filter Alert Topics (Select multiple or &apos;All&apos;):
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800/80">
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
                <span>24-48 Hours (Final Call!)</span>
              </label>
            </div>
          </div>

          {/* Test & Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              onClick={handleTestPing}
              disabled={isTesting || !chatId.trim()}
              id="modal-test-ping-btn"
            >
              {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Test Bot Ping</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
