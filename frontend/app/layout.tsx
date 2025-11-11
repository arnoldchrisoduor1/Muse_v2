// app/layout.tsx - Simplified
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Collective Poetry - Where AI, Blockchain, and Poetry Converge',
  description: 'A revolutionary platform combining collective AI consciousness, fractional NFT ownership, and anonymous publishing for poets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        {/* Individual pages handle their own layout */}
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}