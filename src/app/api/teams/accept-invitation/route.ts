import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

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
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userClerkId }
        })

        // Create user if doesn't exist
        if (!dbUser) {
            // Try to get the best name from Clerk user data
            let userName = 'User'

            if (user.fullName) {
                userName = user.fullName
            } else if (user.firstName && user.lastName) {
                userName = `${user.firstName} ${user.lastName}`
            } else if (user.firstName) {
                userName = user.firstName
            } else if (user.lastName) {
                userName = user.lastName
            } else {
                // Use email username as fallback
                if (email) {
                    userName = email.split('@')[0]
                }
            }

            dbUser = await prisma.user.create({
                data: {
                    clerkId: userClerkId,
                    email: email,
                    name: userName
                }
            })
        } else {
            // Update existing user if name is still 'User' or 'New User' and we have better data
            if ((dbUser.name === 'User' || dbUser.name === 'New User' || !dbUser.name) && user.fullName) {
                await prisma.user.update({
                    where: { id: dbUser.id },
                    data: {
                        name: user.fullName,
                        email: email || dbUser.email,
                    }
                })
                dbUser.name = user.fullName
            }
        }

        // Check if already a member
        const existingMember = await prisma.teamMember.findFirst({
            where: {
                teamId: teamId,
                userId: dbUser.id
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
                userId: dbUser.id,
                role: 'MEMBER'
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