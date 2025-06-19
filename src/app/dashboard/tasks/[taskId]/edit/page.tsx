'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Clock, User, Tag, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditTaskPage({ params }: { params: { taskId: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [task, setTask] = useState<any>(null)
    const [teamMembers, setTeamMembers] = useState<any[]>([])

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState('todo')
    const [priority, setPriority] = useState('medium')
    const [assignedToId, setAssignedToId] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [startDate, setStartDate] = useState('')
    const [estimatedHours, setEstimatedHours] = useState('')
    const [tags, setTags] = useState('')
    const [notes, setNotes] = useState('')

    // Fetch task data
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await fetch(`/api/tasks/${params.taskId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch task')
                }

                const data = await response.json()
                setTask(data)

                // Set form values
                setTitle(data.title)
                setDescription(data.description || '')
                setStatus(data.status)
                setPriority(data.priority)
                setAssignedToId(data.assignedTo?.id || '')
                setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '')
                setStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '')
                setEstimatedHours(data.estimatedHours?.toString() || '')
                setTags(data.tags?.join(', ') || '')
                setNotes(data.notes || '')

                // Fetch team members
                const teamResponse = await fetch(`/api/teams/${data.project.teamId}/members`)
                if (teamResponse.ok) {
                    const teamData = await teamResponse.json()
                    setTeamMembers(teamData)
                }

                setInitialLoading(false)
            } catch (error) {
                console.error('Error fetching task:', error)
                toast.error('Failed to load task data')
                router.push(`/dashboard/tasks/${params.taskId}`)
            }
        }

        fetchTask()
    }, [params.taskId, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(`/api/tasks/${params.taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    status,
                    priority,
                    assignedToClerkId: assignedToId ? teamMembers.find(m => m.id === assignedToId)?.user.clerkId : undefined,
                    dueDate: dueDate || undefined,
                    startDate: startDate || undefined,
                    estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
                    tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
                    notes: notes || undefined,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update task')
            }

            toast.success('Task updated successfully')
            router.push(`/dashboard/tasks/${params.taskId}`)
            router.refresh()
        } catch (error) {
            console.error('Error updating task:', error)
            toast.error('Failed to update task')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading task data...</p>
                </div>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Task not found or you don't have permission to edit it.</p>
                    <Button asChild>
                        <Link href="/dashboard/tasks">Back to Tasks</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Back button */}
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/tasks/${params.taskId}`} className="flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Task</span>
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Task</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Task Title *
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Status and Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status
                                </Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">
                                    Priority
                                </Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">🟢 Low</SelectItem>
                                        <SelectItem value="medium">🟡 Medium</SelectItem>
                                        <SelectItem value="high">🟠 High</SelectItem>
                                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Assignment */}
                        <div className="space-y-2">
                            <Label htmlFor="assignedTo" className="flex items-center space-x-1">
                                <User className="h-4 w-4 mr-1" />
                                <span>Assign To</span>
                            </Label>
                            <Select value={assignedToId} onValueChange={setAssignedToId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Unassigned</SelectItem>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src="" alt={member.user.name || member.user.email} />
                                                    <AvatarFallback className="text-xs">
                                                        {member.user.name?.split(' ').map((n: string) => n[0]).join('') ||
                                                            member.user.email.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{member.user.name || member.user.email}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dates and Time Estimation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>Start Date</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate" className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>Due Date</span>
                                </Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedHours" className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Estimated Hours</span>
                            </Label>
                            <Input
                                id="estimatedHours"
                                type="number"
                                min="0"
                                step="0.5"
                                value={estimatedHours}
                                onChange={(e) => setEstimatedHours(e.target.value)}
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="flex items-center space-x-1">
                                <Tag className="h-4 w-4 mr-1" />
                                <span>Tags</span>
                            </Label>
                            <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Enter tags separated by commas..."
                            />
                            <p className="text-xs text-gray-500">
                                Separate multiple tags with commas (e.g., frontend, bug, high-priority)
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                Additional Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" asChild>
                            <Link href={`/dashboard/tasks/${params.taskId}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Task'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
} 