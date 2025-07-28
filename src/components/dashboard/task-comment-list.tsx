'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { deleteTaskComment } from '@/lib/comment-actions'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
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
import {
    MoreVertical,
    Trash2,
    Paperclip,
    FileText,
    Image as ImageIcon,
    Video,
    FileSpreadsheet,
    FileType
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface User {
    id: string
    name: string | null
    email: string
}

interface Attachment {
    id: string
    fileUrl: string
    fileName: string
    fileType: string
}

interface Mention {
    id: string
    user: User
}

interface Comment {
    id: string
    content: string
    author: User
    attachments: Attachment[]
    mentions: Mention[]
    createdAt: Date
    updatedAt: Date
}

interface TaskCommentListProps {
    comments: Comment[]
    currentUserId: string
    isTeamAdmin: boolean
    onCommentDeleted?: () => void
}

export function TaskCommentList({
    comments,
    currentUserId,
    isTeamAdmin,
    onCommentDeleted
}: TaskCommentListProps) {
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

    const handleDeleteComment = async (commentId: string) => {
        setDeletingCommentId(commentId)

        try {
            const result = await deleteTaskComment(commentId)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('Comment deleted successfully')

            if (onCommentDeleted) {
                onCommentDeleted()
            }
        } catch (error) {
            console.error('Error deleting comment:', error)
            toast.error('Failed to delete comment')
        } finally {
            setDeletingCommentId(null)
        }
    }

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image':
                return <ImageIcon className="h-4 w-4 text-blue-500" />
            case 'video':
                return <Video className="h-4 w-4 text-purple-500" />
            case 'pdf':
                return <FileText className="h-4 w-4 text-red-500" />
            case 'excel':
                return <FileSpreadsheet className="h-4 w-4 text-green-500" />
            case 'word':
                return <FileText className="h-4 w-4 text-blue-500" />
            default:
                return <FileType className="h-4 w-4 text-gray-500" />
        }
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No comments yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {comments.map((comment) => {
                const isAuthor = comment.author.id === currentUserId
                const canDelete = isAuthor || isTeamAdmin
                const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

                return (
                    <Card key={comment.id} className="p-4">
                        <div className="flex justify-between">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="" alt={comment.author.name || comment.author.email} />
                                    <AvatarFallback>
                                        {comment.author.name
                                            ? comment.author.name.split(' ').map(n => n[0]).join('')
                                            : comment.author.email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{comment.author.name || 'Unnamed'}</p>
                                    <p className="text-xs text-gray-500">{formattedDate}</p>
                                </div>
                            </div>

                            {canDelete && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Comment
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this comment? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                        disabled={deletingCommentId === comment.id}
                                                    >
                                                        {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <div className="mt-3 prose prose-sm max-w-none task-comment-content">
                            <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                        </div>

                        {comment.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-medium text-gray-500 mb-2">Attachments</p>
                                <div className="flex flex-wrap gap-2">
                                    {comment.attachments.map((attachment) => {
                                        const isImage = attachment.fileType === 'image'

                                        return (
                                            <a
                                                key={attachment.id}
                                                href={attachment.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group"
                                            >
                                                {isImage ? (
                                                    <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                                                        <img
                                                            src={attachment.fileUrl}
                                                            alt={attachment.fileName}
                                                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 text-sm group-hover:bg-gray-200 transition-colors">
                                                        {getFileIcon(attachment.fileType)}
                                                        <span className="truncate max-w-[150px]">{attachment.fileName}</span>
                                                    </div>
                                                )}
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>
                )
            })}
        </div>
    )
} 