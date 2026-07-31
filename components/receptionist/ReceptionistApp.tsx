import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ReceptionistLogin } from './ReceptionistLogin';
import { BookingCard } from './BookingCard';
import { BookingDetailModal } from './BookingDetailModal';
import { CalendarView } from './CalendarView';
import {
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Bell,
  Volume2,
  VolumeX,
  LayoutGrid,
  Calendar,
} from 'lucide-react';

// Auto-refresh interval (1 second for real-time updates)
const REFRESH_INTERVAL = 1000;

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  notes: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  whatsapp_sent: boolean;
  confirmation_email_sent: boolean;
  created_at: string;
}

interface DashboardStats {
  pending_count: number;
  today_count: number;
  week_count: number;
  confirmed_today: number;
}

interface ChatStats {
  today: { tokens: number; cost: number; messages: number };
  week: { tokens: number; cost: number; messages: number };
  month: { tokens: number; cost: number; messages: number };
  total: { tokens: number; cost: number; messages: number };
}

export const ReceptionistApp: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('receptionist_token')
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'confirm' | 'cancel'>('view');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasNewBooking, setHasNewBooking] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const previousPendingCount = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio(
      'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'
    );
    // Use a simple beep sound from Web Audio API instead
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.log('Could not play notification sound');
    }
  }, [soundEnabled]);

  // Auth handlers
  const handleLogin = (newToken: string) => {
    sessionStorage.setItem('receptionist_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('receptionist_token');
    setToken(null);
  };

  // API helpers
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        handleLogout();
        throw new Error('Unauthorized');
      }

      return response;
    },
    [token]
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/receptionist/stats');
      const data = await response.json();

      // Check if there are new pending bookings
      if (previousPendingCount.current > 0 && data.pending_count > previousPendingCount.current) {
        // New booking arrived!
        playNotificationSound();
        setHasNewBooking(true);
        // Clear the indicator after 5 seconds
        setTimeout(() => setHasNewBooking(false), 5000);
      }
      previousPendingCount.current = data.pending_count;

      setStats(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [fetchWithAuth, playNotificationSound]);

  // Fetch chat stats
  const fetchChatStats = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/receptionist/chat-stats');
      const data = await response.json();
      setChatStats(data);
    } catch (err) {
      console.error('Failed to fetch chat stats:', err);
    }
  }, [fetchWithAuth]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetchWithAuth(`/api/receptionist/bookings?${params}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, statusFilter, searchQuery]);

  // Load data on mount and set up polling
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchChatStats();
      fetchBookings();

      // Poll every 15 seconds for new bookings
      const interval = setInterval(() => {
        fetchStats();
        fetchBookings();
      }, REFRESH_INTERVAL);

      // Poll chat stats every minute (less frequent)
      const chatInterval = setInterval(() => {
        fetchChatStats();
      }, 60000);

      return () => {
        clearInterval(interval);
        clearInterval(chatInterval);
      };
    }
  }, [token, fetchStats, fetchChatStats, fetchBookings]);

  // Refetch when filters change
  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [statusFilter, searchQuery, token, fetchBookings]);

  // Confirm booking handler
  const handleConfirmBooking = async (data: {
    confirmed_date: string;
    confirmed_time: string;
    send_whatsapp: boolean;
    send_email: boolean;
  }) => {
    if (!selectedBooking) return;

    const response = await fetchWithAuth(
      `/api/receptionist/bookings/${selectedBooking.id}/confirm`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (result.success) {
      setSelectedBooking(null);
      fetchBookings();
      fetchStats();
    }
  };

  // Cancel booking handler
  const handleCancelBooking = async (data: { reason: string; notify_patient: boolean }) => {
    if (!selectedBooking) return;

    const response = await fetchWithAuth(
      `/api/receptionist/bookings/${selectedBooking.id}/cancel`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (result.success) {
      setSelectedBooking(null);
      fetchBookings();
      fetchStats();
    }
  };

  // Show login if not authenticated
  if (!token) {
    return <ReceptionistLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-2xl text-studio-black">
                ZEO<span className="text-studio-gold">.</span>
              </h1>
              <span className="hidden sm:block text-xs uppercase tracking-ultra text-studio-gray">
                {t('receptionist.title')}
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* New booking alert */}
              {hasNewBooking && (
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full animate-pulse">
                  <Bell className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    {t('receptionist.header.newBooking')}
                  </span>
                </div>
              )}

              {/* Pending notification */}
              {stats && stats.pending_count > 0 && !hasNewBooking && (
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                  <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold text-amber-700">
                    {stats.pending_count} {t('receptionist.header.pending')}
                  </span>
                </div>
              )}

              {/* Last update time */}
              {lastUpdate && (
                <span className="hidden md:block text-[10px] text-studio-gray">
                  {t('receptionist.header.lastUpdate')}: {lastUpdate.toLocaleTimeString()}
                </span>
              )}

              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded transition-colors ${
                  soundEnabled
                    ? 'text-studio-gold hover:text-studio-black'
                    : 'text-studio-gray hover:text-studio-black'
                }`}
                title={
                  soundEnabled
                    ? t('receptionist.header.soundOn')
                    : t('receptionist.header.soundOff')
                }
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Language toggle */}
              <button
                onClick={() => setLanguage(language === 'sq' ? 'en' : 'sq')}
                className="text-xs uppercase tracking-ultra text-studio-gray hover:text-studio-black transition-colors"
              >
                {language === 'sq' ? 'EN' : 'SQ'}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs uppercase tracking-ultra text-studio-gray hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('receptionist.header.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 border border-gray-100">
              <p className="text-xs uppercase tracking-ultra text-studio-gray mb-1">
                {t('receptionist.stats.pending')}
              </p>
              <p className="font-serif text-3xl text-studio-black">{stats.pending_count}</p>
            </div>
            <div className="bg-white p-5 border border-gray-100">
              <p className="text-xs uppercase tracking-ultra text-studio-gray mb-1">
                {t('receptionist.stats.today')}
              </p>
              <p className="font-serif text-3xl text-studio-black">{stats.today_count}</p>
            </div>
            <div className="bg-white p-5 border border-gray-100">
              <p className="text-xs uppercase tracking-ultra text-studio-gray mb-1">
                {t('receptionist.stats.thisWeek')}
              </p>
              <p className="font-serif text-3xl text-studio-black">{stats.week_count}</p>
            </div>
            <div className="bg-white p-5 border border-gray-100">
              <p className="text-xs uppercase tracking-ultra text-studio-gray mb-1">
                {t('receptionist.stats.confirmedToday')}
              </p>
              <p className="font-serif text-3xl text-studio-black">{stats.confirmed_today}</p>
            </div>
            {/* Chat Stats Card */}
            {chatStats && (
              <div className="bg-white p-5 border border-gray-100">
                <p className="text-xs uppercase tracking-ultra text-studio-gray mb-1">
                  Chatbot (Month)
                </p>
                <p className="font-serif text-3xl text-studio-black">
                  {chatStats.month.cost < 0.01 ? `< $0.01` : `$${chatStats.month.cost.toFixed(2)}`}
                </p>
                <p className="text-xs text-studio-gray mt-1">
                  {chatStats.month.messages} msgs • {chatStats.month.tokens.toLocaleString()} tokens
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-studio-gray" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-studio-gold transition-colors"
            >
              <option value="">{t('receptionist.filters.all')}</option>
              <option value="pending">{t('receptionist.filters.pending')}</option>
              <option value="confirmed">{t('receptionist.filters.confirmed')}</option>
              <option value="cancelled">{t('receptionist.filters.cancelled')}</option>
              <option value="completed">{t('receptionist.filters.completed')}</option>
              <option value="no_show">{t('receptionist.filters.noShow')}</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-studio-gray" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('receptionist.filters.search')}
              className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-studio-gold transition-colors"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-ultra transition-colors ${
                viewMode === 'list'
                  ? 'bg-studio-black text-white'
                  : 'text-studio-gray hover:text-studio-black'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'sq' ? 'Listë' : 'List'}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-ultra transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-studio-black text-white'
                  : 'text-studio-gray hover:text-studio-black'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{t('receptionist.header.calendar')}</span>
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              fetchStats();
              fetchBookings();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-ultra text-studio-gray hover:text-studio-black transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('receptionist.actions.refresh')}
          </button>
        </div>

        {/* Bookings Display */}
        {isLoading && bookings.length === 0 ? (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-studio-gray animate-spin mx-auto mb-4" />
            <p className="text-studio-gray">{t('receptionist.loading')}</p>
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView
            bookings={bookings}
            onSelectBooking={b => {
              setSelectedBooking(b);
              setModalMode('view');
            }}
          />
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100">
            <p className="text-studio-gray">{t('receptionist.noBookings')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onView={b => {
                  setSelectedBooking(b);
                  setModalMode('view');
                }}
                onConfirm={b => {
                  setSelectedBooking(b);
                  setModalMode('confirm');
                }}
                onCancel={b => {
                  setSelectedBooking(b);
                  setModalMode('cancel');
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          mode={modalMode}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
};

export default ReceptionistApp;
