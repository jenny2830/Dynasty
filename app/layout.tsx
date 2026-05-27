import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DYNASTY — Property Wealth Management',
    template: '%s | DYNASTY',
  },
  description: 'Premium property wealth management for Canadian landlords.',
  keywords: ['property management', 'landlord software', 'real estate', 'Canada', 'CAD'],
  authors: [{ name: 'DYNASTY' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-dynasty-black text-dynasty-cream antialiased">
        {children}
      </body>
    </html>
  )
}
