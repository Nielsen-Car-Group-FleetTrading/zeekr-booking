'use client';

import { useEffect, useState } from 'react';
import type { Car, TimeSlot } from '@/types';

interface CarAvailability {
  car: Car;
  slots: TimeSlot[]; // only available slots
  loading: boolean;
  error: boolean;
}

interface Props {
  cars: Car[];   // cars that have a window for this date
  date: string;  // YYYY-MM-DD
  onSelect: (car: Car, slot: TimeSlot) => void;
}

export default function DayOverview({ cars, date, onSelect }: Props) {
  const [avail, setAvail] = useState<CarAvailability[]>(() =>
    cars.map((car) => ({ car, slots: [], loading: true, error: false }))
  );
  const [selected, setSelected] = useState<{ carId: string; slotStart: string } | null>(null);

  useEffect(() => {
    setSelected(null);
    setAvail(cars.map((car) => ({ car, slots: [], loading: true, error: false })));

    cars.forEach((car) => {
      fetch(`/api/availability?carId=${encodeURIComponent(car.id)}&date=${date}`)
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json() as Promise<TimeSlot[]>;
        })
        .then((slots) => {
          setAvail((prev) =>
            prev.map((ca) =>
              ca.car.id === car.id
                ? { ...ca, slots: slots.filter((s) => s.available), loading: false }
                : ca
            )
          );
        })
        .catch(() => {
          setAvail((prev) =>
            prev.map((ca) =>
              ca.car.id === car.id ? { ...ca, loading: false, error: true } : ca
            )
          );
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function handleSelect(car: Car, slot: TimeSlot) {
    setSelected({ carId: car.id, slotStart: slot.start });
    onSelect(car, slot);
  }

  const totalAvailable = avail.reduce((n, ca) => n + ca.slots.length, 0);
  const allLoaded = avail.every((ca) => !ca.loading);

  return (
    <div className="space-y-3">
      {avail.map(({ car, slots, loading, error }) => (
        <div key={car.id} className="border border-neutral-200">
          {/* Car header */}
          <div className="px-4 py-3 border-b border-neutral-100 flex items-baseline gap-2">
            <span className="font-semibold text-sm">{car.navn}</span>
            {car.model && <span className="text-xs text-neutral-400">{car.model}</span>}
            <span className="text-xs font-mono text-neutral-400 ml-auto shrink-0">{car.regNr}</span>
          </div>

          {/* Slots */}
          <div className="px-4 py-3">
            {loading && (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-9 w-16 bg-neutral-100 animate-pulse rounded-none" />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="text-xs text-red-400">Kunne ikke hente tider.</p>
            )}

            {!loading && !error && slots.length === 0 && (
              <p className="text-xs text-neutral-400">Ingen ledige tider denne dag.</p>
            )}

            {!loading && !error && slots.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const isSelected =
                    selected?.carId === car.id && selected?.slotStart === slot.start;
                  const startLabel = slot.label.split('–')[0].trim();
                  return (
                    <button
                      key={slot.start}
                      onClick={() => handleSelect(car, slot)}
                      className={`text-sm font-medium px-3 py-2 border transition-colors ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 text-neutral-800 hover:border-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {startLabel}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {allLoaded && totalAvailable === 0 && (
        <p className="text-sm text-neutral-400 text-center pt-2">
          Alle tider er optaget denne dag. Vælg en anden dato.
        </p>
      )}
    </div>
  );
}
