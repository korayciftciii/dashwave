import { currentUser } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, Plus, Users } from 'lucide-react'
import { getUserTeams } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProjectsPage() {
    const user = await currentUser()

    if (!user) {
        return null
    }

    const teams = await getUserTeams(user.id)

    // Get all projects from all teams
    const allProjects = await Promise.all(
        teams.map(async (team) => {
            const projects = await prisma.project.findMany({
                where: { teamId: team.id },
                include: {
                    tasks: true,
                    team: true
                },
                orderBy: { createdAt: 'desc' }
            })
            return projects
        })
    )

    const projects = allProjects.flat()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600 mt-2">
                        All projects across your teams.
                    </p>
                </div>
                <Link href="/dashboard/teams">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Browse Teams
                    </Button>
                </Link>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-500 text-center mb-6 max-w-sm">
                            Projects are created within teams. Start by creating or joining a team.
                        </p>
                        <Link href="/dashboard/teams">
                            <Button>
                                <Users className="h-4 w-4 mr-2" />
                                Go to Teams
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <FolderOpen className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{project.name}</CardTitle>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                    {project.team.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
                                        {project.tasks.length > 0 && (
                                            <span className="ml-2">
                                                • {project.tasks.filter(task => task.status === 'done').length} completed
                                            </span>
                                        )}
                                    </CardDescription>
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
} 