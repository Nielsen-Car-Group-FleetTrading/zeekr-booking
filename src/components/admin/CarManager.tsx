'use client';

import { useState } from 'react';
import type { Car } from '@/types';
import CarForm from './CarForm';
import AvailabilityManager from './AvailabilityManager';

interface Props {
  initialCars: Car[];
}

export default function CarManager({ initialCars }: Props) {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [availabilityId, setAvailabilityId] = useState<string | null>(null);
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

  function handleAvailabilityUpdated(car: Car) {
    setCars((prev) => prev.map((c) => (c.id === car.id ? car : c)));
  }

  function toggleAvailability(id: string) {
    setAvailabilityId((prev) => (prev === id ? null : id));
    setEditingId(null);
  }

  function toggleEdit(id: string) {
    setEditingId((prev) => (prev === id ? null : id));
    setAvailabilityId(null);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="border border-neutral-200 divide-y divide-neutral-100">
        {cars.length === 0 && (
          <div className="p-8 text-center text-neutral-400 text-sm">Ingen biler endnu</div>
        )}

        {cars.map((car) => (
          <div key={car.id}>
            {/* Car row */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{car.navn}</span>
                  {car.model && (
                    <span className="text-xs text-neutral-400">{car.model}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 font-medium ${car.aktiv ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                    {car.aktiv ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-0.5 font-mono">{car.regNr}</div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleEdit(car.id)}
                  className={`text-xs px-2 py-1 transition-colors ${editingId === car.id ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'}`}
                >
                  Rediger
                </button>
                <button
                  onClick={() => toggleAvailability(car.id)}
                  className={`text-xs px-2 py-1 transition-colors ${availabilityId === car.id ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'}`}
                >
                  Tilgængelighed
                  {car.tilgængelighed.length > 0 && (
                    <span className="ml-1 text-neutral-400">({car.tilgængelighed.length})</span>
                  )}
                </button>
                <button
                  onClick={() => handleToggleActive(car)}
                  disabled={loadingId === car.id}
                  className="text-xs text-neutral-500 hover:text-black transition-colors px-2 py-1 disabled:opacity-40"
                >
                  {loadingId === car.id ? '…' : car.aktiv ? 'Deaktiver' : 'Aktiver'}
                </button>
              </div>
            </div>

            {/* Edit form */}
            {editingId === car.id && (
              <div className="px-5 pb-5 bg-neutral-50 border-t border-neutral-100">
                <div className="pt-4">
                  <CarForm car={car} onSave={handleUpdated} onCancel={() => setEditingId(null)} />
                </div>
              </div>
            )}

            {/* Availability manager */}
            {availabilityId === car.id && (
              <div className="px-5 pb-5 bg-neutral-50 border-t border-neutral-100">
                <div className="pt-4">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                    Åbne vinduer — {car.navn}
                  </p>
                  <AvailabilityManager
                    car={car}
                    onUpdated={handleAvailabilityUpdated}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add car */}
      {showAddForm ? (
        <div className="border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold mb-4">Tilføj bil</h2>
          <CarForm onSave={handleCreated} onCancel={() => setShowAddForm(false)} />
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="btn-secondary w-full">
          + Tilføj bil
        </button>
      )}
    </div>
  );
}
