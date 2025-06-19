import { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AnalyticsDashboardClient from './client'

export const metadata: Metadata = {
    title: 'Analytics | Dashwave',
    description: 'View your performance metrics and project analytics',
}

export default async function AnalyticsPage() {
    const { userId } = auth()

    if (!userId) {
        redirect('/sign-in')
    }

    return <AnalyticsDashboardClient />
}