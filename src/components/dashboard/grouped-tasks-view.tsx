'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, FolderOpen, Users, Calendar, CheckSquare } from 'lucide-react'
import TaskCard from './task-card'

interface GroupedTasksViewProps {
    projects: Array<{
        id: string
        name: string
        description: string | null
        team: {
            name: string
        }
        tasks: any[]
        createdAt: Date
    }>
    title?: string
    description?: string
}

export default function GroupedTasksView({
    projects,
    title = "Tasks by Project",
    description = "Organized view of all tasks grouped by their projects"
}: GroupedTasksViewProps) {
    const [openProjects, setOpenProjects] = useState<Set<string>>(new Set())

    const toggleProject = (projectId: string) => {
        const newOpenProjects = new Set(openProjects)
        if (newOpenProjects.has(projectId)) {
            newOpenProjects.delete(projectId)
        } else {
            newOpenProjects.add(projectId)
        }
        setOpenProjects(newOpenProjects)
    }

    const getProjectStats = (tasks: any[]) => {
        const total = tasks.length
        const todo = tasks.filter(t => t.status === 'todo').length
        const inProgress = tasks.filter(t => t.status === 'in-progress').length
        const done = tasks.filter(t => t.status === 'done').length
        return { total, todo, inProgress, done }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FolderOpen className="h-5 w-5" />
                        <span>{title}</span>
                    </CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            </Card>

            <div className="space-y-4">
                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <div className="text-center text-gray-500">
                                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No projects found</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    projects.map((project) => {
                        const stats = getProjectStats(project.tasks)
                        const isOpen = openProjects.has(project.id)

                        return (
                            <Card key={project.id}>
                                <Collapsible open={isOpen} onOpenChange={() => toggleProject(project.id)}>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {isOpen ? (
                                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                                    )}
                                                    <div>
                                                        <CardTitle className="text-lg">{project.name}</CardTitle>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <Users className="h-4 w-4" />
                                                                <span>{project.team.name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">
                                                    {stats.total} tasks
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <CardContent className="pt-0">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div className="space-y-3">
                                                    <h4 className="font-medium">To Do ({stats.todo})</h4>
                                                    {project.tasks
                                                        .filter((task: any) => task.status === 'todo')
                                                        .map((task: any) => (
                                                            <TaskCard key={task.id} task={task} />
                                                        ))
                                                    }
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="font-medium">In Progress ({stats.inProgress})</h4>
                                                    {project.tasks
                                                        .filter((task: any) => task.status === 'in-progress')
                                                        .map((task: any) => (
                                                            <TaskCard key={task.id} task={task} />
                                                        ))
                                                    }
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="font-medium">Done ({stats.done})</h4>
                                                    {project.tasks
                                                        .filter((task: any) => task.status === 'done')
                                                        .map((task: any) => (
                                                            <TaskCard key={task.id} task={task} />
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
