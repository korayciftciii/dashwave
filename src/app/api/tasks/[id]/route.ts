import { NextRequest, NextResponse } from 'next/server'
import { updateTaskStatus } from '@/lib/actions'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notifyTaskStatusChange } from '@/lib/email-actions'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const body = await request.json()
        const { status, title, description, priority, dueDate, assignedToClerkId, tags, notes } = body

        // Update the task
        await updateTaskStatus(params.id, status)

        // If status was updated, send notifications
        if (status) {
            try {
                await notifyTaskStatusChange(
                    params.id,
                    status,
                    dbUser.name || dbUser.email
                )
            } catch (emailError) {
                console.error('Failed to send task status update notification:', emailError)
                // Don't fail the operation if email sending fails
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating task:', error)
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        )
    }
}

// Implement full task update to support more fields
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const body = await request.json()
        const {
            title,
            description,
            status,
            priority,
            dueDate,
            startDate,
            estimatedHours,
            tags,
            notes,
            assignedToClerkId
        } = body

        // Get the current task
        const currentTask = await prisma.task.findUnique({
            where: { id: params.id },
            include: {
                project: {
                    include: { team: true }
                },
                assignedTo: true
            }
        })

        if (!currentTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Find the new assignee if specified
        let assignedToId = currentTask.assignedToId
        if (assignedToClerkId) {
            const assignedUser = await prisma.user.findUnique({
                where: { clerkId: assignedToClerkId }
            })

            if (!assignedUser) {
                return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
            }

            // Check if assigned user is a team member
            const assignedTeamMember = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: currentTask.project.teamId,
                        userId: assignedUser.id
                    }
                }
            })

            if (!assignedTeamMember) {
                return NextResponse.json({ error: 'Assigned user is not a team member' }, { status: 400 })
            }

            assignedToId = assignedUser.id
        }

        // Track changes for email notification
        const changes: Record<string, any> = {}

        if (title && title !== currentTask.title) changes.title = title
        if (description !== currentTask.description) changes.description = description || 'No description'
        if (status && status !== currentTask.status) changes.status = status
        if (priority && priority !== currentTask.priority) changes.priority = priority

        // Check for date changes
        if (dueDate) {
            const newDueDate = new Date(dueDate)
            const oldDueDate = currentTask.dueDate ? new Date(currentTask.dueDate) : null

            if (!oldDueDate || newDueDate.getTime() !== oldDueDate.getTime()) {
                changes.dueDate = new Date(dueDate).toLocaleDateString()
            }
        }

        if (startDate) {
            const newStartDate = new Date(startDate)
            const oldStartDate = currentTask.startDate ? new Date(currentTask.startDate) : null

            if (!oldStartDate || newStartDate.getTime() !== oldStartDate.getTime()) {
                changes.startDate = new Date(startDate).toLocaleDateString()
            }
        }

        // Check if assignee changed
        if (assignedToId !== currentTask.assignedToId) {
            const newAssignee = assignedToId ? await prisma.user.findUnique({ where: { id: assignedToId } }) : null
            changes.assignedTo = newAssignee?.name || 'Unassigned'
        }

        // Update the task
        const updatedTask = await prisma.task.update({
            where: { id: params.id },
            data: {
                title: title || currentTask.title,
                description: description !== undefined ? description : currentTask.description,
                status: status || currentTask.status,
                priority: priority || currentTask.priority,
                dueDate: dueDate ? new Date(dueDate) : currentTask.dueDate,
                startDate: startDate ? new Date(startDate) : currentTask.startDate,
                estimatedHours: estimatedHours !== undefined ? estimatedHours : currentTask.estimatedHours,
                tags: tags || currentTask.tags,
                notes: notes !== undefined ? notes : currentTask.notes,
                assignedToId
            },
            include: {
                project: {
                    include: { team: true }
                },
                assignedTo: true
            }
        })

        // Send email notifications if there are changes and someone is assigned
        if (Object.keys(changes).length > 0 && updatedTask.assignedTo) {
            try {
                // If assignee changed, send notification to the new assignee
                if (changes.assignedTo && assignedToId) {
                    const newAssignee = await prisma.user.findUnique({ where: { id: assignedToId } })
                    if (newAssignee && newAssignee.id !== dbUser.id) {
                        await prisma.task.findUnique({
                            where: { id: params.id },
                            include: {
                                project: {
                                    include: { team: true }
                                }
                            }
                        }).then(task => {
                            if (task && newAssignee) {
                                import('@/lib/email-actions').then(({ sendTaskAssignmentNotification }) => {
                                    sendTaskAssignmentNotification(
                                        newAssignee.email,
                                        newAssignee.name || newAssignee.email,
                                        task.title,
                                        task.description,
                                        task.project.name,
                                        task.project.team.name,
                                        dbUser.name || dbUser.email,
                                        task.id,
                                        task.projectId
                                    )
                                })
                            }
                        })
                    }
                }
                // Otherwise, send update notification to current assignee
                else if (updatedTask.assignedTo && updatedTask.assignedTo.id !== dbUser.id) {
                    import('@/lib/email-actions').then(({ sendTaskUpdateNotificationAction }) => {
                        sendTaskUpdateNotificationAction(
                            updatedTask.assignedTo!.email,
                            updatedTask.assignedTo!.name || updatedTask.assignedTo!.email,
                            updatedTask.title,
                            updatedTask.project.name,
                            updatedTask.project.team.name,
                            changes,
                            dbUser.name || dbUser.email,
                            updatedTask.id,
                            updatedTask.projectId
                        )
                    })
                }
            } catch (emailError) {
                console.error('Failed to send task update notification:', emailError)
                // Don't fail the operation if email sending fails
            }
        }

        return NextResponse.json({
            success: true,
            task: updatedTask
        })
    } catch (error) {
        console.error('Error updating task:', error)
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        )
    }
}

// Add DELETE method for task deletion
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Find the task with project and team information
        const task = await prisma.task.findUnique({
            where: { id: params.id },
            include: {
                project: {
                    include: {
                        team: true
                    }
                }
            }
        })

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Check if user is a manager or owner of the team
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId: task.project.teamId,
                    userId: dbUser.id
                }
            }
        })

        if (!teamMember) {
            return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 })
        }

        // Check if user has permission to delete tasks
        const isOwner = teamMember.role === 'OWNER'
        const isManager = teamMember.role === 'MANAGER'
        const canManageTasks = teamMember.canManageTasks

        if (!isOwner && !isManager && !canManageTasks) {
            return NextResponse.json({
                error: 'You do not have permission to delete tasks in this team'
            }, { status: 403 })
        }

        // Delete the task
        await prisma.task.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true,
            message: 'Task deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting task:', error)
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        )
    }
}
