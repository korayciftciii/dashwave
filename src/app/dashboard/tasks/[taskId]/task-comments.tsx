'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskCommentForm } from '@/components/dashboard/task-comment-form'
import { TaskCommentList } from '@/components/dashboard/task-comment-list'
import { getTaskComments } from '@/lib/comment-actions'
import { Loader2 } from 'lucide-react'

interface User {
    id: string
    name: string | null
    email: string
}

interface TaskCommentsProps {
    taskId: string
    users: User[]
    currentUserId: string
    isTeamAdmin: boolean
}

export default function TaskComments({
    taskId,
    users,
    currentUserId,
    isTeamAdmin
}: TaskCommentsProps) {
    const [comments, setComments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchComments = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await getTaskComments(taskId)

            if (result.error) {
                setError(result.error)
                return
            }

            setComments(result.comments || [])
        } catch (error) {
            console.error('Error fetching comments:', error)
            setError('Failed to load comments')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [taskId])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <TaskCommentList
                            comments={comments}
                            currentUserId={currentUserId}
                            isTeamAdmin={isTeamAdmin}
                            onCommentDeleted={fetchComments}
                        />
                    )}

                    <div className="pt-4 border-t">
                        <TaskCommentForm
                            taskId={taskId}
                            users={users}
                            onCommentAdded={fetchComments}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 