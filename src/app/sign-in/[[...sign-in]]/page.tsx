import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <Image
                            src="/logo.png"
                            alt="Dashwave Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <span className="text-2xl font-bold text-gray-900">Dashwave</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
                    <p className="text-gray-600">Sign in to your account to continue</p>
                </div>
                <SignIn
                    forceRedirectUrl="/dashboard"
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-lg",
                        }
                    }}
                />
            </div>
        </div>
    )
} 