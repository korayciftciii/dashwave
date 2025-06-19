import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileX, ArrowLeft } from 'lucide-react'

export default function TaskNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <FileX className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
                The task you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
                <Link href="/dashboard/tasks" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tasks
                </Link>
            </Button>
        </div>
    )
} 