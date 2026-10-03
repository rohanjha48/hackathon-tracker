'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bell,
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
          text: 'Test notification sent! Check your Telegram app.',
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
          text: 'Subscription active! You will receive automated deadline alerts on Telegram.',
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 relative flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 flex-shrink-0">
              <Bell size={16} />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Telegram Alert Preferences</h2>
              <p className="text-xs text-zinc-400">Filter by Track, Format, and Major Cities</p>
            </div>
          </div>
          <button
            type="button"
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-3.5">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={15} className="flex-shrink-0 text-zinc-300" />
              ) : (
                <AlertCircle size={15} className="flex-shrink-0 text-zinc-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Telegram Chat ID Field with helper */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="telegram-chat-id" className="font-medium text-zinc-200">
                Telegram Chat ID <span className="text-zinc-400">*</span>
              </label>
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-200 font-medium inline-flex items-center gap-1 cursor-pointer"
                onClick={() => setShowHelper(!showHelper)}
              >
                <HelpCircle size={12} />
                <span>How to find Chat ID?</span>
              </button>
            </div>

            <input
              type="text"
              id="telegram-chat-id"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
              placeholder="e.g. 1092837465"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              required
            />

            {/* Quick Helper Box */}
            {showHelper && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 mt-1">
                <h4 className="font-semibold text-zinc-200 mb-1.5">How to get your Telegram Chat ID in 10 seconds:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400">
                  <li>
                    Open Telegram and message{' '}
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-200 font-medium underline inline-flex items-center gap-0.5"
                    >
                      @userinfobot <ExternalLink size={10} />
                    </a>
                  </li>
                  <li>Click <strong>Start</strong>. The bot replies with your numerical <code>Id</code>.</li>
                  <li>Paste that number into the box above.</li>
                  <li>
                    Send <code>/start</code> to{' '}
                    <a
                      href="https://t.me/MyHackthonAlert_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-200 font-medium underline inline-flex items-center gap-0.5"
                    >
                      @MyHackthonAlert_bot <ExternalLink size={10} />
                    </a>{' '}
                    so it has permission to message you.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Username Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="telegram-username" className="text-xs font-medium text-zinc-300">
              Telegram Handle (Optional)
            </label>
            <input
              type="text"
              id="telegram-username"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
              placeholder="@yourhandle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Location Preferences */}
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <MapPin size={13} className="text-zinc-400" />
              <span>Location Preferences</span>
            </div>

            {/* Mode Preference Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-zinc-400">Format:</label>
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
                    className={`py-1 px-2 rounded-md font-medium transition-colors text-center cursor-pointer ${
                      preferredMode === m.value
                        ? 'bg-zinc-100 text-zinc-950 font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                    onClick={() => setPreferredMode(m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City Selection: Quick Select Chips */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-zinc-400">Preferred City:</span>
                <span className="text-[10px] text-zinc-500">Bangalore, Delhi, etc.</span>
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
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-100 text-zinc-950 font-semibold'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                      onClick={() => handleCitySelect(c)}
                    >
                      {c === 'Bangalore' ? 'Bangalore' : c}
                    </button>
                  );
                })}
              </div>

              {/* Custom City Input */}
              <div className="mt-1">
                <input
                  type="text"
                  id="preferred-city-input"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-md px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  placeholder="Or type custom city (e.g. Bangalore)..."
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-300">
              Filter Topics:
            </label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-zinc-950 rounded-lg border border-zinc-800">
              {POPULAR_TAGS.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-950 font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-300">Countdown Windows:</label>
            <div className="flex flex-wrap gap-3.5 text-xs text-zinc-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-zinc-700 bg-zinc-950 text-zinc-100 accent-zinc-100"
                  checked={notifyDays.includes(7)}
                  onChange={() => toggleDay(7)}
                />
                <span>7 Days</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-zinc-700 bg-zinc-950 text-zinc-100 accent-zinc-100"
                  checked={notifyDays.includes(3)}
                  onChange={() => toggleDay(3)}
                />
                <span>3 Days</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-zinc-700 bg-zinc-950 text-zinc-100 accent-zinc-100"
                  checked={notifyDays.includes(1)}
                  onChange={() => toggleDay(1)}
                />
                <span>24-48 Hours</span>
              </label>
            </div>
          </div>

          {/* Test & Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              onClick={handleTestPing}
              disabled={isTesting || !chatId.trim()}
              id="modal-test-ping-btn"
            >
              {isTesting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              <span>Test Bot Ping</span>
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg border border-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              disabled={isSubmitting}
              id="modal-submit-subscribe-btn"
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              <span>Activate Alerts</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
