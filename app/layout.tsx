import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import CustomCursor from './components/CustomCursor';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const title = 'Garrett Slocumb — Builder, entrepreneur, and innovator';
const description =
  'Personal site of Garrett Slocumb. UNC student, software engineer, and entrepreneur building products that solve real problems.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-midnight text-ice antialiased font-sans">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
