import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Plus, ArrowLeft, Circle, Clock, CheckCircle } from 'lucide-react'
import { getProjectTasks } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CreateTaskDialog from '@/components/dashboard/create-task-dialog'
import TaskCard from '@/components/dashboard/task-card'

interface ProjectPageProps {
    params: {
        projectId: string
    }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { userId } = auth()

    if (!userId) {
        redirect('/sign-in')
    }

    // Get project details with team members
    const project = await prisma.project.findFirst({
        where: {
            id: params.projectId,
            team: {
                members: {
                    some: {
                        user: { clerkId: userId }
                    }
                }
            }
        },
        include: {
            team: {
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    })

    if (!project) {
        notFound()
    }

    // Get project tasks
    const tasks = await getProjectTasks(params.projectId)

    // Task statistics
    const todoTasks = tasks.filter(task => task.status === 'todo')
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress')
    const doneTasks = tasks.filter(task => task.status === 'done')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href={`/dashboard/teams/${project.teamId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to {project.team.name}
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        <p className="text-gray-600 mt-2">
                            Manage tasks and track progress for this project.
                        </p>
                    </div>
                </div>
                <CreateTaskDialog
                    projectId={project.id}
                    teamMembers={project.team.members}
                >
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </CreateTaskDialog>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            All tasks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">To Do</CardTitle>
                        <Circle className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todoTasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Pending tasks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressTasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active tasks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{doneTasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Finished tasks
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tasks Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Todo Column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Circle className="h-5 w-5 text-gray-500 mr-2" />
                            To Do ({todoTasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {todoTasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No tasks to do</p>
                        ) : (
                            todoTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* In Progress Column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                            In Progress ({inProgressTasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {inProgressTasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No tasks in progress</p>
                        ) : (
                            inProgressTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Done Column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            Done ({doneTasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {doneTasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No completed tasks</p>
                        ) : (
                            doneTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 