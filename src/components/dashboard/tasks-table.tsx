'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search } from "lucide-react"
import * as XLSX from 'xlsx'
import Link from "next/link"

interface Task {
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    createdAt: Date
    assignedToId: string | null
    dueDate: Date | null
    startDate: Date | null
    estimatedHours: number | null
    tags: string[]
    notes: string | null
    assignedTo?: {
        name: string | null
        email: string
    } | null
    project: {
        name: string
        team: {
            name: string
        }
    }
}

interface TasksTableProps {
    tasks: Task[]
}

const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
}

const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
}

export default function TasksTable({ tasks }: TasksTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredTasks, setFilteredTasks] = useState(tasks)

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term)
        const filtered = tasks.filter(task =>
            task.title.toLowerCase().includes(term.toLowerCase()) ||
            task.description?.toLowerCase().includes(term.toLowerCase()) ||
            task.assignedTo?.name?.toLowerCase().includes(term.toLowerCase()) ||
            task.assignedTo?.email.toLowerCase().includes(term.toLowerCase()) ||
            task.status.toLowerCase().includes(term.toLowerCase()) ||
            task.priority.toLowerCase().includes(term.toLowerCase()) ||
            task.project.name.toLowerCase().includes(term.toLowerCase()) ||
            task.project.team.name.toLowerCase().includes(term.toLowerCase())
        )
        setFilteredTasks(filtered)
    }

    // Handle export to Excel
    const handleExport = () => {
        // Prepare data for export
        const exportData = tasks.map(task => ({
            'Title': task.title,
            'Description': task.description || '',
            'Status': task.status,
            'Priority': task.priority,
            'Assigned To': task.assignedTo ? (task.assignedTo.name || task.assignedTo.email) : 'Unassigned',
            'Project': task.project.name,
            'Team': task.project.team.name,
            'Created At': new Date(task.createdAt).toLocaleDateString(),
            'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
            'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
            'Estimated Hours': task.estimatedHours || '',
            'Tags': task.tags.join(', '),
            'Notes': task.notes || ''
        }))

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(exportData)

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks')

        // Generate Excel file
        XLSX.writeFile(wb, `tasks_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-64"
                    />
                </div>
                <Button onClick={handleExport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/dashboard/tasks/${task.id}`} className="hover:underline">
                                        {task.title}
                                    </Link>
                                    {task.description && (
                                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                                        {task.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                                        {task.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {task.assignedTo ? (
                                        task.assignedTo.name || task.assignedTo.email
                                    ) : (
                                        <span className="text-gray-500">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.dueDate ? (
                                        new Date(task.dueDate).toLocaleDateString()
                                    ) : (
                                        <span className="text-gray-500">-</span>
                                    )}
                                </TableCell>
                                <TableCell>{task.project.name}</TableCell>
                                <TableCell>{task.project.team.name}</TableCell>
                                <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
} 