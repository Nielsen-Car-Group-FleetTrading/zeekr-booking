import { NextResponse } from 'next/server';
import { getCars, createCar } from '@/lib/airtable';
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

export async function GET() {
  try {
    const cars = await getCars(true);
    return NextResponse.json(cars);
  } catch (err) {
    console.error('GET /api/cars error:', err);
    return NextResponse.json({ error: 'Kunne ikke hente biler' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { navn, regNr, model } = body as { navn: string; regNr: string; model?: string };

    if (!navn?.trim() || !regNr?.trim()) {
      return NextResponse.json({ error: 'Navn og reg.nr er påkrævet' }, { status: 400 });
    }

    const car = await createCar({ navn: navn.trim(), regNr: regNr.trim(), model: model?.trim(), aktiv: true, tilgængelighed: [] });
    return NextResponse.json(car, { status: 201 });
  } catch (err) {
    console.error('POST /api/cars error:', err);
    return NextResponse.json({ error: 'Kunne ikke oprette bil' }, { status: 500 });
  }
}
