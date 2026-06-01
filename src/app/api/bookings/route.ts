import { NextResponse } from 'next/server';
import { getBookingsForCar, createBooking, getCar } from '@/lib/airtable';
import { isSlotAvailable } from '@/lib/availability';
import { sendBookingConfirmation } from '@/lib/email';
import type { CreateBookingInput } from '@/types';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateBookingInput;
    const { navn, email, mobil, bilId, start, slut } = body;

    // Input validation
    if (!navn?.trim() || !email?.trim() || !mobil?.trim() || !bilId || !start || !slut) {
      return NextResponse.json({ error: 'Alle felter er påkrævet' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Ugyldig e-mailadresse' }, { status: 400 });
    }

    const slotStart = new Date(start);
    const slotEnd = new Date(slut);
    if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) {
      return NextResponse.json({ error: 'Ugyldigt tidspunkt' }, { status: 400 });
    }

    // Server-side double-booking check (race-condition safeguard)
    const existingBookings = await getBookingsForCar(bilId, slotStart);
    if (!isSlotAvailable(slotStart, slotEnd, existingBookings)) {
      return NextResponse.json(
        { error: 'Tidspunktet er desværre netop blevet booket. Vælg venligst et andet tidspunkt.' },
        { status: 409 }
      );
    }

    // Create booking in Airtable
    const booking = await createBooking({
      navn: navn.trim(),
      email: email.trim().toLowerCase(),
      mobil: mobil.trim(),
      bilId,
      start,
      slut,
    });

    // Fetch car details for confirmation email
    const car = await getCar(bilId);
    if (car) {
      booking.bilNavn = car.navn;
      booking.bilRegNr = car.regNr;

      // Await email so it completes before the serverless function exits
      try {
        await sendBookingConfirmation(booking, car);
      } catch (err) {
        console.error('Failed to send confirmation email:', err);
      }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error('POST /api/bookings error:', err);
    return NextResponse.json({ error: 'Booking mislykkedes. Prøv igen.' }, { status: 500 });
  }
}
