import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'LinkedKraft — Write LinkedIn Posts That Sound Like You',
  description: 'AI LinkedIn post generator that learns your voice. 3 variations, Voice DNA, 8 languages, Post Intelligence Score. Used by 12,000+ creators.',
  keywords: 'LinkedIn post generator, AI writing tool, LinkedIn content creator, personal branding',
  openGraph: {
    title: 'LinkedKraft — LinkedIn Posts That Sound Like You',
    description: 'AI that learns your voice and writes LinkedIn posts that get real engagement.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0d0d0d', color: '#f5f0e8',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
              fontWeight: '500', borderRadius: '14px',
              padding: '12px 20px', boxShadow: '0 20px 60px rgba(13,13,13,.22)',
            },
            success: { style: { background: '#16a34a' }, iconTheme: { primary: 'white', secondary: '#16a34a' } },
            error:   { style: { background: '#dc2626' }, iconTheme: { primary: 'white', secondary: '#dc2626' } },
          }}
        />
      </body>
    </html>
  )
}
