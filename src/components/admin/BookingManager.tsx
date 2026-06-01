'use client';

import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import type { Booking } from '@/types';

interface Props {
  initialBookings: Booking[];
}

const TZ = 'Europe/Copenhagen';

function fmt(iso: string | undefined) {
  if (!iso) return '—';
  return formatInTimeZone(new Date(iso), TZ, 'dd/MM/yy HH:mm');
}

function sortBookings(bookings: Booking[]): Booking[] {
  const now = Date.now();
  const upcoming = bookings
    .filter((b) => new Date(b.start).getTime() >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const past = bookings
    .filter((b) => new Date(b.start).getTime() < now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  return [...upcoming, ...past];
}

const TH = 'text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap';

export default function BookingManager({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(() => sortBookings(initialBookings));
  const [filter, setFilter] = useState<'kommende' | 'alle'>('kommende');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const now = Date.now();
  const visible =
    filter === 'kommende'
      ? bookings.filter((b) => new Date(b.start).getTime() >= now && b.status === 'Bekræftet')
      : bookings;

  async function handleCancel(booking: Booking) {
    if (!confirm(`Annuller booking for ${booking.navn}?`)) return;
    setLoadingId(booking.id);
    setError('');
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Annulleret' }),
      });
      if (!res.ok) throw new Error();
      const updated: Booking = await res.json();
      setBookings((prev) =>
        sortBookings(prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)))
      );
    } catch {
      setError('Kunne ikke annullere booking. Prøv igen.');
    } finally {
      setLoadingId(null);
    }
  }

  const upcomingCount = bookings.filter(
    (b) => new Date(b.start).getTime() >= now && b.status === 'Bekræftet'
  ).length;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 border border-neutral-200 p-0.5">
          {(['kommende', 'alle'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
              }`}
            >
              {f === 'kommende' ? `Kommende (${upcomingCount})` : 'Alle'}
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-400">{visible.length} bookinger</span>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {visible.length === 0 ? (
        <div className="border border-neutral-200 p-10 text-center text-neutral-400 text-sm">
          {filter === 'kommende' ? 'Ingen kommende bookinger' : 'Ingen bookinger'}
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className={TH}>Modtaget</th>
                <th className={TH}>Status</th>
                <th className={TH}>Bil</th>
                <th className={TH}>Navn</th>
                <th className={TH}>Email</th>
                <th className={TH}>Mobil</th>
                <th className={TH}>Start</th>
                <th className={TH}>Slut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visible.map((b) => {
                const isPast = new Date(b.start).getTime() < now;
                const isCancelled = b.status === 'Annulleret';
                const rowMuted = isPast || isCancelled;
                const muted = rowMuted ? 'text-neutral-400' : 'text-neutral-900';
                const mutedSub = rowMuted ? 'text-neutral-400' : 'text-neutral-600';
                const mono = `font-mono text-xs ${muted}`;

                return (
                  <tr
                    key={b.id}
                    className={`transition-colors ${rowMuted ? 'bg-neutral-50' : 'hover:bg-neutral-50'}`}
                  >
                    <td className={`px-4 py-3 whitespace-nowrap ${mono}`}>
                      {fmt(b.oprettet)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium ${
                        isCancelled ? 'bg-neutral-200 text-neutral-500'
                        : isPast ? 'bg-neutral-100 text-neutral-500'
                        : 'bg-black text-white'
                      }`}>
                        {isCancelled ? 'Annulleret' : isPast ? 'Afholdt' : 'Bekræftet'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${muted}`}>
                      <div className="font-medium">{b.bilNavn ?? '—'}</div>
                      <div className="text-xs font-mono text-neutral-400">{b.bilRegNr ?? ''}</div>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${muted}`}>{b.navn}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${mutedSub}`}>{b.email}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${mutedSub}`}>{b.mobil}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${mono}`}>{fmt(b.start)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${mono}`}>{fmt(b.slut)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {!isCancelled && !isPast && (
                        <button
                          onClick={() => handleCancel(b)}
                          disabled={loadingId === b.id}
                          className="text-xs text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          {loadingId === b.id ? '…' : 'Annuller'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
