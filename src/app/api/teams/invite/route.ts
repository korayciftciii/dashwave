import { NextRequest, NextResponse } from 'next/server'
import { sendTeamInvitationAction } from '@/lib/email-actions'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { teamId, email, inviterName, teamName } = body

        if (!teamId || !email || !inviterName || !teamName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const result = await sendTeamInvitationAction(email, inviterName, teamName, teamId)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error sending invitation:', error)
        return NextResponse.json(
            { error: 'Failed to send invitation' },
            { status: 500 }
        )
    }
} 