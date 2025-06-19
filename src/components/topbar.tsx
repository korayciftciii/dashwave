'use client'

import { UserButton } from '@clerk/nextjs'
import { useSidebar } from '@/lib/hooks/use-sidebar'
import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Topbar() {
    const { toggle, isMobile } = useSidebar()
    const pathname = usePathname()

    // Get the current section name from the pathname
    const getPageTitle = () => {
        if (pathname === '/dashboard') return 'Dashboard'

        const segments = pathname.split('/')
        if (segments.length >= 3) {
            const section = segments[2]
            return section.charAt(0).toUpperCase() + section.slice(1)
        }

        return 'Dashboard'
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className={isMobile ? "lg:hidden" : "hidden lg:flex"}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex flex-1 items-center justify-between">
                <h1 className={cn(
                    "text-lg font-semibold",
                    isMobile ? "ml-2" : "ml-0"
                )}>
                    {getPageTitle()}
                </h1>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                        <span className="sr-only">Notifications</span>
                    </Button>

                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "h-8 w-8"
                            }
                        }}
                    />
                </div>
            </div>
        </header>
    )
} 