import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { teamId, userClerkId, email } = body

        if (!teamId || !userClerkId || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if team exists
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true }
        })

        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            )
        }

        // Check if user exists in our database
        let user = await prisma.user.findUnique({
            where: { clerkId: userClerkId }
        })

        // Create user if doesn't exist
        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId: userClerkId,
                    email: email,
                    name: 'New User' // This will be updated from Clerk data
                }
            })
        }

        // Check if already a member
        const existingMember = await prisma.teamMember.findFirst({
            where: {
                teamId: teamId,
                userId: user.id
            }
        })

        if (existingMember) {
            return NextResponse.json(
                { error: 'Already a member of this team' },
                { status: 400 }
            )
        }

        // Add user to team
        await prisma.teamMember.create({
            data: {
                teamId: teamId,
                userId: user.id,
                role: 'member'
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error accepting invitation:', error)
        return NextResponse.json(
            { error: 'Failed to accept invitation' },
            { status: 500 }
        )
    }
} 