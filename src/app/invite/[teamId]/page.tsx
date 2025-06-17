'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

interface InvitePageProps {
    params: {
        teamId: string
    }
    searchParams: {
        email?: string
    }
}

interface TeamData {
    id: string
    name: string
    members: Array<{
        id: string
        user: {
            id: string
            clerkId: string
            email: string
            name: string | null
        }
    }>
}

export default function InvitePage({ params, searchParams }: InvitePageProps) {
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const [team, setTeam] = useState<TeamData | null>(null)
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [alreadyMember, setAlreadyMember] = useState(false)
    const email = searchParams.email

    useEffect(() => {
        if (!isLoaded) return

        if (!user) {
            const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(`/invite/${params.teamId}?email=${email || ''}`)}`
            router.push(signUpUrl)
            return
        }

        // Fetch team data
        fetchTeamData()
    }, [isLoaded, user, params.teamId, email, router])

    const fetchTeamData = async () => {
        try {
            const response = await fetch(`/api/teams/${params.teamId}`)
            if (!response.ok) {
                if (response.status === 404) {
                    router.push('/dashboard')
                    return
                }
                throw new Error('Failed to fetch team data')
            }

            const teamData = await response.json()
            setTeam(teamData)

            // Check if user is already a member
            const existingMember = teamData.members.find(
                (member: any) => member.user.clerkId === user?.id
            )
            setAlreadyMember(!!existingMember)
        } catch (error) {
            console.error('Error fetching team:', error)
            toast.error('Failed to load team information')
            router.push('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async () => {
        if (!user || !team) return

        setAccepting(true)
        try {
            const response = await fetch('/api/teams/accept-invitation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamId: params.teamId,
                    userClerkId: user.id,
                    email: email || user.emailAddresses[0]?.emailAddress || '',
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to accept invitation')
            }

            if (result.success) {
                toast.success('Successfully joined the team!')
                router.push(`/dashboard/teams/${params.teamId}`)
            } else {
                toast.error(result.error || 'Failed to accept invitation')
            }
        } catch (error) {
            console.error('Error accepting invitation:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setAccepting(false)
        }
    }

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-8">
                        <p>Team not found</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (alreadyMember) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <Image
                                src="/logo.png"
                                alt="Dashwave Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <span className="text-2xl font-bold text-gray-900">Dashwave</span>
                        </div>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <CardTitle className="text-xl">Already a Member</CardTitle>
                        <CardDescription>
                            You're already a member of "{team.name}". Go to your dashboard to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/dashboard">
                            <Button className="w-full">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <Image
                            src="/logo.png"
                            alt="Dashwave Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <span className="text-2xl font-bold text-gray-900">Dashwave</span>
                    </div>
                    <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <CardTitle className="text-xl">You're Invited!</CardTitle>
                    <CardDescription>
                        You've been invited to join "{team.name}" on Dashwave.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Team Details</h4>
                        <div className="space-y-2 text-sm text-blue-700">
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>{team.members.length} members</span>
                            </div>
                            <div>
                                <span className="font-medium">Team:</span> {team.name}
                            </div>
                            {email && (
                                <div>
                                    <span className="font-medium">Invited as:</span> {email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleAccept}
                            disabled={accepting}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {accepting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Accepting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept Invitation
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <Link href="/dashboard">
                                <Button variant="outline" className="w-full">
                                    Maybe Later
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        <p>
                            By accepting this invitation, you'll be able to collaborate on projects
                            and tasks with your team.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 