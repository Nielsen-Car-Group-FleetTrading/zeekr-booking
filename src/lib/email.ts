import { Resend } from 'resend';
import { formatInTimeZone } from 'date-fns-tz';
import type { Car, Booking } from '@/types';
import { config } from './config';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDanishDate(isoString: string): string {
  return formatInTimeZone(new Date(isoString), config.timezone, "EEEE 'd.' d. MMMM yyyy", {
    locale: undefined,
  });
}

function formatTime(isoString: string): string {
  return formatInTimeZone(new Date(isoString), config.timezone, 'HH:mm');
}

function buildEmailHtml(booking: Booking, car: Car): string {
  const logoUrl = `${config.appUrl}/zeekr-logo.svg`;
  const dateStr = formatDanishDate(booking.start);
  const startTime = formatTime(booking.start);
  const endTime = formatTime(booking.slut);

  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking bekræftet – Zeekr</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:32px 40px;">
              <img src="${logoUrl}" alt="Zeekr" height="28" style="display:block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#666;">Booking bekræftet</p>
              <h1 style="margin:0 0 32px;font-size:28px;font-weight:700;color:#000;line-height:1.2;">
                Vi glæder os til at se dig, ${booking.navn.split(' ')[0]}!
              </h1>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                          <span style="font-size:12px;color:#888;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Bil</span>
                          <span style="font-size:16px;font-weight:600;color:#000;">${car.navn}${car.model ? ' ' + car.model : ''}</span>
                          <span style="font-size:14px;color:#555;display:block;margin-top:2px;">${car.regNr}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                          <span style="font-size:12px;color:#888;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Dato</span>
                          <span style="font-size:16px;font-weight:600;color:#000;text-transform:capitalize;">${dateStr}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                          <span style="font-size:12px;color:#888;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Tidspunkt</span>
                          <span style="font-size:16px;font-weight:600;color:#000;">${startTime} – ${endTime}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:12px;color:#888;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Sted</span>
                          <span style="font-size:16px;font-weight:600;color:#000;">${config.companyAddress}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.6;">
                Har du spørgsmål? Svar blot på denne mail eller kontakt os direkte.
              </p>
              <p style="margin:0;font-size:13px;color:#888;">
                Booking-reference: <span style="font-family:monospace;color:#333;">${booking.id}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f5;padding:24px 40px;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                Zeekr — ${config.companyAddress}<br/>
                Denne mail er sendt automatisk. Besvar ikke denne e-mail direkte.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBookingConfirmation(booking: Booking, car: Car): Promise<void> {
  const dateStr = formatDanishDate(booking.start);
  const startTime = formatTime(booking.start);

  await resend.emails.send({
    from: config.resendFromEmail,
    to: booking.email,
    subject: `Bookingbekræftelse – ${car.navn} – ${dateStr} kl. ${startTime}`,
    html: buildEmailHtml(booking, car),
  });
}
