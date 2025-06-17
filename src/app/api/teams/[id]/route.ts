import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const team = await prisma.team.findUnique({
            where: { id: params.id },
            include: {
                members: {
                    include: { user: true }
                }
            }
        })

        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            )
        }

        // Serialize the team data
        const serializedTeam = {
            id: team.id,
            name: team.name,
            members: team.members.map(member => ({
                id: member.id,
                user: {
                    id: member.user.id,
                    clerkId: member.user.clerkId,
                    email: member.user.email,
                    name: member.user.name
                }
            }))
        }

        return NextResponse.json(serializedTeam)
    } catch (error) {
        console.error('Error fetching team:', error)
        return NextResponse.json(
            { error: 'Failed to fetch team' },
            { status: 500 }
        )
    }
} 