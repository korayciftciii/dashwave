import nodemailer from 'nodemailer'

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
})

// Common elements
const logoHeader = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Dashwave Logo" style="width: 80px; height: auto; margin-bottom: 15px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">{{HEADER_TEXT}}</h1>
    </div>
`;

// Email templates
const emailTemplates = {
    welcome: (name: string) => ({
        subject: 'Welcome to Dashwave! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${logoHeader.replace('{{HEADER_TEXT}}', 'Welcome to Dashwave!')}
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        Welcome to Dashwave! We're excited to have you on board. Your account has been successfully created and you're ready to start managing your teams and projects.
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">What's next?</h3>
                        <ul style="color: #666; line-height: 1.8;">
                            <li>Create your first team</li>
                            <li>Invite team members to collaborate</li>
                            <li>Start organizing your projects</li>
                            <li>Track tasks and progress</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Go to Dashboard
                        </a>
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                        If you have any questions, feel free to reach out to our support team.
                    </p>
                </div>
            </div>
        `,
        text: `
            Welcome to Dashwave, ${name}!
            
            Your account has been successfully created and you're ready to start managing your teams and projects.
            
            What's next?
            - Create your first team
            - Invite team members to collaborate
            - Start organizing your projects
            - Track tasks and progress
            
            Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
            
            If you have any questions, feel free to reach out to our support team.
        `
    }),

    teamInvitation: (inviterName: string, teamName: string, inviteLink: string) => ({
        subject: `You've been invited to join "${teamName}" on Dashwave`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${logoHeader.replace('{{HEADER_TEXT}}', 'Team Invitation')}
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">You're invited! 🎉</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        <strong>${inviterName}</strong> has invited you to join the team <strong>"${teamName}"</strong> on Dashwave.
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">About "${teamName}"</h3>
                        <p style="color: #666; margin: 0;">
                            Join this team to collaborate on projects, manage tasks, and track progress together.
                        </p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${inviteLink}" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Accept Invitation
                        </a>
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                        If you don't want to join this team, you can simply ignore this email.
                    </p>
                </div>
            </div>
        `,
        text: `
            You're invited to join "${teamName}" on Dashwave!
            
            ${inviterName} has invited you to join their team.
            
            Accept the invitation: ${inviteLink}
            
            If you don't want to join this team, you can simply ignore this email.
        `
    }),

    projectNotification: (projectName: string, teamName: string, message: string) => ({
        subject: `New activity in "${projectName}" - ${teamName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${logoHeader.replace('{{HEADER_TEXT}}', 'Project Update')}
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Activity in "${projectName}"</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        There's new activity in your project <strong>"${projectName}"</strong> in team <strong>"${teamName}"</strong>.
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #333; margin: 0; font-size: 16px;">
                            ${message}
                        </p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            View Project
                        </a>
                    </div>
                </div>
            </div>
        `,
        text: `
            Activity in "${projectName}" - ${teamName}
            
            ${message}
            
            View your projects: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects
        `
    }),

    taskUpdate: (recipientName: string, taskTitle: string, projectName: string, teamName: string, updatedFields: any, updaterName: string, taskId: string, projectId: string) => {
        // Format the updated fields
        const changes = Object.entries(updatedFields).map(([key, value]) => {
            // Format the field names for readability
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            return `<li><strong>${fieldName}:</strong> ${value}</li>`;
        }).join('');

        return {
            subject: `Task Updated: ${taskTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    ${logoHeader.replace('{{HEADER_TEXT}}', 'Task Update')}
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Hi ${recipientName}! 📝</h2>
                        <p style="color: #666; line-height: 1.6; font-size: 16px;">
                            <strong>${updaterName}</strong> has updated a task you're assigned to in <strong>${teamName}</strong>.
                        </p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #374151; margin-top: 0;">${taskTitle}</h3>
                            <p><strong>Project:</strong> ${projectName}</p>
                            <p><strong>Team:</strong> ${teamName}</p>
                            
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                <h4 style="color: #374151; margin-top: 0;">Changes made:</h4>
                                <ul style="color: #6b7280;">
                                    ${changes}
                                </ul>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}" 
                               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                View Updated Task
                            </a>
                        </div>
                        
                        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                            Best regards,<br>The Dashwave Team
                        </p>
                    </div>
                </div>
            `,
            text: `
                Task Updated: ${taskTitle}
                
                Hi ${recipientName}!
                
                ${updaterName} has updated a task you're assigned to in ${teamName}.
                
                Task: ${taskTitle}
                Project: ${projectName}
                Team: ${teamName}
                
                Changes made:
                ${Object.entries(updatedFields).map(([key, value]) => {
                const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return `- ${fieldName}: ${value}`;
            }).join('\n')}
                
                View the updated task: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}
                
                Best regards,
                The Dashwave Team
            `
        };
    },

    taskDeadlineReminder: (recipientName: string, taskTitle: string, projectName: string, teamName: string, deadline: string, projectId: string) => ({
        subject: `Reminder: Task Deadline Approaching - ${taskTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${logoHeader.replace('{{HEADER_TEXT}}', 'Deadline Reminder')}
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Hi ${recipientName}! ⏰</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        This is a friendly reminder that your task deadline is approaching.
                    </p>
                    
                    <div style="background: #fff4e5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
                        <h3 style="color: #7c2d12; margin-top: 0;">${taskTitle}</h3>
                        <p><strong>Deadline:</strong> ${deadline}</p>
                        <p><strong>Project:</strong> ${projectName}</p>
                        <p><strong>Team:</strong> ${teamName}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}" 
                           style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            View Task
                        </a>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                        Best regards,<br>The Dashwave Team
                    </p>
                </div>
            </div>
        `,
        text: `
            Reminder: Task Deadline Approaching - ${taskTitle}
            
            Hi ${recipientName}!
            
            This is a friendly reminder that your task deadline is approaching.
            
            Task: ${taskTitle}
            Deadline: ${deadline}
            Project: ${projectName}
            Team: ${teamName}
            
            View task: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}
            
            Best regards,
            The Dashwave Team
        `
    }),

    taskCommentNotification: (recipientName: string, commenterName: string, taskTitle: string, projectName: string, teamName: string, comment: string, projectId: string) => ({
        subject: `New Comment on Task: ${taskTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${logoHeader.replace('{{HEADER_TEXT}}', 'New Comment')}
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Hi ${recipientName}! 💬</h2>
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        <strong>${commenterName}</strong> has added a comment to a task you're involved with.
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #374151; margin-top: 0;">${taskTitle}</h3>
                        <p><strong>Project:</strong> ${projectName}</p>
                        <p><strong>Team:</strong> ${teamName}</p>
                        
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                            <h4 style="color: #374151; margin-top: 0;">Comment:</h4>
                            <p style="color: #6b7280; background: #ffffff; padding: 12px; border-radius: 6px; border-left: 3px solid #667eea;">${comment}</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}" 
                           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            View Discussion
                        </a>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                        Best regards,<br>The Dashwave Team
                    </p>
                </div>
            </div>
        `,
        text: `
            New Comment on Task: ${taskTitle}
            
            Hi ${recipientName}!
            
            ${commenterName} has added a comment to a task you're involved with.
            
            Task: ${taskTitle}
            Project: ${projectName}
            Team: ${teamName}
            
            Comment:
            ${comment}
            
            View discussion: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}
            
            Best regards,
            The Dashwave Team
        `
    })
}

// Email sending functions
export const sendWelcomeEmail = async (to: string, name: string) => {
    try {
        const template = emailTemplates.welcome(name)

        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to,
            subject: template.subject,
            html: template.html,
            text: template.text
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Welcome email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending welcome email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export const sendTeamInvitationEmail = async (to: string, inviterName: string, teamName: string, inviteLink: string) => {
    try {
        const template = emailTemplates.teamInvitation(inviterName, teamName, inviteLink)

        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to,
            subject: template.subject,
            html: template.html,
            text: template.text
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Team invitation email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending team invitation email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export const sendProjectNotificationEmail = async (to: string, projectName: string, teamName: string, message: string) => {
    try {
        const template = emailTemplates.projectNotification(projectName, teamName, message)

        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to,
            subject: template.subject,
            html: template.html,
            text: template.text
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Project notification email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending project notification email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// New task update notification email
export const sendTaskUpdateEmail = async (
    to: string,
    recipientName: string,
    taskTitle: string,
    projectName: string,
    teamName: string,
    updatedFields: any,
    updaterName: string,
    taskId: string,
    projectId: string
) => {
    try {
        const template = emailTemplates.taskUpdate(
            recipientName,
            taskTitle,
            projectName,
            teamName,
            updatedFields,
            updaterName,
            taskId,
            projectId
        )

        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to,
            subject: template.subject,
            html: template.html,
            text: template.text
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Task update email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending task update email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// Task deadline reminder email
export const sendTaskDeadlineReminderEmail = async (
    to: string,
    recipientName: string,
    taskTitle: string,
    projectName: string,
    teamName: string,
    deadline: string,
    projectId: string
) => {
    try {
        const template = emailTemplates.taskDeadlineReminder(
            recipientName,
            taskTitle,
            projectName,
            teamName,
            deadline,
            projectId
        )

        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to,
            subject: template.subject,
            html: template.html,
            text: template.text
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Task deadline reminder email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending task deadline reminder email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// Task comment notification email
export const sendTaskCommentEmail = async (
    to: string,
    recipientName: string,
    commenterName: string,
    taskTitle: string,
    projectName: string,
    teamName: string,
    comment: string,
    projectId: string
) => {
    try {
        const template = emailTemplates.taskCommentNotification(
            recipientName,
            commenterName,
            taskTitle,
            projectName,
            teamName,
            comment,
            projectId
        )

        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to,
            subject: template.subject,
            html: template.html,
            text: template.text
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Task comment notification email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending task comment notification email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// Test email function
export const sendTestEmail = async (to: string) => {
    try {
        const mailOptions = {
            from: {
                name: 'Dashwave',
                address: process.env.GMAIL_USER!
            },
            to,
            subject: 'Test Email from Dashwave',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Dashwave Logo" style="width: 80px; height: auto; margin-bottom: 15px;">
                    <h1 style="color: #667eea;">Test Email</h1>
                    <p>This is a test email from Dashwave. If you received this, your email configuration is working correctly!</p>
                    <p>Sent at: ${new Date().toLocaleString()}</p>
                </div>
            `,
            text: `Test Email from Dashwave\n\nThis is a test email from Dashwave. If you received this, your email configuration is working correctly!\n\nSent at: ${new Date().toLocaleString()}`
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Test email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending test email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
} 