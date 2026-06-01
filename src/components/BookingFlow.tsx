'use client';

import { useMemo, useState } from 'react';
import type { Car, TimeSlot, Booking } from '@/types';
import DatePicker from './DatePicker';
import DayOverview from './DayOverview';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';

type Step = 'date' | 'overview' | 'form' | 'confirmation';

interface Props {
  initialCars: Car[];
}

const STEP_LABELS: Record<Step, string> = {
  date: 'Vælg dato',
  overview: 'Vælg tid',
  form: 'Dine oplysninger',
  confirmation: 'Bekræftet',
};

const VISIBLE_STEPS: Step[] = ['date', 'overview', 'form'];

export default function BookingFlow({ initialCars }: Props) {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Union of all cars' available dates, today or later
  const availableDates = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD in local time
    return Array.from(
      new Set(initialCars.flatMap((c) => c.tilgængelighed.map((w) => w.date)))
    )
      .filter((d) => d >= todayStr)
      .sort();
  }, [initialCars]);

  // Cars that have a window on the selected date
  const carsForDate = useMemo(
    () =>
      selectedDate
        ? initialCars.filter((c) => c.tilgængelighed.some((w) => w.date === selectedDate))
        : [],
    [initialCars, selectedDate]
  );

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedCar(null);
    setSelectedSlot(null);
    setStep('overview');
  }

  function handleSelectSlot(car: Car, slot: TimeSlot) {
    setSelectedCar(car);
    setSelectedSlot(slot);
    setStep('form');
  }

  function handleBookingConfirmed(booking: Booking) {
    setConfirmedBooking(booking);
    setStep('confirmation');
  }

  function handleReset() {
    setStep('date');
    setSelectedDate(null);
    setSelectedCar(null);
    setSelectedSlot(null);
    setConfirmedBooking(null);
  }

  const currentStepIndex = VISIBLE_STEPS.indexOf(step);

  if (availableDates.length === 0) {
    return (
      <div className="border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
        Ingen tider er tilgængelige i øjeblikket. Kontakt os for at aftale en tid.
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      {step !== 'confirmation' && (
        <div className="flex items-center mb-10 overflow-x-auto pb-1">
          {VISIBLE_STEPS.map((s, i) => (
            <div key={s} className="flex items-center shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    i < currentStepIndex
                      ? 'bg-black text-white'
                      : i === currentStepIndex
                      ? 'border-2 border-black text-black'
                      : 'border border-neutral-300 text-neutral-400'
                  }`}
                >
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${
                    i === currentStepIndex ? 'text-black font-medium' : 'text-neutral-400'
                  }`}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < VISIBLE_STEPS.length - 1 && (
                <div className="w-6 h-px bg-neutral-200 mx-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step: choose date */}
      {step === 'date' && (
        <DatePicker availableDates={availableDates} onSelect={handleSelectDate} />
      )}

      {/* Step: pick slot across all cars */}
      {step === 'overview' && selectedDate && (
        <div>
          <BackButton onClick={() => setStep('date')} />
          <div className="text-sm text-neutral-500 capitalize mb-5">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('da-DK', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <DayOverview
            cars={carsForDate}
            date={selectedDate}
            onSelect={handleSelectSlot}
          />
        </div>
      )}

      {/* Step: fill in details */}
      {step === 'form' && selectedCar && selectedSlot && (
        <div>
          <BackButton onClick={() => setStep('overview')} />
          <BookingForm
            car={selectedCar}
            slot={selectedSlot}
            onConfirmed={handleBookingConfirmed}
          />
        </div>
      )}

      {/* Confirmation */}
      {step === 'confirmation' && confirmedBooking && selectedCar && selectedSlot && (
        <BookingConfirmation
          booking={confirmedBooking}
          car={selectedCar}
          slot={selectedSlot}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black transition-colors mb-6"
    >
      ← Tilbage
    </button>
  );
}
