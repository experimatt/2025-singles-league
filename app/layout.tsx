import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Sonner } from '@/components/ui/sonner'
import { QueryProvider } from '@/lib/query-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Discord Tennis League',
  description: 'Track standings and submit match results for our in-house tennis leagues',
  generator: 'experimatt',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Sonner />
      </body>
    </html>
  );
}
