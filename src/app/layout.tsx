import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zeekr – Book prøvekørsel',
  description: 'Book en prøvekørsel i en Zeekr',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
