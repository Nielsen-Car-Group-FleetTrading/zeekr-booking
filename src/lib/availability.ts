import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import type { Booking, TimeSlot } from '@/types';
import { config } from './config';

export function generateSlots(
  dateStr: string,
  windowStart?: string,
  windowEnd?: string
): TimeSlot[] {
  const tz = config.timezone;
  const slotMs = config.slotDuration * 60_000;
  const strideMs = (config.slotDuration + config.bufferDuration) * 60_000;

  const startStr = windowStart ?? config.businessHoursStart;
  const endStr = windowEnd ?? config.businessHoursEnd;

  const startUTC = fromZonedTime(`${dateStr}T${startStr}:00`, tz);
  const endUTC = fromZonedTime(`${dateStr}T${endStr}:00`, tz);

  const slots: TimeSlot[] = [];
  let current = startUTC.getTime();

  while (current + slotMs <= endUTC.getTime()) {
    const slotEndMs = current + slotMs;
    const startLabel = formatInTimeZone(new Date(current), tz, 'HH:mm');
    const endLabel = formatInTimeZone(new Date(slotEndMs), tz, 'HH:mm');

    slots.push({
      start: new Date(current).toISOString(),
      slut: new Date(slotEndMs).toISOString(),
      label: `${startLabel} – ${endLabel}`,
      available: true,
    });

    current += strideMs;
  }

  return slots;
}

export function filterAvailableSlots(slots: TimeSlot[], bookings: Booking[]): TimeSlot[] {
  const bufferMs = config.bufferDuration * 60_000;

  return slots.map((slot) => {
    const sStart = new Date(slot.start).getTime();
    const sEnd = new Date(slot.slut).getTime();

    const available = !bookings.some((b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = new Date(b.slut).getTime();
      return bStart < sEnd + bufferMs && bEnd > sStart - bufferMs;
    });

    return { ...slot, available };
  });
}

export function isSlotAvailable(slotStart: Date, slotEnd: Date, bookings: Booking[]): boolean {
  const bufferMs = config.bufferDuration * 60_000;
  const sStart = slotStart.getTime();
  const sEnd = slotEnd.getTime();

  return !bookings.some((b) => {
    const bStart = new Date(b.start).getTime();
    const bEnd = new Date(b.slut).getTime();
    return bStart < sEnd + bufferMs && bEnd > sStart - bufferMs;
  });
}
