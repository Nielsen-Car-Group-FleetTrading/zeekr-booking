'use client';

import { useEffect, useState } from 'react';
import type { Car, TimeSlot } from '@/types';

interface Props {
  car: Car;
  date: string;
  onSelect: (slot: TimeSlot) => void;
}

export default function SlotPicker({ car, date, onSelect }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setSelected(null);

    fetch(`/api/availability?carId=${encodeURIComponent(car.id)}&date=${date}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<TimeSlot[]>;
      })
      .then((data) => setSlots(data))
      .catch(() => setError('Kunne ikke hente ledige tider. Prøv igen.'))
      .finally(() => setLoading(false));
  }, [car.id, date]);

  function handleSelect(slot: TimeSlot) {
    if (!slot.available) return;
    setSelected(slot.start);
    onSelect(slot);
  }

  const availableCount = slots.filter((s) => s.available).length;

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div>
      {/* Header: bil + dato */}
      <div className="border border-neutral-200 px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <span className="font-semibold text-sm">{car.navn}</span>
          {car.model && <span className="text-neutral-400 text-sm"> {car.model}</span>}
          <span className="text-xs text-neutral-400 font-mono ml-2">{car.regNr}</span>
        </div>
        <span className="text-sm text-neutral-500 capitalize">{dateLabel}</span>
      </div>

      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-neutral-100 animate-pulse" />
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
                className={`h-14 flex flex-col items-center justify-center text-xs font-medium border transition-colors ${
                  !slot.available
                    ? 'border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed'
                    : selected === slot.start
                    ? 'border-2 border-black bg-black text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-500'
                }`}
              >
                <span className={`font-semibold ${!slot.available ? 'text-neutral-300' : selected === slot.start ? 'text-white' : 'text-neutral-900'}`}>
                  {slot.label.split('–')[0].trim()}
                </span>
                <span className={`text-[10px] mt-0.5 ${!slot.available ? 'text-neutral-200' : selected === slot.start ? 'text-neutral-300' : 'text-neutral-400'}`}>
                  – {slot.label.split('–')[1]?.trim()}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-neutral-200 bg-white inline-block" />
              Ledig ({availableCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-neutral-100 inline-block" />
              Optaget ({slots.length - availableCount})
            </span>
          </div>

          {availableCount === 0 && (
            <p className="text-sm text-neutral-400 mt-3 text-center">
              Alle tider er optaget denne dag. Vælg en anden dato.
            </p>
          )}
        </>
      )}
    </div>
  );
}
