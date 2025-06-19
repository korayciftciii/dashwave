'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'

interface SidebarLinkProps {
    href: string
    icon: ReactNode
    label: string
    isOpen: boolean
}

export function SidebarLink({ href, icon, label, isOpen }: SidebarLinkProps) {
    const pathname = usePathname()

    // Düzeltilmiş aktif durum kontrolü - tam eşleşme yerine başlangıç kontrolü
    // Ancak dashboard için özel kontrol ekliyoruz
    const isActive =
        href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/dashboard/'
            : pathname.startsWith(href)

    const linkContent = (
        <div
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
                isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
        >
            <div className="text-lg">{icon}</div>
            {isOpen && (
                <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                >
                    {label}
                </motion.span>
            )}
        </div>
    )

    return isOpen ? (
        <Link href={href} className="block w-full">
            {linkContent}
        </Link>
    ) : (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link href={href} className="block w-full">
                        {linkContent}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
} 