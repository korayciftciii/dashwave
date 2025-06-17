import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
    const user = await currentUser()

    if (!user) {
        redirect('/sign-in')
    }

    const handleTestEmail = async () => {
        'use server'
        const user = await currentUser()
        if (!user) return

        const email = user.emailAddresses[0]?.emailAddress
        if (!email) return

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/test-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            if (response.ok) {
                console.log('Test email sent successfully')
            }
        } catch (error) {
            console.error('Failed to send test email:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* User Profile */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Your account details and information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
                            <AvatarFallback className="text-lg">
                                {user.firstName?.charAt(0)}
                                {user.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">
                                {user.fullName || 'User'}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Badge variant="secondary">
                                    <User className="h-3 w-3 mr-1" />
                                    Active User
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>Primary Email</span>
                            </div>
                            <p className="font-medium">
                                {user.emailAddresses[0]?.emailAddress || 'No email'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Member Since</span>
                            </div>
                            <p className="font-medium">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>First Name</span>
                            </div>
                            <p className="font-medium">
                                {user.firstName || 'Not provided'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>Last Name</span>
                            </div>
                            <p className="font-medium">
                                {user.lastName || 'Not provided'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>
                        Test email functionality and configure notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Email Notifications</h4>
                        <p className="text-sm text-blue-700 mb-4">
                            You'll receive email notifications for team invitations, new projects, and task updates.
                        </p>
                        <form action={handleTestEmail}>
                            <Button type="submit" variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Test Email
                            </Button>
                        </form>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Email Configuration</h4>
                        <p className="text-sm text-gray-700">
                            Email functionality is powered by Gmail SMTP. Make sure the following environment variables are configured:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• <code>GMAIL_USER</code> - Your Gmail address</li>
                            <li>• <code>GMAIL_APP_PASSWORD</code> - Gmail App Password</li>
                            <li>• <code>NEXT_PUBLIC_APP_URL</code> - Application URL</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>
                        Manage your account security settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Shield className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-900">Account Protected</p>
                                    <p className="text-sm text-green-700">
                                        Your account is secured by Clerk authentication
                                    </p>
                                </div>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                                Secure
                            </Badge>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Authentication Provider</h4>
                            <p className="text-sm text-blue-700">
                                This application uses Clerk for secure authentication and user management.
                                You can manage your account details, password, and security settings through
                                your Clerk account dashboard.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Application Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Application Information</CardTitle>
                    <CardDescription>
                        About this application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Dashwave</h4>
                            <p className="text-sm text-gray-600">
                                A modern SaaS-style multi-tenant dashboard application built with Next.js,
                                TypeScript, TailwindCSS, Prisma, and Clerk authentication.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium">Framework</p>
                                <p className="text-gray-600">Next.js 14</p>
                            </div>
                            <div>
                                <p className="font-medium">Language</p>
                                <p className="text-gray-600">TypeScript</p>
                            </div>
                            <div>
                                <p className="font-medium">Styling</p>
                                <p className="text-gray-600">TailwindCSS</p>
                            </div>
                            <div>
                                <p className="font-medium">Database</p>
                                <p className="text-gray-600">PostgreSQL (Neon)</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 