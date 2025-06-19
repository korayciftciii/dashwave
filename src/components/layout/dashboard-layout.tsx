'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { isOpen, isMobile } = useSidebar()

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className={cn(
                "flex flex-col flex-1 w-full transition-all duration-200",
                !isMobile && (isOpen ? "lg:ml-60" : "lg:ml-[70px]")
            )}>
                <Topbar />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
} 