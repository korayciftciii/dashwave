'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { useState, useTransition, useMemo, useEffect } from 'react'
import {
    LayoutDashboard,
    FolderOpen,
    Users,
    Settings,
    CheckSquare,
    LogOut,
    Loader2,
    BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
    { name: 'Teams', href: '/dashboard/teams', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeNav, setActiveNav] = useState<string | null>(null)
    const [isNavigating, setIsNavigating] = useState(false)

    // Memoize active state to prevent unnecessary re-renders
    const activeStates = useMemo(() => {
        return navigation.map(item => ({
            href: item.href,
            isActive: pathname === item.href
        }));
    }, [pathname]);

    // Navigation progress indicator
    useEffect(() => {
        if (isPending) {
            setIsNavigating(true);
        } else {
            // Small delay to ensure smooth transition
            const timer = setTimeout(() => {
                setIsNavigating(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isPending]);

    const handleNavigation = (href: string) => {
        if (pathname === href) return // Don't navigate if already on the page

        setActiveNav(href)
        startTransition(() => {
            router.push(href)
        })
    }

    return (
        <div className="flex flex-col w-64 bg-white shadow-lg border-r">
            {/* Navigation Progress Indicator */}
            {isNavigating && (
                <div className="absolute top-0 left-0 w-full h-1 z-50">
                    <div className="h-full bg-blue-600 animate-pulse"></div>
                </div>
            )}

            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <Link href="/dashboard" prefetch={true}>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Image
                                src="/logo.png"
                                alt="Dashwave Logo"
                                width={32}
                                height={32}
                                className="rounded-lg shadow-sm"
                                priority={true}
                            />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Dashwave
                            </span>
                            <p className="text-xs text-gray-500 -mt-1">Team Platform</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item, index) => {
                    const isActive = activeStates[index].isActive;
                    const isLoading = isPending && activeNav === item.href

                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            disabled={isLoading}
                            className={cn(
                                'w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                                isActive
                                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                isLoading && 'opacity-75 cursor-not-allowed'
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin text-blue-600" />
                            ) : (
                                <item.icon className={cn(
                                    "mr-3 h-5 w-5 transition-colors",
                                    isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                                )} />
                            )}
                            <span className={cn(
                                "transition-colors",
                                isActive && "font-semibold"
                            )}>
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Loading Indicator */}
            {isPending && (
                <div className="px-4 py-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-blue-700">Loading...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sign Out */}
            <div className="px-4 py-4 border-t bg-gray-50">
                <SignOutButton>
                    <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </Button>
                </SignOutButton>
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">Dashwave v1.2.0</p>
                </div>
            </div>
        </div>
    )
} 