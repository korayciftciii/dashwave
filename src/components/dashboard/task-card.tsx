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
import { Circle, Clock, CheckCircle, MoreHorizontal, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'

interface Task {
    id: string
    title: string
    description: string | null
    status: string
    createdAt: Date
    assignedToId: string | null
}

interface TaskCardProps {
    task: Task & {
        assignedTo?: {
            firstName: string | null
            lastName: string | null
            emailAddress: string
        } | null
    }
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

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
    const [status, setStatus] = useState(task.status)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

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

    const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Circle

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
                        {statusLabels[status as keyof typeof statusLabels]}
                    </Badge>
                </div>
            </CardHeader>
            {task.description && (
                <CardContent className="pb-3">
                    <p className="text-sm text-gray-600">{task.description}</p>
                </CardContent>
            )}
            <CardFooter className="flex items-center justify-between pt-3">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                    {task.assignedTo && (
                        <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>
                                {task.assignedTo.firstName || task.assignedTo.lastName
                                    ? `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim()
                                    : task.assignedTo.emailAddress}
                            </span>
                        </div>
                    )}
                </div>
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
            </CardFooter>
        </Card>
    )
} 