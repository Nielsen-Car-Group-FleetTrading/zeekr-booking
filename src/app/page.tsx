import { getCars } from '@/lib/airtable';
import BookingFlow from '@/components/BookingFlow';
import HeaderLogos from '@/components/HeaderLogos';
import type { Car } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let cars: Car[] = [];
  try {
    cars = await getCars(true);
  } catch {
    // Will show error state in BookingFlow
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <HeaderLogos />
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Book prøvekørsel</h1>
            <p className="text-neutral-500 text-sm">Vælg bil, dato og tid — det tager kun et minut.</p>
          </div>
          <BookingFlow initialCars={cars} />
        </div>
      </main>

      <footer className="border-t border-neutral-200 px-6 py-6 mt-10">
        <div className="max-w-2xl mx-auto text-xs text-neutral-400">
          © {new Date().getFullYear()} Zeekr Danmark
        </div>
      </footer>
    </div>
  );
}
