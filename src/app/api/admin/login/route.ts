import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

export async function POST(request: Request) {
  try {
    const { password } = await request.json() as { password: string };
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Forkert adgangskode' }, { status: 401 });
    }

    const hash = createHash('sha256').update(adminPassword).digest('hex');

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_auth', hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Login fejlede' }, { status: 500 });
  }
}
