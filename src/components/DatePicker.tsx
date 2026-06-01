'use client';

import { useMemo, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { addDays, startOfDay } from 'date-fns';
import { isBusinessDay } from '@/lib/availability';

interface Props {
  onSelect: (date: string) => void;
}

const DAYS_AHEAD = 30;
const TZ = process.env.NEXT_PUBLIC_TIMEZONE ?? 'Europe/Copenhagen';

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTH_NAMES = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];

export default function DatePicker({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const dates = useMemo(() => {
    const result: { dateStr: string; dayName: string; day: number; monthName: string; isToday: boolean }[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = addDays(today, i);
      const dateStr = formatInTimeZone(d, TZ, 'yyyy-MM-dd');
      if (!isBusinessDay(dateStr)) continue;

      const dow = parseInt(formatInTimeZone(d, TZ, 'i'), 10) - 1; // 0=Mon
      const day = parseInt(formatInTimeZone(d, TZ, 'd'), 10);
      const month = parseInt(formatInTimeZone(d, TZ, 'M'), 10) - 1;

      result.push({
        dateStr,
        dayName: DAY_NAMES[dow],
        day,
        monthName: MONTH_NAMES[month],
        isToday: i === 0,
      });
    }

    return result;
  }, []);

  // Group by month
  const byMonth = useMemo(() => {
    const groups: { monthLabel: string; dates: typeof dates }[] = [];
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
                    <span
                      className={`text-[10px] mt-1 ${
                        selected === d.dateStr ? 'text-neutral-300' : 'text-neutral-400'
                      }`}
                    >
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
