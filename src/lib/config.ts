export const config = {
  timezone: process.env.NEXT_PUBLIC_TIMEZONE ?? 'Europe/Copenhagen',
  businessHoursStart: process.env.BUSINESS_HOURS_START ?? '09:00',
  businessHoursEnd: process.env.BUSINESS_HOURS_END ?? '17:00',
  businessDays: (process.env.BUSINESS_DAYS ?? '1,2,3,4,5').split(',').map(Number),
  slotDuration: 30,
  bufferDuration: 15,
  companyAddress: process.env.COMPANY_ADDRESS ?? 'Zeekr Danmark',
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? 'booking@zeekr.dk',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
};
