'use client';

import type { Car } from '@/types';

interface Props {
  cars: Car[];
  onSelect: (car: Car) => void;
}

export default function CarSelector({ cars, onSelect }: Props) {
  return (
    <div>
      <p className="text-sm text-neutral-500 mb-5">Vælg den bil du ønsker at prøvekøre:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {cars.map((car) => (
          <button
            key={car.id}
            onClick={() => onSelect(car)}
            className="card text-left group transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-sm text-black group-hover:text-black">
                  {car.navn}
                </div>
                {car.model && (
                  <div className="text-xs text-neutral-400 mt-0.5">{car.model}</div>
                )}
                <div className="text-xs text-neutral-500 font-mono mt-2">{car.regNr}</div>
              </div>
              <span className="text-neutral-300 group-hover:text-black transition-colors mt-0.5">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
