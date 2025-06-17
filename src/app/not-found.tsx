import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    Sorry, the page you are looking for doesn't exist or has been moved.
                </p>
                <div className="space-x-4">
                    <Link href="/">
                        <Button variant="outline">Go Home</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
} 