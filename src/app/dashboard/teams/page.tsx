import { currentUser } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus } from 'lucide-react'
import { getUserTeams } from '@/lib/actions'
import Link from 'next/link'
import CreateTeamDialog from '@/components/dashboard/create-team-dialog'

export default async function TeamsPage() {
    const user = await currentUser()

    if (!user) {
        return null
    }

    const teams = await getUserTeams(user.id)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your teams and collaborate with others.
                    </p>
                </div>
                <CreateTeamDialog>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Team
                    </Button>
                </CreateTeamDialog>
            </div>

            {/* Teams Grid */}
            {teams.length === 0 ? (
                <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
                        <p className="text-gray-500 text-center mb-6 max-w-sm">
                            Get started by creating your first team. Teams help you organize projects and collaborate with others.
                        </p>
                        <CreateTeamDialog>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create your first team
                            </Button>
                        </CreateTeamDialog>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{team.name}</CardTitle>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`px-2 py-1 text-xs rounded-full ${team.role === 'owner'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {team.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                    </CardDescription>
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
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