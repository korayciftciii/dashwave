import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserAnalyticsData } from '@/lib/actions'

export async function GET() {
    const { userId } = auth()

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await getUserAnalyticsData(userId)

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
            }
        })
    } catch (error) {
        console.error('Analytics data error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }
} 