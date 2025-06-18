'use client'

import { useState, useMemo } from 'react'
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar'
import moment from 'moment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Clock, User, AlertTriangle } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface TaskCalendarProps {
    tasks: Array<{
        id: string
        title: string
        description: string | null
        status: string
        priority: string
        dueDate: Date | null
        startDate: Date | null
        estimatedHours?: number | null
        tags?: string[]
        assignedTo?: {
            name: string | null
            email: string
        } | null
        project?: {
            name: string
        }
    }>
    title?: string
    description?: string
}

interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    resource: any
}

export default function TaskCalendar({
    tasks,
    title = "Task Calendar",
    description = "Tasks organized by due dates"
}: TaskCalendarProps) {
    const [view, setView] = useState<View>(Views.MONTH)
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [showTaskModal, setShowTaskModal] = useState(false)

    // Convert tasks to calendar events
    const events: CalendarEvent[] = useMemo(() => {
        return tasks
            .filter(task => task.dueDate || task.startDate)
            .map(task => {
                const dueDate = task.dueDate ? new Date(task.dueDate) : null
                const startDate = task.startDate ? new Date(task.startDate) : null

                // Use start date as start, due date as end, or same day if only one exists
                const eventStart = startDate || dueDate!
                const eventEnd = dueDate || startDate!

                return {
                    id: task.id,
                    title: task.title,
                    start: eventStart,
                    end: eventEnd,
                    resource: task
                }
            })
    }, [tasks])

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedTask(event.resource)
        setShowTaskModal(true)
    }

    const eventPropGetter = (event: CalendarEvent) => {
        const task = event.resource
        let backgroundColor = '#6b7280' // default gray

        // Status colors
        switch (task.status) {
            case 'todo':
                backgroundColor = '#6b7280'
                break
            case 'in-progress':
                backgroundColor = '#3b82f6'
                break
            case 'done':
                backgroundColor = '#10b981'
                break
        }

        // Priority override
        if (task.priority === 'urgent') {
            backgroundColor = '#ef4444'
        } else if (task.priority === 'high') {
            backgroundColor = '#f97316'
        }

        return {
            style: {
                backgroundColor,
                borderColor: backgroundColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                padding: '2px 6px'
            }
        }
    }

    const CustomEvent = ({ event }: { event: CalendarEvent }) => {
        const task = event.resource
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

        return (
            <div className="flex items-center space-x-1 text-xs truncate">
                {isOverdue && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                <span className="truncate">{event.title}</span>
                {task.priority === 'urgent' && <span className="flex-shrink-0">🔴</span>}
                {task.priority === 'high' && <span className="flex-shrink-0">🟠</span>}
            </div>
        )
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return '🔴'
            case 'high': return '🟠'
            case 'medium': return '🟡'
            case 'low': return '🟢'
            default: return '⚪'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo': return 'bg-gray-100 text-gray-800'
            case 'in-progress': return 'bg-blue-100 text-blue-800'
            case 'done': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const statsData = useMemo(() => {
        const total = tasks.length
        const withDates = tasks.filter(t => t.dueDate || t.startDate).length
        const overdue = tasks.filter(t =>
            t.dueDate && new Date(t.dueDate) < new Date() && !['done', 'completed'].includes(t.status)
        ).length
        const dueSoon = tasks.filter(t => {
            if (!t.dueDate || ['done', 'completed'].includes(t.status)) return false
            const dueDate = new Date(t.dueDate)
            const now = new Date()
            const diffTime = dueDate.getTime() - now.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays <= 3 && diffDays > 0
        }).length

        return { total, withDates, overdue, dueSoon }
    }, [tasks])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5" />
                            <span>{title}</span>
                        </CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={view === Views.MONTH ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView(Views.MONTH)}
                        >
                            Month
                        </Button>
                        <Button
                            variant={view === Views.WEEK ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView(Views.WEEK)}
                        >
                            Week
                        </Button>
                        <Button
                            variant={view === Views.DAY ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView(Views.DAY)}
                        >
                            Day
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{statsData.total}</div>
                        <div className="text-xs text-gray-500">Total Tasks</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{statsData.withDates}</div>
                        <div className="text-xs text-gray-500">With Dates</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{statsData.overdue}</div>
                        <div className="text-xs text-gray-500">Overdue</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{statsData.dueSoon}</div>
                        <div className="text-xs text-gray-500">Due Soon</div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-500 rounded"></div>
                        <span>To Do</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>In Progress</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Done</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Urgent</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span>High Priority</span>
                    </div>
                </div>

                {/* Calendar */}
                <div style={{ height: '600px' }}>
                    {events.length > 0 ? (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            view={view}
                            onView={setView}
                            views={[Views.MONTH, Views.WEEK, Views.DAY]}
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventPropGetter}
                            components={{
                                event: CustomEvent
                            }}
                            popup
                            popupOffset={{ x: 30, y: 20 }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No tasks with dates found</p>
                                <p className="text-sm mt-2">
                                    Tasks need start dates or due dates to appear on the calendar
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Task Detail Modal */}
            <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Task Details</DialogTitle>
                    </DialogHeader>
                    {selectedTask && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                                {selectedTask.description && (
                                    <p className="text-gray-600 mt-1">{selectedTask.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Badge className={`mt-1 ${getStatusColor(selectedTask.status)}`}>
                                        {selectedTask.status}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Priority</label>
                                    <div className="mt-1 flex items-center space-x-1">
                                        <span>{getPriorityIcon(selectedTask.priority)}</span>
                                        <span className="text-sm capitalize">{selectedTask.priority}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedTask.assignedTo && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Assigned To</label>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">
                                            {selectedTask.assignedTo.name || selectedTask.assignedTo.email}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {selectedTask.startDate && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                                        <div className="mt-1 text-sm text-gray-600">
                                            {new Date(selectedTask.startDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                {selectedTask.dueDate && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Due Date</label>
                                        <div className="mt-1 text-sm text-gray-600">
                                            {new Date(selectedTask.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedTask.estimatedHours && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Estimated Hours</label>
                                    <div className="mt-1 flex items-center space-x-1">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{selectedTask.estimatedHours}h</span>
                                    </div>
                                </div>
                            )}

                            {selectedTask.tags && selectedTask.tags.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tags</label>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {selectedTask.tags.map((tag: string, index: number) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTask.project && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Project</label>
                                    <div className="mt-1 text-sm text-gray-600">
                                        {selectedTask.project.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
} 