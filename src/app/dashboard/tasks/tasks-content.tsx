'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, User, FolderOpen, CheckCircle2, Clock, Circle, Download } from 'lucide-react'
import TaskCard from '@/components/dashboard/task-card'
import TasksTable from '@/components/dashboard/tasks-table'
import * as XLSX from 'xlsx'

const statusIcons = {
    todo: Circle,
    'in-progress': Clock,
    done: CheckCircle2,
}

const statusColors = {
    todo: 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    done: 'bg-green-500'
}

const statusLabels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
}

export default function TasksContent({ initialTasks }: { initialTasks: any[] }) {
    const [tasks] = useState(initialTasks)

    // Group tasks by status
    const tasksByStatus = tasks.reduce((acc: Record<string, any[]>, task) => {
        const status = task.status
        if (!acc[status]) {
            acc[status] = []
        }
        acc[status].push(task)
        return acc
    }, {})

    // Ensure all status categories exist even if empty
    const statuses = ['todo', 'in-progress', 'done']
    statuses.forEach(status => {
        if (!tasksByStatus[status]) {
            tasksByStatus[status] = []
        }
    })

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Tasks</h1>
                <TaskExportButton tasks={tasks} />
            </div>

            <Tabs defaultValue="cards">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="cards">Card View</TabsTrigger>
                        <TabsTrigger value="table">Table View</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="cards" className="space-y-6">
                    {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
                        const StatusIcon = statusIcons[status as keyof typeof statusIcons]
                        return (
                            <Card key={status}>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <StatusIcon className={`h-5 w-5 ${status === 'todo' ? 'text-gray-500' : status === 'in-progress' ? 'text-blue-500' : 'text-green-500'}`} />
                                        <span>{statusLabels[status as keyof typeof statusLabels]}</span>
                                        <Badge variant="secondary">{statusTasks.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {statusTasks.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4 text-sm">
                                            No tasks in this status
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {statusTasks.map((task) => {
                                                const teamMember = task.project.team.members[0]
                                                return (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        teamMember={teamMember}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </TabsContent>

                <TabsContent value="table">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Tasks</CardTitle>
                            <CardDescription>
                                View and manage all your assigned tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TasksTable tasks={tasks} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Client component for Excel export
function TaskExportButton({ tasks }: { tasks: any[] }) {
    const handleExport = () => {
        // Format tasks for export
        const exportData = tasks.map(task => ({
            'Title': task.title,
            'Description': task.description || '',
            'Status': task.status,
            'Priority': task.priority,
            'Project': task.project.name,
            'Team': task.project.team.name,
            'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
            'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
            'Estimated Hours': task.estimatedHours || '',
            'Created At': new Date(task.createdAt).toLocaleDateString(),
            'Updated At': new Date(task.updatedAt).toLocaleDateString(),
        }))

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData)

        // Create workbook
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks')

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, 'my-tasks.xlsx')
    }

    return (
        <Button onClick={handleExport} variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
        </Button>
    )
} 