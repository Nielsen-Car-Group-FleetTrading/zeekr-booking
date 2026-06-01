'use client';

import { useState } from 'react';
import type { Car, TimeSlot, Booking } from '@/types';
import CarSelector from './CarSelector';
import DatePicker from './DatePicker';
import SlotPicker from './SlotPicker';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';

type Step = 'car' | 'date' | 'slots' | 'form' | 'confirmation';

interface Props {
  initialCars: Car[];
}

const STEP_LABELS: Record<Step, string> = {
  car: 'Vælg bil',
  date: 'Vælg dato',
  slots: 'Vælg tid',
  form: 'Dine oplysninger',
  confirmation: 'Bekræftet',
};

const STEPS: Step[] = ['car', 'date', 'slots', 'form', 'confirmation'];
const VISIBLE_STEPS: Step[] = ['car', 'date', 'slots', 'form'];

export default function BookingFlow({ initialCars }: Props) {
  const [step, setStep] = useState<Step>('car');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  function handleSelectCar(car: Car) {
    setSelectedCar(car);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep('date');
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('slots');
  }

  function handleSelectSlot(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep('form');
  }

  function handleBookingConfirmed(booking: Booking) {
    setConfirmedBooking(booking);
    setStep('confirmation');
  }

  function handleReset() {
    setStep('car');
    setSelectedCar(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setConfirmedBooking(null);
  }

  const currentStepIndex = VISIBLE_STEPS.indexOf(step);

  if (initialCars.length === 0 && step === 'car') {
    return (
      <div className="border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
        Ingen biler er tilgængelige i øjeblikket. Prøv igen senere.
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      {step !== 'confirmation' && (
        <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-1">
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

      {/* Step content */}
      {step === 'car' && (
        <CarSelector cars={initialCars} onSelect={handleSelectCar} />
      )}

      {step === 'date' && selectedCar && (
        <div>
          <BackButton onClick={() => setStep('car')} />
          <div className="mt-4 mb-2 text-sm text-neutral-500">
            Bil: <span className="text-black font-medium">{selectedCar.navn}</span>
            {selectedCar.model && <span className="text-neutral-400"> {selectedCar.model}</span>}
          </div>
          <DatePicker onSelect={handleSelectDate} />
        </div>
      )}

      {step === 'slots' && selectedCar && selectedDate && (
        <div>
          <BackButton onClick={() => setStep('date')} />
          <SlotPicker
            carId={selectedCar.id}
            date={selectedDate}
            onSelect={handleSelectSlot}
          />
        </div>
      )}

      {step === 'form' && selectedCar && selectedDate && selectedSlot && (
        <div>
          <BackButton onClick={() => setStep('slots')} />
          <BookingForm
            car={selectedCar}
            slot={selectedSlot}
            onConfirmed={handleBookingConfirmed}
          />
        </div>
      )}

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
