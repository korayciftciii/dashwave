'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User } from 'lucide-react'

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
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const description = formData.get('description') as string

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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to track work in this project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Task Title *
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter task title..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description (optional)
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Enter task description..."
                            />
                        </div>

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
                                <Label htmlFor="assignedTo">
                                    Assign To
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