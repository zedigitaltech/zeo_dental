import React from 'react';
import { StatusBadge } from './StatusBadge';
import { useTranslation } from '../../hooks/useTranslation';
import { bookingAnswerRows } from './bookingAnswers';
import { Phone, Mail, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

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
  whatsapp_sent: boolean;
  confirmation_email_sent: boolean;
  created_at: string;
}

interface BookingCardProps {
  booking: Booking;
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onView: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onConfirm,
  onCancel,
  onView,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const timeLabels: Record<string, string> = {
      morning: t('booking.morning'),
      afternoon: t('booking.afternoon'),
      evening: t('booking.evening'),
    };
    return timeLabels[time] || time;
  };

  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';

  return (
    <div
      className={`bg-white border ${isPending ? 'border-amber-200' : 'border-gray-100'} p-5 hover:shadow-lg transition-all duration-300 cursor-pointer`}
      onClick={() => onView(booking)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-serif text-lg text-studio-black">{booking.name}</h3>
          <p className="text-studio-gray text-sm">{booking.service}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-studio-gray">
          <Phone className="w-3.5 h-3.5" />
          <span>{booking.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-studio-gray">
          <Mail className="w-3.5 h-3.5" />
          <span>{booking.email}</span>
        </div>
      </div>

      {/* Date/Time */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-studio-black">
          <Calendar className="w-3.5 h-3.5 text-studio-gold" />
          <span>
            {isConfirmed && booking.confirmed_date
              ? formatDate(booking.confirmed_date)
              : formatDate(booking.preferred_date)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-studio-black">
          <Clock className="w-3.5 h-3.5 text-studio-gold" />
          <span>
            {isConfirmed && booking.confirmed_time
              ? booking.confirmed_time
              : formatTime(booking.preferred_time)}
          </span>
        </div>
      </div>

      {/* Meta-form answers */}
      {bookingAnswerRows(booking, t).length > 0 && (
        <dl className="grid grid-cols-1 gap-1 mb-4 text-xs">
          {bookingAnswerRows(booking, t).map(r => (
            <div key={r.key} className="flex gap-2">
              <dt className="text-studio-gray">{r.label}:</dt>
              <dd className="text-studio-black font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Notification Status */}
      {isConfirmed && (
        <div className="flex gap-3 mb-4 text-xs">
          {booking.whatsapp_sent && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" /> WhatsApp
            </span>
          )}
          {booking.confirmation_email_sent && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" /> Email
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={e => {
              e.stopPropagation();
              onConfirm(booking);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-studio-black text-white py-2.5 text-xs uppercase tracking-ultra hover:bg-studio-gold transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {t('receptionist.actions.confirm')}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onCancel(booking);
            }}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-studio-gray py-2.5 text-xs uppercase tracking-ultra hover:border-red-300 hover:text-red-500 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            {t('receptionist.actions.cancel')}
          </button>
        </div>
      )}

      {/* Notes preview */}
      {booking.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-studio-gray line-clamp-2">
            <span className="font-semibold">{t('receptionist.booking.notes')}:</span>{' '}
            {booking.notes}
          </p>
        </div>
      )}
    </div>
  );
};
