'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadProjectFile } from '@/lib/file-actions'

interface FileUploadDialogProps {
    projectId: string
    children: React.ReactNode
    onUploadComplete?: () => void
}

export default function FileUploadDialog({
    projectId,
    children,
    onUploadComplete
}: FileUploadDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_FILE_TYPES = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ]

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const validateFile = (file: File) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size exceeds the 5MB limit')
            return false
        }

        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error('File type not allowed. Please upload JPG, PNG, or PDF')
            return false
        }

        return true
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (validateFile(selectedFile)) {
                setFile(selectedFile)
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('projectId', projectId)

            const result = await uploadProjectFile(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('File uploaded successfully')
                setFile(null)
                setIsOpen(false)
                onUploadComplete?.()
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            toast.error('Failed to upload file')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                    <DialogDescription>
                        Upload a file to this project. Supported formats: JPG, PNG, PDF, Excel (.xls, .xlsx). Max size: 5MB.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <Upload className="h-8 w-8 text-gray-500" />
                            <p className="text-sm font-medium">
                                Drag and drop a file here, or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                                Supported formats: JPG, PNG, PDF, Excel (.xls, .xlsx). Max size: 5MB
                            </p>
                        </div>
                    </div>

                    {file && (
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                    {file.type.startsWith('image/') ? (
                                        <FilePreview file={file} />
                                    ) : (
                                        <div className="text-xs font-medium uppercase">
                                            {file.name.split('.').pop()}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setFile(null)
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFile(null)
                            setIsOpen(false)
                        }}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function FilePreview({ file }: { file: File }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        // Only create URLs in the browser, not during SSR
        if (typeof window !== 'undefined' && file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // Clean up the URL when component unmounts
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file]);

    if (!previewUrl) {
        return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs">Loading...</span>
            </div>
        );
    }

    return (
        <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded"
        />
    );
} 