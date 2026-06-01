import { formatInTimeZone } from 'date-fns-tz';
import { da } from 'date-fns/locale';

const TZ = 'Europe/Copenhagen';

/** "onsdag d. 24. juni 2026" */
export function formatBookingDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(d, TZ, "EEEE 'd.' d. MMMM yyyy", { locale: da });
}
