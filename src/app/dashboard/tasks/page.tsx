import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, FolderOpen, CheckCircle, Clock, Circle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

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

    // Get tasks assigned to user
    const assignedTasks = await prisma.task.findMany({
        where: {
            assignedToId: dbUser.id
        },
        include: {
            project: {
                include: {
                    team: true
                }
            }
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
                                    tasks.map((task) => (
                                        <Card key={task.id} className="border border-gray-200">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base">{task.title}</CardTitle>
                                                {task.description && (
                                                    <CardDescription className="text-sm">
                                                        {task.description}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <FolderOpen className="h-4 w-4" />
                                                        <span>{task.project.name}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <User className="h-4 w-4" />
                                                        <span>{task.project.team.name}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
} 