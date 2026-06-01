import Airtable from 'airtable';
import type { Car, Booking, CreateBookingInput, AvailabilityWindow } from '@/types';

const getBase = () =>
  new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID!
  );

const BILER = () => process.env.AIRTABLE_BILER_TABLE ?? 'Biler';
const BOOKINGER = () => process.env.AIRTABLE_BOOKINGER_TABLE ?? 'Bookinger';

function parseAvailability(raw: unknown): AvailabilityWindow[] {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w): w is AvailabilityWindow =>
        typeof w === 'object' && w !== null &&
        typeof (w as AvailabilityWindow).date === 'string' &&
        typeof (w as AvailabilityWindow).start === 'string' &&
        typeof (w as AvailabilityWindow).end === 'string'
    );
  } catch {
    return [];
  }
}

function mapCar(r: Airtable.Record<Airtable.FieldSet>): Car {
  return {
    id: r.id,
    navn: (r.get('Navn') as string) ?? '',
    regNr: (r.get('Reg.nr') as string) ?? '',
    model: (r.get('Model') as string | undefined) ?? undefined,
    aktiv: (r.get('Aktiv') as boolean) ?? false,
    tilgængelighed: parseAvailability(r.get('Tilgængelighed')),
  };
}

function mapBooking(r: Airtable.Record<Airtable.FieldSet>): Booking {
  const bilLinks = r.get('Bil') as string[] | undefined;
  return {
    id: r.id,
    navn: (r.get('Navn') as string) ?? '',
    email: (r.get('Email') as string) ?? '',
    mobil: (r.get('Mobil') as string) ?? '',
    bilId: bilLinks?.[0] ?? '',
    start: (r.get('Start') as string) ?? '',
    slut: (r.get('Slut') as string) ?? '',
    status: (r.get('Status') as 'Bekræftet' | 'Annulleret') ?? 'Bekræftet',
    oprettet: (r.get('Oprettet') as string | undefined) ?? undefined,
  };
}

export async function getCars(onlyActive = true): Promise<Car[]> {
  const formula = onlyActive ? '{Aktiv} = 1' : '';
  const records = await getBase()(BILER())
    .select({
      filterByFormula: formula,
      sort: [{ field: 'Navn', direction: 'asc' }],
    })
    .all();
  return records.map(mapCar);
}

export async function getCar(id: string): Promise<Car | null> {
  try {
    const record = await getBase()(BILER()).find(id);
    return mapCar(record);
  } catch {
    return null;
  }
}

export async function createCar(data: Omit<Car, 'id'>): Promise<Car> {
  const record = await getBase()(BILER()).create({
    Navn: data.navn,
    'Reg.nr': data.regNr,
    Model: data.model ?? '',
    Aktiv: data.aktiv,
    Tilgængelighed: JSON.stringify(data.tilgængelighed ?? []),
  });
  return mapCar(record);
}

export async function updateCar(id: string, data: Partial<Omit<Car, 'id'>>): Promise<Car> {
  const fields: Airtable.FieldSet = {};
  if (data.navn !== undefined) fields['Navn'] = data.navn;
  if (data.regNr !== undefined) fields['Reg.nr'] = data.regNr;
  if (data.model !== undefined) fields['Model'] = data.model;
  if (data.aktiv !== undefined) fields['Aktiv'] = data.aktiv;
  if (data.tilgængelighed !== undefined) {
    fields['Tilgængelighed'] = JSON.stringify(data.tilgængelighed);
  }
  const record = await getBase()(BILER()).update(id, fields);
  return mapCar(record);
}

export async function getBookingsForCar(carId: string, fromDate: Date): Promise<Booking[]> {
  const fromStr = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const formula = `AND({Status} = 'Bekræftet', IS_AFTER({Slut}, '${fromStr}'))`;

  const records = await getBase()(BOOKINGER())
    .select({
      filterByFormula: formula,
      fields: ['Bil', 'Start', 'Slut', 'Status'],
    })
    .all();

  return records.map(mapBooking).filter((b) => b.bilId === carId);
}

export async function createBooking(data: CreateBookingInput): Promise<Booking> {
  const record = await getBase()(BOOKINGER()).create({
    Navn: data.navn,
    Email: data.email,
    Mobil: data.mobil,
    Bil: [data.bilId],
    Start: data.start,
    Slut: data.slut,
    Status: 'Bekræftet',
  });
  return mapBooking(record);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    const record = await getBase()(BOOKINGER()).find(id);
    return mapBooking(record);
  } catch {
    return null;
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  const [records, cars] = await Promise.all([
    getBase()(BOOKINGER())
      .select({ sort: [{ field: 'Start', direction: 'asc' }] })
      .all(),
    getCars(false),
  ]);

  const carMap = new Map(cars.map((c) => [c.id, c]));

  return records.map((r) => {
    const booking = mapBooking(r);
    const car = carMap.get(booking.bilId);
    return { ...booking, bilNavn: car?.navn, bilRegNr: car?.regNr };
  });
}

export async function updateBookingStatus(
  id: string,
  status: 'Bekræftet' | 'Annulleret'
): Promise<Booking> {
  const record = await getBase()(BOOKINGER()).update(id, { Status: status });
  return mapBooking(record);
}

export async function countConfirmedBookingsForCar(carId: string): Promise<number> {
  // Only Bekræftet bookings block deletion — Annulleret ones are ignored
  const page = await getBase()(BOOKINGER())
    .select({ fields: ['Bil', 'Status'], maxRecords: 100 })
    .firstPage();
  return page.filter((r) => {
    const links = r.get('Bil') as string[] | undefined;
    const status = r.get('Status') as string | undefined;
    return links?.[0] === carId && status === 'Bekræftet';
  }).length;
}

export async function deleteCar(id: string): Promise<void> {
  await getBase()(BILER()).destroy(id);
}
