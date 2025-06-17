import { NextRequest, NextResponse } from 'next/server'
import { createTeam } from '@/lib/actions'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Team name is required' },
                { status: 400 }
            )
        }

        const team = await createTeam(name)

        return NextResponse.json({ success: true, team })
    } catch (error) {
        console.error('Error creating team:', error)
        return NextResponse.json(
            { error: 'Failed to create team' },
            { status: 500 }
        )
    }
} 