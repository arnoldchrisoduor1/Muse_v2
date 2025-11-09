// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css'; // keep your global css import

import MainLayout from './(main)/layout'; // <-- relative to app/, adjust if your folder differs

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Collective Poetry - Where AI, Blockchain, and Poetry Converge',
  description: 'A revolutionary platform combining collective AI consciousness, fractional NFT ownership, and anonymous publishing for poets.',
  keywords: 'poetry, blockchain, NFT, AI, collective, anonymous, zero-knowledge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* MainLayout is a client component; it's fine to import it here */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
