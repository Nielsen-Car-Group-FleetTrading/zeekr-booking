'use client';

import type { Booking, Car, TimeSlot } from '@/types';

interface Props {
  booking: Booking;
  car: Car;
  slot: TimeSlot;
  onReset: () => void;
}

export default function BookingConfirmation({ booking, car, slot, onReset }: Props) {
  const slotDate = new Date(slot.start).toLocaleDateString('da-DK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="text-center py-4">
      {/* Checkmark */}
      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 14l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Booking bekræftet!</h2>
      <p className="text-neutral-500 text-sm mb-8">
        Vi har sendt en bekræftelse til <strong>{booking.email}</strong>
      </p>

      {/* Details */}
      <div className="border border-neutral-200 text-left mb-8">
        <div className="p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Navn</span>
            <span className="font-medium">{booking.navn}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-neutral-500">Bil</span>
            <span className="font-medium">
              {car.navn}{car.model ? ` ${car.model}` : ''} · {car.regNr}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-neutral-500">Dato</span>
            <span className="font-medium capitalize">{slotDate}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-neutral-500">Tidspunkt</span>
            <span className="font-medium">{slot.label}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-neutral-500">Reference</span>
            <span className="font-mono text-xs text-neutral-400">{booking.id}</span>
          </div>
        </div>
      </div>

      <button onClick={onReset} className="btn-secondary w-full">
        Book en ny prøvekørsel
      </button>
    </div>
  );
}
