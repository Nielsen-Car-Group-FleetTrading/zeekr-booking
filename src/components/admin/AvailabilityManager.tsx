'use client';

import { useState, FormEvent } from 'react';
import type { Car, AvailabilityWindow } from '@/types';

interface Props {
  car: Car;
  onUpdated: (car: Car) => void;
}

const DAY_NAMES: Record<number, string> = { 1: 'Man', 2: 'Tir', 3: 'Ons', 4: 'Tor', 5: 'Fre', 6: 'Lør', 7: 'Søn' };
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function formatWindowDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay(); // 0=Sun
  const isoDay = dow === 0 ? 7 : dow;
  return `${DAY_NAMES[isoDay]} ${d}. ${MONTH_NAMES[m - 1]}`;
}

function sortWindows(windows: AvailabilityWindow[]): AvailabilityWindow[] {
  return [...windows].sort((a, b) => a.date.localeCompare(b.date));
}

async function saveWindows(carId: string, windows: AvailabilityWindow[]): Promise<Car> {
  const res = await fetch(`/api/cars/${carId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tilgængelighed: windows }),
  });
  if (!res.ok) throw new Error('Gem fejlede');
  return res.json() as Promise<Car>;
}

export default function AvailabilityManager({ car, onUpdated }: Props) {
  const [windows, setWindows] = useState<AvailabilityWindow[]>(() =>
    sortWindows(car.tilgængelighed)
  );
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [start, setStart] = useState(
    process.env.NEXT_PUBLIC_BUSINESS_HOURS_START ?? '09:00'
  );
  const [end, setEnd] = useState(
    process.env.NEXT_PUBLIC_BUSINESS_HOURS_END ?? '17:00'
  );
  const [saving, setSaving] = useState(false);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!date || !start || !end) return;
    if (start >= end) {
      setError('Starttid skal være før sluttid');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const newWindow: AvailabilityWindow = { date, start, end };
      // Replace if date already exists, otherwise append
      const updated = sortWindows([
        ...windows.filter((w) => w.date !== date),
        newWindow,
      ]);
      const saved = await saveWindows(car.id, updated);
      setWindows(sortWindows(saved.tilgængelighed));
      onUpdated(saved);
      setShowForm(false);
      setDate('');
    } catch {
      setError('Kunne ikke gemme. Prøv igen.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dateStr: string) {
    setDeletingDate(dateStr);
    setError('');
    try {
      const updated = windows.filter((w) => w.date !== dateStr);
      const saved = await saveWindows(car.id, updated);
      setWindows(sortWindows(saved.tilgængelighed));
      onUpdated(saved);
    } catch {
      setError('Kunne ikke slette. Prøv igen.');
    } finally {
      setDeletingDate(null);
    }
  }

  return (
    <div className="pt-1">
      {error && (
        <p className="text-red-500 text-xs mb-3">{error}</p>
      )}

      {/* Window list */}
      {windows.length === 0 ? (
        <p className="text-xs text-neutral-400 mb-3">Ingen vinduer defineret endnu.</p>
      ) : (
        <div className="divide-y divide-neutral-100 border border-neutral-200 mb-3">
          {windows.map((w) => (
            <div key={w.date} className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="text-neutral-700">
                <span className="font-medium">{formatWindowDate(w.date)}</span>
                <span className="text-neutral-400 ml-2">{w.start}–{w.end}</span>
              </span>
              <button
                onClick={() => handleDelete(w.date)}
                disabled={deletingDate === w.date}
                className="text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-40 ml-4 shrink-0"
              >
                {deletingDate === w.date ? '…' : '× Slet'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <form onSubmit={handleAdd} className="border border-neutral-200 p-3 space-y-3 bg-neutral-50">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs text-neutral-500 mb-1">Dato *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field text-sm h-10"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Start *</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="input-field text-sm h-10"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Slut *</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="input-field text-sm h-10"
                required
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs h-9 px-4" disabled={saving}>
              {saving ? 'Gemmer…' : 'Tilføj vindue'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="btn-secondary text-xs h-9 px-4"
              disabled={saving}
            >
              Annuller
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-neutral-500 hover:text-black transition-colors border border-dashed border-neutral-300 hover:border-neutral-500 px-3 py-2 w-full text-center"
        >
          + Tilføj vindue
        </button>
      )}
    </div>
  );
}
