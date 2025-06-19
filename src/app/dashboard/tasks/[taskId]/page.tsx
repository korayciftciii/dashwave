import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Tag,
    User,
    CheckCircle2,
    Circle,
    AlertCircle,
    Edit
} from 'lucide-react'

// Generate dynamic metadata for the page
type Props = {
    params: { taskId: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { userId } = auth()
    if (!userId) {
        return {
            title: 'Task Details'
        }
    }

    const task = await prisma.task.findUnique({
        where: { id: params.taskId },
        select: { title: true }
    })

    return {
        title: task ? `Task: ${task.title}` : 'Task Not Found'
    }
}

// Status and priority styling
const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
}

const statusLabels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
}

const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
}

const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
}

export default async function TaskDetailPage({ params }: Props) {
    // Check authentication
    const { userId } = auth()
    if (!userId) {
        redirect('/sign-in')
    }

    // Get the task with all related data
    const task = await prisma.task.findUnique({
        where: { id: params.taskId },
        include: {
            project: {
                include: {
                    team: true
                }
            },
            assignedTo: true,
            createdBy: true
        }
    })

    // Check if task exists
    if (!task) {
        notFound()
    }

    // Check if user has access to this task (is a member of the team)
    const teamMember = await prisma.teamMember.findFirst({
        where: {
            team: { id: task.project.teamId },
            user: { clerkId: userId }
        }
    })

    if (!teamMember) {
        // User doesn't have access to this task
        notFound()
    }

    // Format dates for display
    const formatDate = (date: Date | null) => {
        if (!date) return 'Not set'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Check if user can edit the task
    const canEdit =
        teamMember.role === 'OWNER' ||
        teamMember.role === 'MANAGER' ||
        teamMember.canManageTasks ||
        task.createdBy.clerkId === userId

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Back button */}
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/tasks" className="flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Tasks</span>
                    </Link>
                </Button>
            </div>

            {/* Task header */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold mb-2">{task.title}</CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Link href={`/dashboard/projects/${task.projectId}`} className="hover:underline flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {task.project.name}
                                </Link>
                                <span>•</span>
                                <Link href={`/dashboard/teams/${task.project.teamId}`} className="hover:underline">
                                    {task.project.team.name}
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                                {task.status === 'todo' ? <Circle className="h-3 w-3 mr-1" /> :
                                    task.status === 'in-progress' ? <Clock className="h-3 w-3 mr-1" /> :
                                        <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {statusLabels[task.status as keyof typeof statusLabels]}
                            </Badge>
                            <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                                <span className="mr-1">{priorityIcons[task.priority as keyof typeof priorityIcons]}</span>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                            {canEdit && (
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/dashboard/tasks/${task.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Task details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="details">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6 pt-4">
                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {task.description ? (
                                        <div className="prose max-w-none">
                                            {task.description}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No description provided</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {task.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Additional Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose max-w-none">
                                            {task.notes}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center">
                                            <Tag className="h-4 w-4 mr-2" />
                                            Tags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {task.tags.map((tag) => (
                                                <Badge key={tag} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* People */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">People</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Assigned to */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Assigned to
                                </p>
                                {task.assignedTo ? (
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="" alt={task.assignedTo.name || task.assignedTo.email} />
                                            <AvatarFallback>
                                                {task.assignedTo.name
                                                    ? task.assignedTo.name.split(' ').map(n => n[0]).join('')
                                                    : task.assignedTo.email.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{task.assignedTo.name || 'Unnamed'}</p>
                                            <p className="text-xs text-muted-foreground">{task.assignedTo.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">Unassigned</p>
                                )}
                            </div>

                            {/* Created by */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Created by
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt={task.createdBy.name || task.createdBy.email} />
                                        <AvatarFallback>
                                            {task.createdBy.name
                                                ? task.createdBy.name.split(' ').map(n => n[0]).join('')
                                                : task.createdBy.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{task.createdBy.name || 'Unnamed'}</p>
                                        <p className="text-xs text-muted-foreground">{task.createdBy.email}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Due date */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Due date
                                </p>
                                <p className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
                                    ? "text-red-600 font-medium" : ""}>
                                    {formatDate(task.dueDate)}
                                    {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && (
                                        <span className="ml-2 inline-flex items-center">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Overdue
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Start date */}
                            {task.startDate && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Start date
                                    </p>
                                    <p>{formatDate(task.startDate)}</p>
                                </div>
                            )}

                            {/* Estimated hours */}
                            {task.estimatedHours !== null && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Estimated hours
                                    </p>
                                    <p>{task.estimatedHours} hours</p>
                                </div>
                            )}

                            {/* Created at */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                                <p>{formatDate(task.createdAt)}</p>
                            </div>

                            {/* Updated at */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Last updated</p>
                                <p>{formatDate(task.updatedAt)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 