'use client'

import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { memo } from 'react'
import Image from 'next/image'

// Header bileşenini client component olarak optimize ediyoruz
function Header() {
    const { user, isLoaded } = useUser()

    // User yüklenene kadar basit bir iskelet göster
    if (!isLoaded) {
        return (
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="hidden md:block">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                            {user?.imageUrl ? (
                                <Image
                                    src={user.imageUrl}
                                    alt={user?.fullName || ''}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                    priority={true}
                                />
                            ) : (
                                <AvatarFallback>
                                    {user?.firstName?.charAt(0)}
                                    {user?.lastName?.charAt(0)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                            </p>
                            <p className="text-xs text-gray-500">
                                {user?.emailAddresses[0]?.emailAddress}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

// Gereksiz yeniden render'ları önlemek için memo kullanıyoruz
export default memo(Header) 