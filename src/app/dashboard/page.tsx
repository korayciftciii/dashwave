import { currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FolderOpen, CheckSquare, Activity, BarChart3 } from 'lucide-react'
import { getUserTeams, getUserStats, getUserDashboardData } from '@/lib/actions'
import Link from 'next/link'
import TaskStatusChart from '@/components/dashboard/task-status-chart'
import TaskCalendar from '@/components/dashboard/task-calendar'
import { Suspense } from 'react'

// Skeleton components for loading states
function StatsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-2">
                        <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function ChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
        </Card>
    )
}

function CalendarSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
        </Card>
    )
}

function TeamsGridSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Stats component with suspense
async function DashboardStats() {
    const user = await currentUser()
    if (!user) return null

    const stats = await getUserStats(user.id)

    return (
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
                        {stats.todoTasks || 0} todo, {stats.inProgressTasks || 0} in progress
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.completedTasks} of {stats.totalTasks} completed
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// Chart component with suspense
async function DashboardChart() {
    const user = await currentUser()
    if (!user) return null

    const dashboardData = await getUserDashboardData(user.id)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskStatusChart
                tasks={dashboardData.allTasks}
                title="Task Status Overview"
                description="Distribution of tasks across all your projects"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Quick Actions</span>
                    </CardTitle>
                    <CardDescription>
                        Jump to common tasks and views
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/teams" prefetch={true}>
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="h-4 w-4 mr-2" />
                                Teams
                            </Button>
                        </Link>
                        <Link href="/dashboard/projects" prefetch={true}>
                            <Button variant="outline" className="w-full justify-start">
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Projects
                            </Button>
                        </Link>
                        <Link href="/dashboard/tasks" prefetch={true}>
                            <Button variant="outline" className="w-full justify-start">
                                <CheckSquare className="h-4 w-4 mr-2" />
                                All Tasks
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Calendar component with suspense
async function DashboardCalendar() {
    const user = await currentUser()
    if (!user) return null

    const dashboardData = await getUserDashboardData(user.id)

    return (
        <TaskCalendar
            tasks={dashboardData.allTasks}
            title="📅 Task Calendar"
            description="View your tasks organized by dates"
        />
    )
}

// Teams component with suspense
async function DashboardTeams() {
    const user = await currentUser()
    if (!user) return null

    const teams = await getUserTeams(user.id)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Your Teams</span>
                </CardTitle>
                <CardDescription>
                    Teams you're currently part of
                </CardDescription>
            </CardHeader>
            <CardContent>
                {teams.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 mb-4">No teams yet</p>
                        <Link href="/dashboard/teams" prefetch={true}>
                            <Button>Create your first team</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team) => (
                            <Link key={team.id} href={`/dashboard/teams/${team.id}`} prefetch={true}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{team.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-400 capitalize">
                                                {team.role}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Welcome section
function WelcomeSection({ user }: { user: any }) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
                Here's an overview of your teams, projects and tasks.
            </p>
        </div>
    )
}

export default async function DashboardPage() {
    const user = await currentUser()

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    <WelcomeSection user={user} />

                    <Suspense fallback={<StatsGridSkeleton />}>
                        <DashboardStats />
                    </Suspense>

                    <Suspense fallback={<ChartSkeleton />}>
                        <DashboardChart />
                    </Suspense>

                    <Suspense fallback={<CalendarSkeleton />}>
                        <DashboardCalendar />
                    </Suspense>

                    <Suspense fallback={<TeamsGridSkeleton />}>
                        <DashboardTeams />
                    </Suspense>
                </div>
            </div>
        </div>
    )
} 