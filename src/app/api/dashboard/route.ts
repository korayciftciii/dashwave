import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserDashboardData } from '@/lib/actions'

// Edge API kullanarak daha hızlı yanıt
// export const runtime = 'edge'

export async function GET() {
    const { userId } = auth()

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await getUserDashboardData(userId)

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
            }
        })
    } catch (error) {
        console.error('Dashboard data error:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
} 