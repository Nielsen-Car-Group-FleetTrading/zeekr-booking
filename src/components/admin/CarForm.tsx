'use client';

import { useState, FormEvent } from 'react';
import type { Car } from '@/types';

interface Props {
  car?: Car;
  onSave: (car: Car) => void;
  onCancel: () => void;
}

export default function CarForm({ car, onSave, onCancel }: Props) {
  const [navn, setNavn] = useState(car?.navn ?? '');
  const [regNr, setRegNr] = useState(car?.regNr ?? '');
  const [model, setModel] = useState(car?.model ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = car ? `/api/cars/${car.id}` : '/api/cars';
      const method = car ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ navn, regNr, model }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Fejl ved gemning');
        return;
      }

      const saved: Car = await res.json();
      onSave(saved);
    } catch {
      setError('Netværksfejl. Prøv igen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Navn *</label>
          <input
            type="text"
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            placeholder="fx Zeekr 001"
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Reg.nr *</label>
          <input
            type="text"
            value={regNr}
            onChange={(e) => setRegNr(e.target.value.toUpperCase())}
            placeholder="AB 12 345"
            className="input-field font-mono uppercase"
            required
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Model (valgfri)</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="fx Long Range AWD"
          className="input-field"
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Gemmer…' : car ? 'Gem ændringer' : 'Opret bil'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
          Annuller
        </button>
      </div>
    </form>
  );
}
