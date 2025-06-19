import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Plus, ArrowLeft, Circle, Clock, CheckCircle, Table2, FileUp } from 'lucide-react'
import { getProjectTasks } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CreateTaskDialog from '@/components/dashboard/create-task-dialog'
import TaskCard from '@/components/dashboard/task-card'
import TasksTable from '@/components/dashboard/tasks-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { getProjectFiles } from '@/lib/file-actions'

// Import file components with dynamic import to prevent hydration issues
const FileUploadDialog = dynamic(
    () => import('@/components/dashboard/file-upload-dialog'),
    { ssr: false }
)

const ProjectFilesList = dynamic(
    () => import('@/components/dashboard/project-files-list'),
    { ssr: false }
)

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

    // Get the current user's team member role
    const currentTeamMember = project.team.members.find(
        member => member.user.clerkId === userId
    )

    if (!currentTeamMember) {
        notFound()
    }

    // Get project tasks
    const tasks = await prisma.task.findMany({
        where: { projectId: params.projectId },
        include: {
            assignedTo: true,
            project: {
                include: {
                    team: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Get project files
    const filesResult = await getProjectFiles(params.projectId)
    const files = filesResult.success ? filesResult.files : []

    // Task statistics
    const todoTasks = tasks.filter(task => task.status === 'todo')
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress')
    const doneTasks = tasks.filter(task => task.status === 'done')

    // Create team member object for permissions
    const teamMemberInfo = {
        role: currentTeamMember.role,
        canManageTasks: currentTeamMember.canManageTasks
    }

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
                <div className="flex items-center space-x-2">
                    <Suspense fallback={<Button variant="outline" disabled>Loading...</Button>}>
                        <FileUploadDialog projectId={project.id}>
                            <Button variant="outline">
                                <FileUp className="h-4 w-4 mr-2" />
                                Upload File
                            </Button>
                        </FileUploadDialog>
                    </Suspense>
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

            {/* Project Content */}
            <Tabs defaultValue="board" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="board" className="flex items-center space-x-2">
                        <CheckSquare className="h-4 w-4" />
                        <span>Board View</span>
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center space-x-2">
                        <Table2 className="h-4 w-4" />
                        <span>All Tasks</span>
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center space-x-2">
                        <FileUp className="h-4 w-4" />
                        <span>Files</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="board" className="space-y-4">
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
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            teamMember={teamMemberInfo}
                                        />
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
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            teamMember={teamMemberInfo}
                                        />
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
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            teamMember={teamMemberInfo}
                                        />
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="table">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Tasks</CardTitle>
                            <CardDescription>
                                View and export all tasks in this project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TasksTable tasks={tasks} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="files">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Project Files</CardTitle>
                                <CardDescription>
                                    Files uploaded to this project
                                </CardDescription>
                            </div>
                            <Suspense fallback={<Button size="sm" disabled><Plus className="h-4 w-4 mr-2" />Loading...</Button>}>
                                <FileUploadDialog projectId={project.id}>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload File
                                    </Button>
                                </FileUploadDialog>
                            </Suspense>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<div className="py-8 text-center"><p className="text-gray-500">Loading files...</p></div>}>
                                <ProjectFilesList files={files} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 