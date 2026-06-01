'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setError(data.error ?? 'Login fejlede');
      }
    } catch {
      setError('Netværksfejl. Prøv igen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-neutral-50">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Image src="/zeekr-logo.svg" alt="Zeekr" width={120} height={30} className="mx-auto mb-6" unoptimized />
          <h1 className="text-xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">Indtast adgangskode for at fortsætte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Adgangskode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            autoFocus
            disabled={loading}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logger ind…' : 'Log ind'}
          </button>
        </form>
      </div>
    </div>
  );
}
