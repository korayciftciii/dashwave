'use client'

import { useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'
import { SidebarLink } from './sidebar-link'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    LayoutDashboard,
    ListTodo,
    FolderKanban,
    Users,
    BarChart3,
    Settings
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import Image from 'next/image'

export function Sidebar() {
    const { isOpen, toggle, isMobile } = useSidebar()

    const sidebarContent = (
        <div className={cn(
            "flex h-full flex-col gap-2",
            isOpen ? "w-60" : "w-[70px]"
        )}>
            {/* Logo and collapse button */}
            <div className={cn(
                "flex h-16 items-center border-b px-4",
                isOpen ? "justify-between" : "justify-center"
            )}>
                {isOpen ? (
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={30} height={30} />
                        <span className="font-semibold">DashWave</span>
                    </div>
                ) : null}
                {!isMobile && (
                    <button
                        onClick={toggle}
                        className={cn(
                            "rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800",
                            !isOpen && "w-full flex justify-center"
                        )}
                    >
                        <ChevronLeft className={cn(
                            "h-5 w-5 transition-transform",
                            !isOpen && "rotate-180"
                        )} />
                    </button>
                )}
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto py-2 px-3">
                <nav className="flex flex-col gap-1">
                    <SidebarLink
                        href="/dashboard"
                        icon={<LayoutDashboard />}
                        label="Dashboard"
                        isOpen={isOpen}
                    />
                    <SidebarLink
                        href="/dashboard/projects"
                        icon={<FolderKanban />}
                        label="Projects"
                        isOpen={isOpen}
                    />
                    <SidebarLink
                        href="/dashboard/tasks"
                        icon={<ListTodo />}
                        label="Tasks"
                        isOpen={isOpen}
                    />
                    <SidebarLink
                        href="/dashboard/teams"
                        icon={<Users />}
                        label="Teams"
                        isOpen={isOpen}
                    />
                    <SidebarLink
                        href="/dashboard/analytics"
                        icon={<BarChart3 />}
                        label="Analytics"
                        isOpen={isOpen}
                    />
                </nav>
            </div>

            {/* Bottom section */}
            <div className="border-t py-2 px-3">
                <SidebarLink
                    href="/dashboard/settings"
                    icon={<Settings />}
                    label="Settings"
                    isOpen={isOpen}
                />
            </div>
        </div>
    )

    // Mobile: use Sheet component
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={toggle}>
                <SheetContent side="left" className="p-0 w-[280px]">
                    {sidebarContent}
                </SheetContent>
            </Sheet>
        )
    }

    // Desktop: use animated sidebar
    return (
        <motion.div
            className={cn(
                "hidden lg:block h-screen border-r bg-background",
                isOpen ? "w-60" : "w-[70px]"
            )}
            animate={{ width: isOpen ? 240 : 70 }}
            transition={{ duration: 0.2 }}
        >
            {sidebarContent}
        </motion.div>
    )
} 