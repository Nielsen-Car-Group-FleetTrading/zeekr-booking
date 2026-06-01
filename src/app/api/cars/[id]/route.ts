import { NextResponse } from 'next/server';
import { updateCar } from '@/lib/airtable';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

function isAdmin(): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const expected = createHash('sha256').update(adminPassword).digest('hex');
  const auth = cookies().get('admin_auth');
  return auth?.value === expected;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { navn, regNr, model, aktiv } = body as {
      navn?: string;
      regNr?: string;
      model?: string;
      aktiv?: boolean;
    };

    const updates: Parameters<typeof updateCar>[1] = {};
    if (navn !== undefined) updates.navn = navn.trim();
    if (regNr !== undefined) updates.regNr = regNr.trim();
    if (model !== undefined) updates.model = model.trim();
    if (aktiv !== undefined) updates.aktiv = aktiv;

    const car = await updateCar(params.id, updates);
    return NextResponse.json(car);
  } catch (err) {
    console.error('PATCH /api/cars/[id] error:', err);
    return NextResponse.json({ error: 'Kunne ikke opdatere bil' }, { status: 500 });
  }
}
