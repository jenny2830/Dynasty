import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost, Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import { LocaleProvider } from '@/lib/locale-context'
import { getI18n } from '@/lib/i18n/server'
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

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return {
    title: {
      default: t('meta.title'),
      template: '%s | DYNASTY',
    },
    description: t('meta.description'),
    keywords: ['property management', 'landlord software', 'real estate', 'Canada', 'CAD', 'Colombia'],
    authors: [{ name: 'DYNASTY' }],
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { locale } = await getI18n()
  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${jost.variable} ${bebas.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-dynasty-warm-white text-dynasty-black-warm antialiased">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  )
}
