'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, Circle } from 'lucide-react'

interface TaskStatusData {
    name: string
    value: number
    color: string
    icon: React.ReactNode
}

interface TaskStatusChartProps {
    tasks: Array<{
        status: string
        [key: string]: any
    }>
    title?: string
    description?: string
}

const COLORS = {
    todo: '#6B7280',
    'in-progress': '#3B82F6',
    done: '#10B981'
}

const STATUS_LABELS = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
}

const STATUS_ICONS = {
    todo: <Circle className="h-4 w-4" />,
    'in-progress': <Clock className="h-4 w-4" />,
    done: <CheckCircle className="h-4 w-4" />
}

export default function TaskStatusChart({ tasks, title = "Task Status Distribution", description }: TaskStatusChartProps) {
    // Calculate task counts by status
    const statusCounts = tasks.reduce((acc, task) => {
        const status = task.status || 'todo'
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Prepare data for chart
    const data: TaskStatusData[] = Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
        value: count,
        color: COLORS[status as keyof typeof COLORS] || '#6B7280',
        icon: STATUS_ICONS[status as keyof typeof STATUS_ICONS] || <Circle className="h-4 w-4" />
    }))

    const totalTasks = tasks.length

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0]
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        {data.value} tasks ({Math.round((data.value / totalTasks) * 100)}%)
                    </p>
                </div>
            )
        }
        return null
    }

    if (totalTasks === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>{title}</span>
                    </CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        <div className="text-center">
                            <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No tasks found</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>{title}</span>
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
                <div className="text-sm text-gray-600">
                    Total: {totalTasks} tasks
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart */}
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <div className="flex items-center space-x-1">
                                        {item.icon}
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold">{item.value}</div>
                                    <div className="text-xs text-gray-500">
                                        {Math.round((item.value / totalTasks) * 100)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 