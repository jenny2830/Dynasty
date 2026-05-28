import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost, Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DYNASTY — Property Wealth Platform',
    template: '%s | DYNASTY',
  },
  description: 'Legacy. Luxury. Timeless. Premium property wealth management for Canadian landlords.',
  keywords: ['property management', 'landlord software', 'real estate', 'Canada', 'CAD'],
  authors: [{ name: 'DYNASTY' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${bebas.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-dynasty-black text-dynasty-warm-white antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
