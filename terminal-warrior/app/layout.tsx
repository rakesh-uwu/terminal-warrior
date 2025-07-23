import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'cyber-warrior',
  description: 'made with ❤️ by hackclubber rakes~',
  generator: 'rakesh-uwu',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
