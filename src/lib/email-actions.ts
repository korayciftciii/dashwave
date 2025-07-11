import { sendWelcomeEmail, sendTeamInvitationEmail, sendProjectNotificationEmail, sendTaskUpdateEmail, sendTaskDeadlineReminderEmail, sendTaskCommentEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import { Prisma } from '@prisma/client'

// Email-specific actions that can be called separately
export async function sendWelcomeEmailAction(email: string, name: string) {
    try {
        const result = await sendWelcomeEmail(email, name)
        return result
    } catch (error) {
        console.error('Error in sendWelcomeEmailAction:', error)
        return { success: false, error: 'Failed to send welcome email' }
    }
}

export async function sendTeamInvitationAction(email: string, inviterName: string, teamName: string, teamId: string) {
    try {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${teamId}`
        const result = await sendTeamInvitationEmail(email, inviterName, teamName, inviteLink)
        return result
    } catch (error) {
        console.error('Error in sendTeamInvitationAction:', error)
        return { success: false, error: 'Failed to send team invitation' }
    }
}

export async function sendProjectNotificationAction(email: string, projectName: string, teamName: string, message: string) {
    try {
        const result = await sendProjectNotificationEmail(email, projectName, teamName, message)
        return result
    } catch (error) {
        console.error('Error in sendProjectNotificationAction:', error)
        return { success: false, error: 'Failed to send project notification' }
    }
}

// New function to send task update notifications
export async function sendTaskUpdateNotificationAction(
    email: string,
    recipientName: string,
    taskTitle: string,
    projectName: string,
    teamName: string,
    updatedFields: any,
    updaterName: string,
    taskId: string,
    projectId: string
) {
    try {
        const result = await sendTaskUpdateEmail(
            email,
            recipientName,
            taskTitle,
            projectName,
            teamName,
            updatedFields,
            updaterName,
            taskId,
            projectId
        )
        return result
    } catch (error) {
        console.error('Error in sendTaskUpdateNotificationAction:', error)
        return { success: false, error: 'Failed to send task update notification' }
    }
}

// New function to send task deadline reminders
export async function sendTaskDeadlineReminderAction(
    email: string,
    recipientName: string,
    taskTitle: string,
    projectName: string,
    teamName: string,
    deadline: string,
    projectId: string
) {
    try {
        const result = await sendTaskDeadlineReminderEmail(
            email,
            recipientName,
            taskTitle,
            projectName,
            teamName,
            deadline,
            projectId
        )
        return result
    } catch (error) {
        console.error('Error in sendTaskDeadlineReminderAction:', error)
        return { success: false, error: 'Failed to send task deadline reminder' }
    }
}

// New function to send task comment notifications
export async function sendTaskCommentNotificationAction(
    email: string,
    recipientName: string,
    commenterName: string,
    taskTitle: string,
    projectName: string,
    teamName: string,
    comment: string,
    projectId: string
) {
    try {
        const result = await sendTaskCommentEmail(
            email,
            recipientName,
            commenterName,
            taskTitle,
            projectName,
            teamName,
            comment,
            projectId
        )
        return result
    } catch (error) {
        console.error('Error in sendTaskCommentNotificationAction:', error)
        return { success: false, error: 'Failed to send task comment notification' }
    }
}

// New function to send task assignment notifications
export async function sendTaskAssignmentNotification(
    recipientEmail: string,
    recipientName: string,
    taskTitle: string,
    taskDescription: string | null,
    projectName: string,
    teamName: string,
    assignerName: string,
    taskId: string,
    projectId: string
) {
    try {
        // Gmail SMTP configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })

        const subject = `New Task Assigned: ${taskTitle}`

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Dashwave Logo" style="width: 80px; height: auto; margin-bottom: 15px;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">New Task Assigned</h1>
                </div>
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Hi ${recipientName}! 👋</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        <strong>${assignerName}</strong> has assigned you a new task in the <strong>${teamName}</strong> team.
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #374151; margin-top: 0;">${taskTitle}</h3>
                        ${taskDescription ? `<p style="color: #6b7280;">${taskDescription}</p>` : ''}
                        <p><strong>Project:</strong> ${projectName}</p>
                        <p><strong>Team:</strong> ${teamName}</p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">You can view and manage this task by clicking the link below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}" 
                           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            View Task
                        </a>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                        Best regards,<br>The Dashwave Team
                    </p>
                </div>
            </div>
        `

        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to: recipientEmail,
            subject,
            html,
            text: `New Task Assigned: ${taskTitle}\n\nHi ${recipientName}!\n\n${assignerName} has assigned you a new task in the ${teamName} team.\n\nTask: ${taskTitle}\n${taskDescription ? `Description: ${taskDescription}\n` : ''}Project: ${projectName}\nTeam: ${teamName}\n\nView the task: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}\n\nBest regards,\nThe Dashwave Team`
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Task assignment email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending task assignment email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// Notify all task participants of task status changes
export async function notifyTaskStatusChange(taskId: string, newStatus: string, updaterName: string) {
    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignedTo: true,
                project: {
                    include: {
                        team: true
                    }
                }
            }
        });

        if (!task) {
            return { success: false, error: 'Task not found' };
        }

        // If no one is assigned, return early
        if (!task.assignedTo) {
            return { success: true, message: 'No participants to notify' };
        }

        // Get user details
        const user = task.assignedTo ? await prisma.user.findUnique({
            where: { id: task.assignedToId as string }
        }) : null;

        if (!user) {
            return { success: true, message: 'No participants to notify' };
        }

        // Send notification to assigned user
        const result = await sendTaskUpdateNotificationAction(
            user.email,
            user.name || 'Team Member',
            task.title,
            task.project.name,
            task.project.team.name,
            { status: newStatus },
            updaterName,
            taskId,
            task.projectId
        );

        return {
            success: result.success,
            notified: result.success ? 1 : 0,
            total: 1
        };
    } catch (error) {
        console.error('Error in notifyTaskStatusChange:', error);
        return { success: false, error: 'Failed to notify task participants' };
    }
}

