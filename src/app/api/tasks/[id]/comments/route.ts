import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendTaskCommentNotificationAction } from '@/lib/email-actions'

// Add a comment to a task
export async function POST(
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
        const { content } = body

        if (!content || content.trim() === '') {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            )
        }

        // Get the task with related data
        const task = await prisma.task.findUnique({
            where: { id: params.id },
            include: {
                assignedTo: true,
                createdBy: true,
                project: {
                    include: { team: true }
                }
            }
        })

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Simple comment storage - in a production app, you might have a Comment model
        // Here we're using the 'notes' field to append comments in a structured way
        const commentObject = {
            id: `comment_${Date.now()}`,
            userId: dbUser.id,
            userName: dbUser.name || dbUser.email,
            content,
            createdAt: new Date().toISOString()
        }

        // Parse existing comments or create new array
        let existingComments: any[] = []
        try {
            if (task.notes) {
                const parsedNotes = JSON.parse(task.notes!)
                if (Array.isArray(parsedNotes)) {
                    existingComments = parsedNotes
                }
            }
        } catch {
            // If parsing fails, just use an empty array
            existingComments = []
        }

        // Add new comment
        existingComments.push(commentObject)

        // Update task with new comments
        const updatedTask = await prisma.task.update({
            where: { id: params.id },
            data: {
                notes: JSON.stringify(existingComments)
            },
            include: {
                assignedTo: true,
                createdBy: true,
                project: {
                    include: { team: true }
                }
            }
        })

        // Send comment notification to task creator and assignee (if different from commenter)
        const notificationRecipients = new Set<string>()

        // Add task creator if not the commenter
        if (task.createdBy && task.createdById !== dbUser.id) {
            notificationRecipients.add(task.createdById)
        }

        // Add task assignee if exists and not the commenter
        if (task.assignedTo && task.assignedToId && task.assignedToId !== dbUser.id) {
            notificationRecipients.add(task.assignedToId)
        }

        // Send notifications
        if (notificationRecipients.size > 0) {
            const recipients = await prisma.user.findMany({
                where: {
                    id: {
                        in: Array.from(notificationRecipients)
                    }
                }
            })

            // Send email to each recipient
            for (const recipient of recipients) {
                try {
                    await sendTaskCommentNotificationAction(
                        recipient.email,
                        recipient.name || recipient.email,
                        dbUser.name || dbUser.email,
                        task.title,
                        task.project.name,
                        task.project.team.name,
                        content,
                        task.projectId
                    )
                } catch (emailError) {
                    console.error('Failed to send comment notification email:', emailError)
                    // Don't fail if email fails
                }
            }
        }

        return NextResponse.json({
            success: true,
            comment: commentObject
        })
    } catch (error) {
        console.error('Error adding task comment:', error)
        return NextResponse.json(
            { error: 'Failed to add comment' },
            { status: 500 }
        )
    }
} 