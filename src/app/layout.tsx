import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css' // Keep this import for global styles
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Slide Generator',
  description:
    'Markdownをリアルタイムでスライドに変換。エディタ・スライドビューア・PDF出力を備えたWebサービス。',
  openGraph: {
    title: 'Slide Generator',
    description:
      'Markdownをリアルタイムでスライドに変換。エディタ・スライドビューア・PDF出力を備えたWebサービス。',
    images: [
      {
        url: '/logo.svg',
        width: 800,
        height: 600,
        alt: 'Slide Generator ロゴ',
      },
    ],
    siteName: 'Slide Generator',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slide Generator',
    description:
      'Markdownをリアルタイムでスライドに変換。エディタ・スライドビューア・PDF出力を備えたWebサービス。',
    images: ['/logo.svg'],
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ja'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <footer className='mt-10 flex items-center justify-center h-16 border-t'>
          <p className='text-sm text-gray-500'>
            Powered by{' '}
            <a
              href='https://pokohanada.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline'
            >
              PokoHanada.com
            </a>
          </p>
        </footer>
        <Toaster position='top-center' />
      </body>
    </html>
  )
}
