import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// import '@/styles/globals.css';
import '../app/globals.css'

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
        <main className="min-h-screen bg-gradient-bg">
          {children}
        </main>
      </body>
    </html>
  );
}