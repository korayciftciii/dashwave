import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Plus, FolderOpen, ArrowLeft, Mail, CheckSquare, Crown, Shield, Edit, Trash2, UserPlus } from 'lucide-react'
import { getTeamProjects } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CreateProjectDialog from '@/components/dashboard/create-project-dialog'
import InviteMemberDialog from '@/components/dashboard/invite-member-dialog'
import { currentUser } from '@clerk/nextjs/server'
import { Badge } from '@/components/ui/badge'
import { ManageTeamMemberDialog } from '@/components/dashboard/manage-team-member-dialog'

interface TeamPageProps {
    params: {
        teamId: string
    }
}

const roleIcons = {
    OWNER: Crown,
    MANAGER: Shield,
    WRITER: Edit,
    MEMBER: Users,
    VIEWER: CheckSquare
}

const roleColors = {
    OWNER: 'bg-yellow-100 text-yellow-800',
    MANAGER: 'bg-purple-100 text-purple-800',
    WRITER: 'bg-blue-100 text-blue-800',
    MEMBER: 'bg-green-100 text-green-800',
    VIEWER: 'bg-gray-100 text-gray-800'
}

const roleDescriptions = {
    OWNER: 'Full access, can manage team and transfer ownership',
    MANAGER: 'Can manage projects, tasks, and team members',
    WRITER: 'Can create and manage projects and tasks',
    MEMBER: 'Can create tasks and participate in projects',
    VIEWER: 'Can view team content but cannot make changes'
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { userId } = auth()
    const user = await currentUser()

    if (!userId || !user) {
        redirect('/sign-in')
    }

    // Get team details with members
    const team = await prisma.team.findFirst({
        where: {
            id: params.teamId,
            members: {
                some: {
                    user: { clerkId: userId }
                }
            }
        },
        include: {
            members: {
                include: {
                    user: true
                },
                orderBy: [
                    { role: 'asc' }, // OWNER first, then MANAGER, etc.
                    { joinedAt: 'asc' }
                ]
            }
        }
    })

    if (!team) {
        notFound()
    }

    // Get team projects
    const projects = await getTeamProjects(params.teamId)

    // Check if current user is owner (for invite permissions)
    const currentMember = team.members.find(member => member.user.clerkId === userId)
    const isOwner = currentMember?.role === 'OWNER'

    // Check permissions
    const canManageTeam = currentMember?.canManageTeam || isOwner
    const canManageProjects = currentMember?.canManageProjects || isOwner
    const canManageTasks = currentMember?.canManageTasks || isOwner

    // Calculate stats
    const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0)
    const completedTasks = projects.reduce(
        (sum, project) => sum + project.tasks.filter(task => task.status === 'done').length,
        0
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard/teams">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Teams
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                        <p className="text-gray-600 mt-2">
                            Manage projects and team members for this workspace.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {canManageTeam && (
                        <InviteMemberDialog
                            teamId={team.id}
                            teamName={team.name}
                            inviterName={user.fullName || user.firstName || 'Team Member'}
                        >
                            <Button variant="outline">
                                <Mail className="h-4 w-4 mr-2" />
                                Invite Member
                            </Button>
                        </InviteMemberDialog>
                    )}
                    {canManageProjects && (
                        <CreateProjectDialog teamId={team.id}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Project
                            </Button>
                        </CreateProjectDialog>
                    )}
                </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Members</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.members.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTasks}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckSquare className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTasks}</div>
                        <p className="text-xs text-gray-500">
                            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects */}
                <Card>
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>
                            All projects in this team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {projects.length === 0 ? (
                            <div className="text-center py-8">
                                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                                <p className="text-gray-500 mb-4">
                                    Create your first project to start organizing tasks.
                                </p>
                                {canManageProjects && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        Create your first project to get started
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FolderOpen className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{project.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Team Members */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage team members and their roles
                            </CardDescription>
                        </div>
                        {canManageTeam && (
                            <InviteMemberDialog
                                teamId={team.id}
                                teamName={team.name}
                                inviterName={user.fullName || user.firstName || 'Team Member'}
                            >
                                <Button size="sm" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Member
                                </Button>
                            </InviteMemberDialog>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {team.members.map((member) => {
                                const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || Users
                                const isCurrentUser = member.userId === userId

                                return (
                                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-medium">
                                                        {member.user.name || member.user.email}
                                                        {isCurrentUser && (
                                                            <span className="text-sm text-gray-500 ml-1">(You)</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                                                        <RoleIcon className="h-3 w-3 mr-1" />
                                                        {member.customRoleTitle || member.role}
                                                    </Badge>
                                                    {member.customRoleTitle && (
                                                        <span className="text-xs text-gray-500">({member.role})</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {roleDescriptions[member.role as keyof typeof roleDescriptions]}
                                                </p>
                                            </div>
                                        </div>

                                        {canManageTeam && !isCurrentUser && (
                                            <div className="flex items-center space-x-2">
                                                <ManageTeamMemberDialog
                                                    member={member}
                                                    teamId={team.id}
                                                    isOwner={isOwner}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 