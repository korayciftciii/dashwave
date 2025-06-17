import { currentUser } from '@clerk/nextjs/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function Header() {
    const user = await currentUser()

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                            <AvatarFallback>
                                {user?.firstName?.charAt(0)}
                                {user?.lastName?.charAt(0)}
                            </AvatarFallback>
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