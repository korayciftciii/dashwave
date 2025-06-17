import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle,
    Users,
    FolderOpen,
    CheckSquare,
    ArrowRight,
    Star,
    Shield,
    Zap,
    Globe,
    Mail,
    Crown,
    Sparkles
} from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'

const features = [
    {
        icon: Users,
        title: "Multi-Tenant Teams",
        description: "Create and manage multiple teams with role-based access control and custom permissions."
    },
    {
        icon: FolderOpen,
        title: "Project Management",
        description: "Organize your work with projects and track progress across all your team initiatives."
    },
    {
        icon: CheckSquare,
        title: "Task Management",
        description: "Create, assign, and track tasks with status updates and email notifications."
    },
    {
        icon: Mail,
        title: "Email Notifications",
        description: "Stay updated with automatic email notifications for task assignments and team activities."
    },
    {
        icon: Crown,
        title: "Custom Roles",
        description: "Define custom roles and permissions for team members with granular access control."
    },
    {
        icon: Shield,
        title: "Secure Authentication",
        description: "Enterprise-grade security with Clerk authentication and role-based access."
    }
]

const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "150+", label: "Teams" },
    { value: "2.5k+", label: "Tasks Completed" },
    { value: "24/7", label: "Support" }
]

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Product Manager",
        company: "TechCorp",
        content: "Dashwave transformed how our team collaborates. The role-based permissions are exactly what we needed.",
        avatar: "SJ"
    },
    {
        name: "Michael Chen",
        role: "CTO",
        company: "StartupXYZ",
        content: "Clean interface, powerful features. Our productivity increased by 40% since switching to Dashwave.",
        avatar: "MC"
    },
    {
        name: "Emily Rodriguez",
        role: "Team Lead",
        company: "DesignCo",
        content: "The email notifications and task management features keep everyone on the same page effortlessly.",
        avatar: "ER"
    }
]

export default async function HomePage() {
    const user = await currentUser()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Image
                                    src="/logo.png"
                                    alt="Dashwave Logo"
                                    width={40}
                                    height={40}
                                    className="rounded-xl shadow-sm"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Dashwave
                                </h1>
                                <p className="text-xs text-gray-500">Team Collaboration Platform</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/sign-in">
                                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl mx-auto w-96 h-96 top-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center">
                        <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Multi-Tenant SaaS Platform
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                            Team Collaboration
                            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Reimagined
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Empower your teams with modern project management, role-based access control,
                            and seamless collaboration tools. Built for scale, designed for simplicity.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link href="/sign-up">
                                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl px-8 py-4 text-lg">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/sign-in">
                                <Button size="lg" variant="outline" className="border-2 px-8 py-4 text-lg">
                                    <Users className="mr-2 h-5 w-5" />
                                    View Demo
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything your team needs
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed to streamline your workflow and boost productivity
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Loved by teams worldwide
                        </h2>
                        <p className="text-xl text-gray-600">
                            See what our users say about Dashwave
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{testimonial.name}</h4>
                                            <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                                    <div className="flex mt-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to transform your team?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of teams already using Dashwave to collaborate more effectively
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/sign-up">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                                Start Your Free Trial
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <p className="text-blue-100 text-sm">No credit card required • 14-day free trial</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <Image
                                    src="/logo.png"
                                    alt="Dashwave Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-lg"
                                />
                                <h3 className="text-xl font-bold">Dashwave</h3>
                            </div>
                            <p className="text-gray-400 mb-4 max-w-md">
                                Modern SaaS platform for team collaboration, project management, and task tracking.
                                Built with Next.js, TypeScript, and modern web technologies.
                            </p>
                            <div className="flex items-center space-x-4">
                                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                    <Globe className="h-3 w-3 mr-1" />
                                    Production Ready
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                    <Zap className="h-3 w-3 mr-1" />
                                    High Performance
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Documentation</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">API</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">About</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Careers</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2025 Dashwave. All rights reserved.
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Created  by <span className="text-blue-400 font-medium">Koray Çiftçi</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
} 