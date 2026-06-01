'use client';

import { useState, FormEvent } from 'react';
import type { Car, TimeSlot, Booking } from '@/types';

interface Props {
  car: Car;
  slot: TimeSlot;
  onConfirmed: (booking: Booking) => void;
}

export default function BookingForm({ car, slot, onConfirmed }: Props) {
  const [navn, setNavn] = useState('');
  const [email, setEmail] = useState('');
  const [mobil, setMobil] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const slotDate = new Date(slot.start).toLocaleDateString('da-DK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navn,
          email,
          mobil,
          bilId: car.id,
          start: slot.start,
          slut: slot.slut,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Booking mislykkedes. Prøv igen.');
        return;
      }

      onConfirmed({ ...data, bilNavn: car.navn, bilRegNr: car.regNr } as Booking);
    } catch {
      setError('Netværksfejl. Tjek din forbindelse og prøv igen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Summary */}
      <div className="border border-neutral-200 p-4 mb-6 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-neutral-500">Bil</span>
          <span className="font-medium">
            {car.navn}{car.model ? ` ${car.model}` : ''} · {car.regNr}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Dato</span>
          <span className="font-medium capitalize">{slotDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Tid</span>
          <span className="font-medium">{slot.label}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Fulde navn *</label>
          <input
            type="text"
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            placeholder="Dit navn"
            className="input-field"
            required
            minLength={2}
            disabled={loading}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-1">E-mailadresse *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.dk"
            className="input-field"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-1">Mobilnummer *</label>
          <input
            type="tel"
            value={mobil}
            onChange={(e) => setMobil(e.target.value)}
            placeholder="+45 xx xx xx xx"
            className="input-field"
            required
            minLength={8}
            disabled={loading}
            autoComplete="tel"
          />
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <p className="text-xs text-neutral-400">
          Du modtager en bekræftelsesmail på den angivne adresse.
        </p>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Bekræfter booking…' : 'Bekræft booking'}
        </button>
      </form>
    </div>
  );
}
