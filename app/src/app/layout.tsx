import type { Metadata, Viewport } from 'next'
import { IM_Fell_English, Libre_Baskerville, Caveat } from 'next/font/google'
import './globals.css'

// Paper & ink typography (spec D2): display, book, and hand accent.
const fontDisplay = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const fontBody = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
})

const fontHand = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-hand',
})

export const metadata: Metadata = {
  title: 'SecondMindMap – Tu Segundo Cerebro Geográfico',
  description:
    'Guarda, organiza y consulta información enriquecida sobre lugares del mundo con un mapa interactivo.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SecondMindMap',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f3e9d2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${fontDisplay.variable} ${fontBody.variable} ${fontHand.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
