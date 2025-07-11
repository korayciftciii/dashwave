'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User, Calendar, Clock, Tag } from 'lucide-react'
import { AIExplainButton } from '@/components/ai/AIExplainButton'

interface TeamMember {
    id: string
    user: {
        id: string
        clerkId: string
        email: string
        name: string | null
    }
    role: string
    teamId: string
    userId: string
}

interface CreateTaskDialogProps {
    children: React.ReactNode
    projectId: string
    teamMembers?: TeamMember[]
}

export default function CreateTaskDialog({ children, projectId, teamMembers = [] }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined)
    const [status, setStatus] = useState('todo')
    const [priority, setPriority] = useState('medium')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const descriptionRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const dueDate = formData.get('dueDate') as string
        const startDate = formData.get('startDate') as string
        const estimatedHours = formData.get('estimatedHours') as string
        const tags = formData.get('tags') as string
        const notes = formData.get('notes') as string

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    title,
                    description: description || undefined,
                    assignedToClerkId: assignedTo || undefined,
                    status,
                    priority,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                    startDate: startDate ? new Date(startDate).toISOString() : undefined,
                    estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
                    tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
                    notes: notes || undefined
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create task')
            }

            toast.success('Task created successfully!')
            setOpen(false)
            router.refresh()
        } catch (error) {
            toast.error('Failed to create task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to track work in this project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Basic Information */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Task Title *
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter task title..."
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                                <Label htmlFor="description">
                                    Description
                                </Label>
                                <div className="flex gap-2">
                                    {description.length > 10 ? (
                                        <AIExplainButton
                                            title={title}
                                            description={description}
                                            onDescriptionGenerated={(generatedText) => {
                                                setDescription(generatedText);
                                                if (descriptionRef.current) {
                                                    descriptionRef.current.focus();
                                                }
                                            }}
                                            disabled={loading}
                                            mode="improve"
                                        />
                                    ) : (
                                        <AIExplainButton
                                            title={title}
                                            onDescriptionGenerated={(generatedText) => {
                                                setDescription(generatedText);
                                                if (descriptionRef.current) {
                                                    descriptionRef.current.focus();
                                                }
                                            }}
                                            disabled={loading}
                                            mode="generate"
                                        />
                                    )}
                                </div>
                            </div>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter task description..."
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                ref={descriptionRef}
                            />
                        </div>

                        {/* Status and Priority */}
                        <div className="grid grid-cols-2 gap-4">
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
                                <User className="h-4 w-4" />
                                <span>Assign To</span>
                            </Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.user.clerkId}>
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src="" alt={member.user.name || member.user.email} />
                                                    <AvatarFallback className="text-xs">
                                                        {member.user.name?.split(' ').map(n => n[0]).join('') ||
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Start Date</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate" className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Due Date</span>
                                </Label>
                                <Input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedHours" className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Estimated Hours</span>
                            </Label>
                            <Input
                                id="estimatedHours"
                                name="estimatedHours"
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="Enter estimated hours..."
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="flex items-center space-x-1">
                                <Tag className="h-4 w-4" />
                                <span>Tags</span>
                            </Label>
                            <Input
                                id="tags"
                                name="tags"
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
                                name="notes"
                                placeholder="Enter any additional notes..."
                                rows={2}
                            />
                        </div>

                        {teamMembers.length === 0 && (
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 text-yellow-800">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">No team members found</span>
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Invite team members to assign tasks to them.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 