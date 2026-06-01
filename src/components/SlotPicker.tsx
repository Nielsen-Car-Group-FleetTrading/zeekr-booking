'use client';

import { useEffect, useState } from 'react';
import type { TimeSlot } from '@/types';

interface Props {
  carId: string;
  date: string;
  onSelect: (slot: TimeSlot) => void;
}

export default function SlotPicker({ carId, date, onSelect }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setSelected(null);

    fetch(`/api/availability?carId=${encodeURIComponent(carId)}&date=${date}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<TimeSlot[]>;
      })
      .then((data) => setSlots(data))
      .catch(() => setError('Kunne ikke hente ledige tider. Prøv igen.'))
      .finally(() => setLoading(false));
  }, [carId, date]);

  function handleSelect(slot: TimeSlot) {
    if (!slot.available) return;
    setSelected(slot.start);
    onSelect(slot);
  }

  const availableCount = slots.filter((s) => s.available).length;

  // Format date label
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div>
      <div className="text-sm text-neutral-500 mb-5">
        Ledige tider{' '}
        <span className="text-black font-medium capitalize">{dateLabel}</span>:
      </div>

      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-neutral-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && slots.length === 0 && (
        <div className="border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
          Ingen tider tilgængelige denne dag.
        </div>
      )}

      {!loading && !error && slots.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.start}
                onClick={() => handleSelect(slot)}
                disabled={!slot.available}
                className={`h-12 text-sm font-medium border transition-colors ${
                  !slot.available
                    ? 'border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed line-through'
                    : selected === slot.start
                    ? 'border-2 border-black bg-black text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                {slot.label.split('–')[0].trim()}
              </button>
            ))}
          </div>
          {availableCount === 0 && (
            <p className="text-sm text-neutral-400 mt-4 text-center">
              Alle tider er optaget denne dag. Vælg en anden dato.
            </p>
          )}
        </>
      )}
    </div>
  );
}
