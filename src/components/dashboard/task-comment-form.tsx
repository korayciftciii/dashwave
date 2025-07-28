'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { addTaskComment, uploadCommentAttachment } from '@/lib/comment-actions'
import { toast } from 'sonner'
import { Paperclip, Send, Loader2 } from 'lucide-react'

interface User {
    id: string
    name: string | null
    email: string
}

interface TaskCommentFormProps {
    taskId: string
    users: User[]
    onCommentAdded?: () => void
}

export function TaskCommentForm({ taskId, users, onCommentAdded }: TaskCommentFormProps) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([])
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleContentChange = (html: string) => {
        setContent(html)
    }

    const handleMention = (userId: string) => {
        if (!mentionedUserIds.includes(userId)) {
            setMentionedUserIds([...mentionedUserIds, userId])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const newFiles = Array.from(files)
        setPendingFiles([...pendingFiles, ...newFiles])

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removeFile = (index: number) => {
        setPendingFiles(pendingFiles.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim() && pendingFiles.length === 0) {
            toast.error('Please enter a comment or attach a file')
            return
        }

        setIsSubmitting(true)

        try {
            // Add the comment
            const result = await addTaskComment({
                content,
                taskId,
                mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            // Upload attachments if any
            if (pendingFiles.length > 0 && result.commentId) {
                const uploadPromises = pendingFiles.map(file => {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('commentId', result.commentId)
                    return uploadCommentAttachment(formData)
                })

                const uploadResults = await Promise.all(uploadPromises)

                // Check for upload errors
                const errors = uploadResults.filter(result => result.error)
                if (errors.length > 0) {
                    toast.error(`${errors.length} file(s) failed to upload`)
                }
            }

            // Clear form
            setContent('')
            setMentionedUserIds([])
            setPendingFiles([])

            toast.success('Comment added successfully')

            // Notify parent component
            if (onCommentAdded) {
                onCommentAdded()
            }
        } catch (error) {
            console.error('Error submitting comment:', error)
            toast.error('Failed to add comment')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageUpload = async (file: File): Promise<string> => {
        try {
            // Create a temporary URL for preview
            const objectUrl = URL.createObjectURL(file)

            // Add to pending files for actual upload when comment is submitted
            setPendingFiles([...pendingFiles, file])

            return objectUrl
        } catch (error) {
            console.error('Error handling image upload:', error)
            toast.error('Failed to process image')
            return ''
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <RichTextEditor
                placeholder="Write a comment..."
                content={content}
                onChange={handleContentChange}
                users={users}
                onMention={handleMention}
                onUploadImage={handleImageUpload}
                className="bg-white"
            />

            {pendingFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Attachments ({pendingFiles.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {pendingFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1.5 text-sm"
                            >
                                <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                                <span className="truncate max-w-[150px]">{file.name}</span>
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-red-500"
                                    onClick={() => removeFile(index)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attach Files
                    </Button>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
} 