// Schedule deadline reminders for tasks
export async function scheduleTaskDeadlineReminders() {
    try {
        // Find tasks with deadlines in the next 24 hours
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const today = new Date();

        const upcomingTasks = await prisma.task.findMany({
            where: {
                dueDate: {
                    gte: today,
                    lte: tomorrow
                },
                status: {
                    not: 'COMPLETED'
                }
            },
            include: {
                assignedTo: true,
                project: {
                    include: {
                        team: true
                    }
                }
            }
        });

        let remindersSent = 0;

        // For each task with an upcoming deadline
        for (const task of upcomingTasks) {
            // Skip tasks with no assignee
            if (!task.assignedTo) {
                continue;
            }

            const formattedDeadline = task.dueDate ? new Date(task.dueDate).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }) : 'No deadline set';

            await sendTaskDeadlineReminderAction(
                task.assignedTo.email,
                task.assignedTo.name || 'Team Member',
                task.title,
                task.project.name,
                task.project.team.name,
                formattedDeadline,
                task.projectId
            );

            remindersSent++;
        }

        return {
            success: true,
            remindersSent,
            tasksWithDeadlines: upcomingTasks.length
        };
    } catch (error) {
        console.error('Error in scheduleTaskDeadlineReminders:', error);
        return { success: false, error: 'Failed to schedule deadline reminders' };
    }
}

// Bulk email functions for team operations
export async function sendBulkTeamNotifications(teamId: string, subject: string, message: string) {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            where: { teamId },
            include: { user: true, team: true }
        })

        const emailPromises = teamMembers.map((member) =>
            sendProjectNotificationAction(
                member.user.email,
                'Team Update',
                member.team.name,
                message
            )
        )

        const results = await Promise.allSettled(emailPromises)
        const successful = results.filter((result) => result.status === 'fulfilled' && (result as any).value.success).length
        const failed = results.length - successful

        return {
            success: failed === 0,
            successful,
            failed,
            total: results.length
        }
    } catch (error) {
        console.error('Error sending bulk notifications:', error)
        return { success: false, error: 'Failed to send notifications' }
    }
}