import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId } = auth()

    if (!userId) {
        redirect('/sign-in')
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
} 