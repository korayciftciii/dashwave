import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Dashwave',
    description: 'Modern SaaS Dashwave dashboard with team collaboration features.',
    authors: [{ name: 'Koray Çiftçi', url: 'https://korayciftci.vercel.app' }],
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/favicon.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    <Providers>
                        {children}
                    </Providers>
                </body>
            </html>
        </ClerkProvider>
    )
} 