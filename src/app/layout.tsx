import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'HackTrack — Student Hackathon Tracker & Telegram Alerts',
  description:
    'Track collegiate & global hackathons from Devpost and Unstop. Get automated Telegram deadline alerts before submission.',
  keywords: [
    'hackathons',
    'student hackathons',
    'devpost tracker',
    'telegram hackathon bot',
    'coding competitions'
  ],
  authors: [{ name: 'HackTrack' }],
  openGraph: {
    title: 'HackTrack — Student Hackathon Tracker & Telegram Alerts',
    description:
      'Never miss a student hackathon deadline again. Live radar + Telegram notifications.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
