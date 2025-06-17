import { NextRequest, NextResponse } from 'next/server'
import { createProject } from '@/lib/actions'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { teamId, name } = body

        if (!teamId || !name) {
            return NextResponse.json(
                { error: 'Team ID and project name are required' },
                { status: 400 }
            )
        }

        const project = await createProject(teamId, name)

        return NextResponse.json({ success: true, project })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        )
    }
} 