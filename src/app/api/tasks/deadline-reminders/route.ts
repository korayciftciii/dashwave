import { NextRequest, NextResponse } from 'next/server'
import { scheduleTaskDeadlineReminders } from '@/lib/email-actions'

// This endpoint would be called by a scheduled job (e.g., Vercel Cron)
export async function POST(request: NextRequest) {
    try {
        // Check for API key-based authorization
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== process.env.CRON_API_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Send deadline reminders
        const result = await scheduleTaskDeadlineReminders()

        return NextResponse.json({
            ...result
        })
    } catch (error) {
        console.error('Error sending task deadline reminders:', error)
        return NextResponse.json(
            { error: 'Failed to send deadline reminders' },
            { status: 500 }
        )
    }
} 