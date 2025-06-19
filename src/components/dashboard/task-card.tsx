'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Circle,
    Clock,
    CheckCircle,
    Calendar,
    User,
    Tag,
    AlertTriangle,
    Trash2,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link'

interface Task {
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    createdAt: Date
    assignedToId: string | null
    dueDate: Date | null
    startDate: Date | null
    estimatedHours: number | null
    tags: string[]
    notes: string | null
}

interface TeamMember {
    role: string
    canManageTasks: boolean
}

interface TaskCardProps {
    task: Task & {
        assignedTo?: {
            name: string | null
            email: string
        } | null
    }
    teamMember?: TeamMember
    onUpdate?: () => void
}

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

const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
}

const priorityEmojis = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
}

export default function TaskCard({ task, teamMember, onUpdate }: TaskCardProps) {
    const [status, setStatus] = useState(task.status)
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const router = useRouter()

    // Format date for display
    const formatDate = (date: Date | null) => {
        if (!date) return 'Not set'
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    // Check if user has permission to delete tasks
    const canDelete = teamMember && (
        teamMember.role === 'OWNER' ||
        teamMember.role === 'MANAGER' ||
        teamMember.canManageTasks
    )

    const handleStatusChange = async (newStatus: string) => {
        if (loading) return

        setLoading(true)
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) {
                throw new Error('Failed to update status')
            }

            setStatus(newStatus)
            onUpdate?.()
            toast.success('Task status updated!')
            router.refresh()
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (deleteLoading) return

        setDeleteLoading(true)
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete task')
            }

            toast.success('Task deleted successfully')
            setDeleteDialogOpen(false)
            onUpdate?.()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete task')
        } finally {
            setDeleteLoading(false)
        }
    }

    const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Circle
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && status !== 'done'
    const isDueSoon = task.dueDate && !isOverdue &&
        new Date(task.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 &&
        status !== 'done'

    return (
        <Card className={`w-full ${isOverdue ? 'border-red-300 bg-red-50' : isDueSoon ? 'border-yellow-300 bg-yellow-50' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{task.title}</span>
                        {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Badge className={`${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                            {priorityEmojis[task.priority as keyof typeof priorityEmojis]} {task.priority}
                        </Badge>
                        <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
                            {statusLabels[status as keyof typeof statusLabels]}
                        </Badge>

                        {/* Delete task button for managers and owners */}
                        {canDelete && (
                            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the task "{task.title}". This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={deleteLoading}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {deleteLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                'Delete'
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}
                <div className="flex flex-wrap gap-2 items-center text-sm">
                    {task.dueDate && (
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                                Due {formatDate(task.dueDate)}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <div className="w-full flex items-center justify-between">
                    <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        View details
                    </Link>

                    <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardFooter>
        </Card>
    )
} 