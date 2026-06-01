'use client';

import { useMemo, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { fromZonedTime } from 'date-fns-tz';

interface Props {
  availableDates: string[]; // YYYY-MM-DD, sorted ascending
  onSelect: (date: string) => void;
}

const TZ = process.env.NEXT_PUBLIC_TIMEZONE ?? 'Europe/Copenhagen';

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTH_NAMES = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];

interface DateEntry {
  dateStr: string;
  dayName: string;
  day: number;
  monthName: string;
  isToday: boolean;
}

export default function DatePicker({ availableDates, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const todayStr = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd');

  const dates = useMemo((): DateEntry[] => {
    return availableDates.map((dateStr) => {
      const utc = fromZonedTime(`${dateStr}T12:00:00`, TZ);
      const dow = parseInt(formatInTimeZone(utc, TZ, 'i'), 10) - 1; // 0=Mon
      const day = parseInt(formatInTimeZone(utc, TZ, 'd'), 10);
      const month = parseInt(formatInTimeZone(utc, TZ, 'M'), 10) - 1;
      return {
        dateStr,
        dayName: DAY_NAMES[dow],
        day,
        monthName: MONTH_NAMES[month],
        isToday: dateStr === todayStr,
      };
    });
  }, [availableDates, todayStr]);

  // Group by month
  const byMonth = useMemo(() => {
    const groups: { monthLabel: string; dates: DateEntry[] }[] = [];
    for (const d of dates) {
      const label = d.monthName.charAt(0).toUpperCase() + d.monthName.slice(1);
      const last = groups[groups.length - 1];
      if (!last || last.monthLabel !== label) {
        groups.push({ monthLabel: label, dates: [d] });
      } else {
        last.dates.push(d);
      }
    }
    return groups;
  }, [dates]);

  function handleSelect(dateStr: string) {
    setSelected(dateStr);
    onSelect(dateStr);
  }

  if (availableDates.length === 0) {
    return (
      <div className="border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
        Ingen tilgængelige datoer for denne bil. Kontakt os for at aftale en tid.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-5">Vælg en dato:</p>
      <div className="space-y-6">
        {byMonth.map(({ monthLabel, dates: monthDates }) => (
          <div key={monthLabel}>
            <div className="text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-3">
              {monthLabel}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {monthDates.map((d) => (
                <button
                  key={d.dateStr}
                  onClick={() => handleSelect(d.dateStr)}
                  className={`flex flex-col items-center py-3 px-1 border transition-colors ${
                    selected === d.dateStr
                      ? 'border-2 border-black bg-black text-white'
                      : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  <span className="text-xs mb-1 opacity-70">{d.dayName}</span>
                  <span className="text-lg font-semibold leading-none">{d.day}</span>
                  {d.isToday && (
                    <span className={`text-[10px] mt-1 ${selected === d.dateStr ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      i dag
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
