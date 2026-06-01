import { NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/airtable';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

function isAdmin(): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const expected = createHash('sha256').update(adminPassword).digest('hex');
  return cookies().get('admin_auth')?.value === expected;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
  }

  try {
    const { status } = await request.json() as { status: string };

    if (status !== 'Bekræftet' && status !== 'Annulleret') {
      return NextResponse.json({ error: 'Ugyldig status' }, { status: 400 });
    }

    const booking = await updateBookingStatus(params.id, status);
    return NextResponse.json(booking);
  } catch (err) {
    console.error('PATCH /api/bookings/[id] error:', err);
    return NextResponse.json({ error: 'Kunne ikke opdatere booking' }, { status: 500 });
  }
}
