import { getCars, getAllBookings } from '@/lib/airtable';
import AdminTabs from '@/components/admin/AdminTabs';
import LogoutButton from '@/components/admin/LogoutButton';
import HeaderLogos from '@/components/HeaderLogos';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [cars, bookings] = await Promise.all([
    getCars(false),
    getAllBookings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HeaderLogos size="sm" />
            <span className="text-sm text-neutral-400 border-l border-neutral-200 pl-4">Admin</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-[1440px] mx-auto">
          <AdminTabs cars={cars} bookings={bookings} />
        </div>
      </main>
    </div>
  );
}
