import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, FolderOpen, CheckCircle, Clock, Circle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import TaskCard from '@/components/dashboard/task-card'

const statusIcons = {
    todo: Circle,
    'in-progress': Clock,
    done: CheckCircle,
}

const statusColors = {
    todo: 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    done: 'bg-green-500'
}

const statusLabels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
}

export default async function TasksPage() {
    const user = await currentUser()

    if (!user) {
        redirect('/sign-in')
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
    })

    if (!dbUser) {
        redirect('/sign-in')
    }

    // Get tasks assigned to user with team membership information
    const assignedTasks = await prisma.task.findMany({
        where: {
            assignedToId: dbUser.id
        },
        include: {
            project: {
                include: {
                    team: {
                        include: {
                            members: {
                                where: {
                                    userId: dbUser.id
                                },
                                select: {
                                    role: true,
                                    canManageTasks: true
                                }
                            }
                        }
                    }
                }
            },
            assignedTo: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Group tasks by status
    const tasksByStatus = {
        todo: assignedTasks.filter(task => task.status === 'todo'),
        'in-progress': assignedTasks.filter(task => task.status === 'in-progress'),
        done: assignedTasks.filter(task => task.status === 'done')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                <p className="text-gray-600 mt-2">
                    Tasks assigned to you across all teams and projects.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">To Do</CardTitle>
                        <Circle className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasksByStatus.todo.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasksByStatus['in-progress'].length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasksByStatus.done.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Task Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(tasksByStatus).map(([status, tasks]) => {
                    const StatusIcon = statusIcons[status as keyof typeof statusIcons]

                    return (
                        <Card key={status}>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <StatusIcon className={`h-5 w-5 ${status === 'todo' ? 'text-gray-500' : status === 'in-progress' ? 'text-blue-500' : 'text-green-500'}`} />
                                    <span>{statusLabels[status as keyof typeof statusLabels]}</span>
                                    <Badge variant="secondary">{tasks.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tasks.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 text-sm">
                                        No tasks in this status
                                    </p>
                                ) : (
                                    tasks.map((task) => {
                                        const teamMember = task.project.team.members[0];
                                        const teamMemberInfo = teamMember ? {
                                            role: teamMember.role,
                                            canManageTasks: teamMember.canManageTasks
                                        } : undefined;

                                        return (
                                            <div key={task.id} className="mb-4">
                                                <TaskCard
                                                    task={task}
                                                    teamMember={teamMemberInfo}
                                                />
                                                <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
                                                    <FolderOpen className="h-3 w-3" />
                                                    <span>{task.project.name} • {task.project.team.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
} 