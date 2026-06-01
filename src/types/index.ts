export interface AvailabilityWindow {
  date: string;  // YYYY-MM-DD
  start: string; // HH:mm (Europe/Copenhagen)
  end: string;   // HH:mm
}

export interface Car {
  id: string;
  navn: string;
  regNr: string;
  model?: string;
  aktiv: boolean;
  tilgængelighed: AvailabilityWindow[];
}

export interface Booking {
  id: string;
  navn: string;
  email: string;
  mobil: string;
  bilId: string;
  bilNavn?: string;
  bilRegNr?: string;
  start: string;
  slut: string;
  status: 'Bekræftet' | 'Annulleret';
  oprettet?: string;
}

export interface TimeSlot {
  start: string;
  slut: string;
  label: string;
  available: boolean;
}

export interface CreateBookingInput {
  navn: string;
  email: string;
  mobil: string;
  bilId: string;
  start: string;
  slut: string;
}
