'use client';

import { useState } from 'react';
import type { Car } from '@/types';
import CarForm from './CarForm';

interface Props {
  initialCars: Car[];
}

export default function CarManager({ initialCars }: Props) {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleToggleActive(car: Car) {
    setLoadingId(car.id);
    setError('');
    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktiv: !car.aktiv }),
      });
      if (!res.ok) throw new Error();
      const updated: Car = await res.json();
      setCars((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      setError('Kunne ikke opdatere bil. Prøv igen.');
    } finally {
      setLoadingId(null);
    }
  }

  function handleCreated(car: Car) {
    setCars((prev) => [...prev, car]);
    setShowAddForm(false);
  }

  function handleUpdated(car: Car) {
    setCars((prev) => prev.map((c) => (c.id === car.id ? car : c)));
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {/* Car list */}
      <div className="border border-neutral-200 divide-y divide-neutral-100">
        {cars.length === 0 && (
          <div className="p-8 text-center text-neutral-400 text-sm">Ingen biler endnu</div>
        )}

        {cars.map((car) =>
          editingId === car.id ? (
            <div key={car.id} className="p-5 bg-neutral-50">
              <CarForm
                car={car}
                onSave={handleUpdated}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div key={car.id} className="p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{car.navn}</span>
                  {car.model && (
                    <span className="text-xs text-neutral-400">{car.model}</span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 font-medium ${
                      car.aktiv
                        ? 'bg-black text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {car.aktiv ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-0.5 font-mono">{car.regNr}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(car.id)}
                  className="text-xs text-neutral-500 hover:text-black transition-colors px-2 py-1"
                >
                  Rediger
                </button>
                <button
                  onClick={() => handleToggleActive(car)}
                  disabled={loadingId === car.id}
                  className="text-xs text-neutral-500 hover:text-black transition-colors px-2 py-1 disabled:opacity-40"
                >
                  {loadingId === car.id
                    ? '…'
                    : car.aktiv
                    ? 'Deaktiver'
                    : 'Aktiver'}
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add car */}
      {showAddForm ? (
        <div className="border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold mb-4">Tilføj bil</h2>
          <CarForm onSave={handleCreated} onCancel={() => setShowAddForm(false)} />
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-secondary w-full"
        >
          + Tilføj bil
        </button>
      )}
    </div>
  );
}
