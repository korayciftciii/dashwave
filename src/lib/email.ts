import nodemailer from 'nodemailer'

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
})

// Email templates
const emailTemplates = {
    welcome: (name: string) => ({
        subject: 'Welcome to Dashwave! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <div style="background: white; width: 60px; height: 60px; border-radius: 15px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #667eea; font-weight: bold; font-size: 24px;">DW</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Dashwave!</h1>
                </div>
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
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <div style="background: white; width: 60px; height: 60px; border-radius: 15px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #667eea; font-weight: bold; font-size: 24px;">DW</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 28px;">Team Invitation</h1>
                </div>
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
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <div style="background: white; width: 60px; height: 60px; border-radius: 15px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #667eea; font-weight: bold; font-size: 24px;">DW</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 28px;">Project Update</h1>
                </div>
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