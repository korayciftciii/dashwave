import { currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderOpen, CheckSquare, Activity } from 'lucide-react'
import { getUserTeams, getUserStats } from '@/lib/actions'
import Link from 'next/link'

export default async function DashboardPage() {
    const user = await currentUser()

    if (!user) {
        return null
    }

    // Get user stats
    const stats = await getUserStats(user.id)
    const teams = await getUserTeams(user.id)

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user.firstName || 'User'}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your teams and projects.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTeams}</div>
                        <p className="text-xs text-muted-foreground">
                            Teams you're part of
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all your teams
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks in all projects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Teams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Teams</CardTitle>
                        <CardDescription>
                            Teams you're currently part of
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {teams.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                No teams yet. Create your first team to get started!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {teams.map((team) => (
                                    <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{team.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {team.role}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks to help you get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Link href="/dashboard/teams">
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">Create a new team</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/projects">
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                                    <FolderOpen className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-green-900">Start a new project</span>
                                </div>
                            </Link>
                            {teams.length > 0 && (
                                <Link href={`/dashboard/teams/${teams[0].id}`}>
                                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                                        <CheckSquare className="h-5 w-5 text-purple-600" />
                                        <span className="font-medium text-purple-900">Add some tasks</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 