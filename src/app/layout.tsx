import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Zest & Partners — Editorial E-Commerce',
    template: '%s | Zest & Partners',
  },
  description:
    'Experience editorial excellence in every product. Curated collections for the modern lifestyle.',
  keywords: ['fashion', 'electronics', 'home living', 'curated', 'premium'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zestpartners.com',
    siteName: 'Zest & Partners',
    title: 'Zest & Partners — Editorial E-Commerce',
    description: 'Curated collections for the modern lifestyle.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakartaSans.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
