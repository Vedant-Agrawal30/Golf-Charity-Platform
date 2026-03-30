import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'GolfGives — Play. Win. Give.',
  description: 'A subscription golf platform where every round supports charity. Track scores, win prizes, change lives.',
  openGraph: {
    title: 'GolfGives — Play. Win. Give.',
    description: 'Golf performance meets charitable impact.',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body className="font-sans bg-dark-900 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
