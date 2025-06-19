import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { updateUserWithClerkData } from '@/lib/actions'

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId } = auth()

    if (!userId) {
        redirect('/sign-in')
    }

    // Update user data from Clerk if needed
    await updateUserWithClerkData()

    return <DashboardLayout>{children}</DashboardLayout>
} 