'use client';

import { useState } from 'react';
import type { Car, Booking } from '@/types';
import CarManager from './CarManager';
import BookingManager from './BookingManager';

interface Props {
  cars: Car[];
  bookings: Booking[];
}

type Tab = 'bookinger' | 'biler';

export default function AdminTabs({ cars, bookings }: Props) {
  const [tab, setTab] = useState<Tab>('bookinger');

  const upcomingCount = bookings.filter(
    (b) => new Date(b.start).getTime() >= Date.now() && b.status === 'Bekræftet'
  ).length;

  return (
    <div>
      {/* Tab nav */}
      <div className="flex gap-0 border-b border-neutral-200 mb-8">
        {([
          { key: 'bookinger', label: `Bookinger${upcomingCount > 0 ? ` (${upcomingCount})` : ''}` },
          { key: 'biler', label: 'Biler' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'bookinger' && <BookingManager initialBookings={bookings} />}
      {tab === 'biler' && <CarManager initialCars={cars} />}
    </div>
  );
}
