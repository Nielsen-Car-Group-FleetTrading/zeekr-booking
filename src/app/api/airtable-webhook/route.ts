import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  // Optional: verify a shared secret from Airtable webhook headers
  const secret = request.headers.get('x-webhook-secret');
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Ugyldig hemmelighed' }, { status: 401 });
  }

  revalidatePath('/');
  revalidatePath('/api/cars');
  revalidatePath('/api/availability');

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}
