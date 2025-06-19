'use client'

import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toast'

interface ProvidersProps {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <>
            {children}
            <Toaster />
        </>
    )
} 