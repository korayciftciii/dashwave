import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendTaskAssignmentNotification } from '@/lib/email-actions'

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current user from database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const body = await request.json()
        const {
            projectId,
            title,
            description,
            assignedToClerkId,
            status,
            priority,
            dueDate,
            startDate,
            estimatedHours,
            tags,
            notes
        } = body

        if (!projectId || !title) {
            return NextResponse.json(
                { error: 'Project ID and title are required' },
                { status: 400 }
            )
        }

        // Get project with team info
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { team: true }
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Check if user is a member of the team
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId: project.teamId,
                    userId: dbUser.id
                }
            }
        })

        if (!teamMember) {
            return NextResponse.json({ error: 'Not authorized for this project' }, { status: 403 })
        }

        // Find assigned user if specified
        let assignedUser = null
        if (assignedToClerkId) {
            assignedUser = await prisma.user.findUnique({
                where: { clerkId: assignedToClerkId }
            })

            if (!assignedUser) {
                return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
            }

            // Check if assigned user is a team member
            const assignedTeamMember = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: project.teamId,
                        userId: assignedUser.id
                    }
                }
            })

            if (!assignedTeamMember) {
                return NextResponse.json({ error: 'Assigned user is not a team member' }, { status: 400 })
            }
        }

        // Create the task
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status || 'todo',
                priority: priority || 'medium',
                projectId,
                assignedToId: assignedUser?.id,
                createdById: dbUser.id,
                dueDate: dueDate ? new Date(dueDate) : null,
                startDate: startDate ? new Date(startDate) : null,
                estimatedHours: estimatedHours || null,
                tags: tags || [],
                notes: notes || null
            },
            include: {
                assignedTo: true,
                createdBy: true,
                project: {
                    include: {
                        team: true
                    }
                }
            }
        })

        // Send email notification if task is assigned to someone other than the creator
        if (assignedUser && assignedUser.id !== dbUser.id) {
            try {
                await sendTaskAssignmentNotification(
                    assignedUser.email,
                    assignedUser.name || assignedUser.email,
                    task.title,
                    task.description,
                    project.name,
                    project.team.name,
                    dbUser.name || dbUser.email,
                    task.id,
                    project.id
                )
            } catch (emailError) {
                // Log email error but don't fail the task creation
                console.error('Failed to send task assignment email:', emailError)
            }
        }

        return NextResponse.json({
            success: true,
            task
        })
    } catch (error) {
        console.error('Error creating task:', error)
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        )
    }
} 