import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { StatusBadge } from './StatusBadge';
import { bookingAnswerRows } from './bookingAnswers';
import { X, Phone, Mail, MessageCircle, CheckCircle } from 'lucide-react';

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
  treatment_interest?: string | null;
  has_xray?: boolean | null;
  travel_timeframe?: string | null;
  created_at: string;
}

interface BookingDetailModalProps {
  booking: Booking;
  mode: 'view' | 'confirm' | 'cancel';
  onClose: () => void;
  onConfirm: (data: {
    confirmed_date: string;
    confirmed_time: string;
    send_whatsapp: boolean;
    send_email: boolean;
  }) => Promise<void>;
  onCancel: (data: { reason: string; notify_patient: boolean }) => Promise<void>;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  mode,
  onClose,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Confirm form state
  const [confirmedDate, setConfirmedDate] = useState(booking.preferred_date);
  const [confirmedTime, setConfirmedTime] = useState('10:00');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  // Cancel form state
  const [cancelReason, setCancelReason] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sq-AL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm({
        confirmed_date: confirmedDate,
        confirmed_time: confirmedTime,
        send_whatsapp: sendWhatsApp,
        send_email: sendEmail,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel({
        reason: cancelReason,
        notify_patient: notifyPatient,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-2xl text-studio-black">
              {mode === 'confirm' && t('receptionist.confirm.title')}
              {mode === 'cancel' && t('receptionist.cancel.title')}
              {mode === 'view' && booking.name}
            </h2>
            {mode !== 'view' && <p className="text-studio-gray text-sm mt-1">{booking.name}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-studio-gray hover:text-studio-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-ultra text-studio-gray">
                {t('receptionist.booking.service')}
              </span>
              <span className="font-serif text-studio-black">{booking.service}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-ultra text-studio-gray">
                {t('receptionist.booking.phone')}
              </span>
              <a
                href={`tel:${booking.phone}`}
                className="flex items-center gap-2 text-studio-black hover:text-studio-gold"
              >
                <Phone className="w-3.5 h-3.5" />
                {booking.phone}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-ultra text-studio-gray">
                {t('receptionist.booking.email')}
              </span>
              <a
                href={`mailto:${booking.email}`}
                className="flex items-center gap-2 text-studio-black hover:text-studio-gold"
              >
                <Mail className="w-3.5 h-3.5" />
                {booking.email}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-ultra text-studio-gray">
                {t('receptionist.booking.preferred')}
              </span>
              <span className="text-studio-black">
                {formatDate(booking.preferred_date)} • {booking.preferred_time}
              </span>
            </div>
            {bookingAnswerRows(booking, t).map(r => (
              <div key={r.key} className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-ultra text-studio-gray">{r.label}</span>
                <span className="text-studio-black text-right">{r.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-ultra text-studio-gray">
                {t('receptionist.booking.status')}
              </span>
              <StatusBadge status={booking.status} />
            </div>
          </div>

          {booking.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <span className="text-xs uppercase tracking-ultra text-studio-gray block mb-2">
                {t('receptionist.booking.notes')}
              </span>
              <p className="text-studio-black text-sm">{booking.notes}</p>
            </div>
          )}

          {/* Confirm Form */}
          {mode === 'confirm' && (
            <div className="space-y-6 border-t border-gray-100 pt-6">
              <div>
                <label className="text-xs uppercase tracking-ultra text-studio-gray block mb-2">
                  {t('receptionist.confirm.date')}
                </label>
                <input
                  type="date"
                  value={confirmedDate}
                  onChange={e => setConfirmedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 p-3 focus:outline-none focus:border-studio-gold transition-colors"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-ultra text-studio-gray block mb-2">
                  {t('receptionist.confirm.time')}
                </label>
                <select
                  value={confirmedTime}
                  onChange={e => setConfirmedTime(e.target.value)}
                  className="w-full border border-gray-200 p-3 focus:outline-none focus:border-studio-gold transition-colors"
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={e => setSendWhatsApp(e.target.checked)}
                    className="w-5 h-5 accent-studio-gold"
                  />
                  <span className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    {t('receptionist.confirm.sendWhatsApp')}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={e => setSendEmail(e.target.checked)}
                    className="w-5 h-5 accent-studio-gold"
                  />
                  <span className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {t('receptionist.confirm.sendEmail')}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Cancel Form */}
          {mode === 'cancel' && (
            <div className="space-y-6 border-t border-gray-100 pt-6">
              <div>
                <label className="text-xs uppercase tracking-ultra text-studio-gray block mb-2">
                  {t('receptionist.cancel.reason')}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 p-3 focus:outline-none focus:border-studio-gold transition-colors resize-none"
                  placeholder="..."
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyPatient}
                  onChange={e => setNotifyPatient(e.target.checked)}
                  className="w-5 h-5 accent-studio-gold"
                />
                <span className="text-sm">{t('receptionist.cancel.notify')}</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 py-3 text-studio-gray text-xs uppercase tracking-ultra hover:border-studio-black hover:text-studio-black transition-colors"
          >
            {mode === 'view' ? t('receptionist.actions.close') : t('receptionist.actions.cancel')}
          </button>

          {mode === 'confirm' && (
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-studio-black text-white py-3 text-xs uppercase tracking-ultra hover:bg-studio-gold transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                '...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t('receptionist.confirm.submit')}
                </>
              )}
            </button>
          )}

          {mode === 'cancel' && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 text-xs uppercase tracking-ultra hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : t('receptionist.cancel.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
