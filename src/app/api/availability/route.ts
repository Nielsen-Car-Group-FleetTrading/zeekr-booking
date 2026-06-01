import { NextResponse } from 'next/server';
import { getCar, getBookingsForCar } from '@/lib/airtable';
import { generateSlots, filterAvailableSlots } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const carId = searchParams.get('carId');
  const date = searchParams.get('date'); // YYYY-MM-DD

  if (!carId || !date) {
    return NextResponse.json({ error: 'carId og date er påkrævet' }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date skal være YYYY-MM-DD' }, { status: 400 });
  }

  try {
    const car = await getCar(carId);
    if (!car) {
      return NextResponse.json({ error: 'Bil ikke fundet' }, { status: 404 });
    }

    // Find the specific window for this date
    const window = car.tilgængelighed.find((w) => w.date === date);
    if (!window) {
      return NextResponse.json([]);
    }

    const slots = generateSlots(date, window.start, window.end);
    const bookings = await getBookingsForCar(carId, new Date(date + 'T00:00:00Z'));
    const available = filterAvailableSlots(slots, bookings);
    return NextResponse.json(available);
  } catch (err) {
    console.error('GET /api/availability error:', err);
    return NextResponse.json({ error: 'Kunne ikke hente ledige tider' }, { status: 500 });
  }
}
