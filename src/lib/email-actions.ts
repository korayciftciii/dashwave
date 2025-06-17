import { sendWelcomeEmail, sendTeamInvitationEmail, sendProjectNotificationEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

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
                    <div style="background: white; width: 60px; height: 60px; border-radius: 15px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #667eea; font-weight: bold; font-size: 24px;">DW</span>
                    </div>
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

// Bulk email functions for team operations
export async function sendBulkTeamNotifications(teamId: string, subject: string, message: string) {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            where: { teamId },
            include: { user: true, team: true }
        })

        const emailPromises = teamMembers.map((member: any) =>
            sendProjectNotificationAction(
                member.user.email,
                'Team Update',
                member.team.name,
                message
            )
        )

        const results = await Promise.allSettled(emailPromises)
        const successful = results.filter((result: any) => result.status === 'fulfilled' && result.value.success).length
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