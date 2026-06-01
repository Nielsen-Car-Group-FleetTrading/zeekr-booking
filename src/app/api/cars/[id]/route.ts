import { NextResponse } from 'next/server';
import { updateCar, countConfirmedBookingsForCar, deleteCar } from '@/lib/airtable';
import type { AvailabilityWindow } from '@/types';
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
    const body = await request.json() as {
      navn?: string;
      regNr?: string;
      model?: string;
      aktiv?: boolean;
      tilgængelighed?: AvailabilityWindow[];
    };

    const updates: Parameters<typeof updateCar>[1] = {};
    if (body.navn !== undefined) updates.navn = body.navn.trim();
    if (body.regNr !== undefined) updates.regNr = body.regNr.trim();
    if (body.model !== undefined) updates.model = body.model.trim();
    if (body.aktiv !== undefined) updates.aktiv = body.aktiv;
    if (body.tilgængelighed !== undefined) updates.tilgængelighed = body.tilgængelighed;

    const car = await updateCar(params.id, updates);
    return NextResponse.json(car);
  } catch (err) {
    console.error('PATCH /api/cars/[id] error:', err);
    return NextResponse.json({ error: 'Kunne ikke opdatere bil' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
  }

  try {
    const confirmedCount = await countConfirmedBookingsForCar(params.id);
    if (confirmedCount > 0) {
      return NextResponse.json(
        {
          error: `Bilen har ${confirmedCount} bekræftet${confirmedCount === 1 ? '' : 'e'} booking${confirmedCount === 1 ? '' : 'er'} og kan ikke slettes. Deaktivér den i stedet for at skjule den fra kunderne.`,
        },
        { status: 409 }
      );
    }

    await deleteCar(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cars/[id] error:', err);
    return NextResponse.json({ error: 'Kunne ikke slette bil' }, { status: 500 });
  }
}
