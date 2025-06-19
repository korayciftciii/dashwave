'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileIcon, ImageIcon, FileTextIcon, FileSpreadsheet, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProjectFile } from '@/lib/file-actions'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProjectFile {
    id: string
    fileUrl: string
    fileName: string
    fileType: string
    fileSize: number
    publicId: string
    uploadedBy: string
    createdAt: string | Date
}

interface ProjectFilesListProps {
    files: ProjectFile[]
    onFileDeleted?: () => void
}

export default function ProjectFilesList({ files, onFileDeleted }: ProjectFilesListProps) {
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // Only render on client-side to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Don't render anything during SSR
    if (!isMounted) {
        return (
            <div className="py-8 text-center">
                <p className="text-gray-500">Loading files...</p>
            </div>
        )
    }

    const handleDeleteFile = async (fileId: string) => {
        setDeletingFileId(fileId)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deletingFileId) return

        setIsDeleting(true)
        try {
            const result = await deleteProjectFile(deletingFileId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('File deleted successfully')
                onFileDeleted?.()
            }
        } catch (error) {
            console.error('Error deleting file:', error)
            toast.error('Failed to delete file')
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
            setDeletingFileId(null)
        }
    }

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image':
                return <ImageIcon className="h-6 w-6 text-blue-500" />
            case 'pdf':
                return <FileTextIcon className="h-6 w-6 text-red-500" />
            case 'excel':
                return <FileSpreadsheet className="h-6 w-6 text-green-600" />
            default:
                return <FileIcon className="h-6 w-6 text-gray-500" />
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        const kb = bytes / 1024
        if (kb < 1024) return `${kb.toFixed(1)} KB`
        const mb = kb / 1024
        return `${mb.toFixed(1)} MB`
    }

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString()
    }

    return (
        <div className="space-y-4">
            {files && files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                        <Card key={file.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                                {getFileIcon(file.fileType)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-sm truncate max-w-[180px]" title={file.fileName}>
                                                    {file.fileName}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(file.fileSize)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                asChild
                                            >
                                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    setDeletingFileId(file.id)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center border border-dashed rounded-lg">
                    <p className="text-gray-500">No files uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Upload files to share with your team</p>
                </div>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The file will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault()
                                if (deletingFileId) {
                                    confirmDelete()
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 