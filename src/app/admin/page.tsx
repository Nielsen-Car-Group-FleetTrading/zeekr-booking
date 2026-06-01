import Image from 'next/image';
import { getCars } from '@/lib/airtable';
import CarManager from '@/components/admin/CarManager';
import LogoutButton from '@/components/admin/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cars = await getCars(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/zeekr-logo.svg" alt="Zeekr" width={72} height={22} />
            <span className="text-sm text-neutral-400 border-l border-neutral-200 pl-4">Admin</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Biler</h1>
            <p className="text-neutral-500 text-sm mt-1">Administrer biler tilgængelige til booking.</p>
          </div>
          <CarManager initialCars={cars} />
        </div>
      </main>
    </div>
  );
}
