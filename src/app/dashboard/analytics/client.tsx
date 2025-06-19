'use client'

import { useAnalyticsData } from '@/lib/hooks/use-analytics-data'
import { BarChart3, PieChart, LineChart, Loader2 } from 'lucide-react'

export default function AnalyticsDashboardClient() {
    const analyticsData = useAnalyticsData()

    if (analyticsData.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Loading analytics data...</p>
                </div>
            </div>
        )
    }

    if (analyticsData.error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h2 className="text-red-700 font-medium">Error loading analytics</h2>
                    <p className="text-red-600 text-sm">{analyticsData.error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        )
    }

    const {
        totalTeams,
        totalProjects,
        totalTasks,
        completionRate,
        taskStatusDistribution,
        taskPriorityDistribution,
        projectTaskCounts
    } = analyticsData

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Summary Stats */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-2">Teams</h2>
                    <p className="text-3xl font-bold text-blue-600">{totalTeams}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-2">Projects</h2>
                    <p className="text-3xl font-bold text-purple-600">{totalProjects}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-2">Tasks</h2>
                    <p className="text-3xl font-bold text-green-600">{totalTasks}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-2">Completion Rate</h2>
                    <p className="text-3xl font-bold text-amber-600">
                        {completionRate}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Task Status Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Task Status Distribution</h2>
                        <BarChart3 className="text-gray-400 h-5 w-5" />
                    </div>
                    <div className="h-64 flex items-end justify-around">
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-gray-200 rounded-t-lg"
                                style={{ height: `${(taskStatusDistribution.todo / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">To Do</span>
                            <span className="text-gray-500">{taskStatusDistribution.todo}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-blue-400 rounded-t-lg"
                                style={{ height: `${(taskStatusDistribution.inProgress / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">In Progress</span>
                            <span className="text-gray-500">{taskStatusDistribution.inProgress}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-green-400 rounded-t-lg"
                                style={{ height: `${(taskStatusDistribution.done / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">Done</span>
                            <span className="text-gray-500">{taskStatusDistribution.done}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-red-400 rounded-t-lg"
                                style={{ height: `${(taskStatusDistribution.blocked / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">Blocked</span>
                            <span className="text-gray-500">{taskStatusDistribution.blocked}</span>
                        </div>
                    </div>
                </div>

                {/* Task Priority Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Task Priority Distribution</h2>
                        <PieChart className="text-gray-400 h-5 w-5" />
                    </div>
                    <div className="h-64 flex items-end justify-around">
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-blue-200 rounded-t-lg"
                                style={{ height: `${(taskPriorityDistribution.low / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">Low</span>
                            <span className="text-gray-500">{taskPriorityDistribution.low}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-green-300 rounded-t-lg"
                                style={{ height: `${(taskPriorityDistribution.medium / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">Medium</span>
                            <span className="text-gray-500">{taskPriorityDistribution.medium}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-orange-300 rounded-t-lg"
                                style={{ height: `${(taskPriorityDistribution.high / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">High</span>
                            <span className="text-gray-500">{taskPriorityDistribution.high}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 bg-red-500 rounded-t-lg"
                                style={{ height: `${(taskPriorityDistribution.urgent / Math.max(1, totalTasks)) * 200}px` }}>
                            </div>
                            <span className="mt-2 text-sm font-medium">Urgent</span>
                            <span className="text-gray-500">{taskPriorityDistribution.urgent}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects with Most Tasks */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Projects with Most Tasks</h2>
                        <BarChart3 className="text-gray-400 h-5 w-5" />
                    </div>
                    {projectTaskCounts.length > 0 ? (
                        <div className="space-y-4">
                            {projectTaskCounts.map((project, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">{project.name}</span>
                                        <span className="text-sm text-gray-500">{project.taskCount} tasks</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${(project.taskCount / Math.max(1, projectTaskCounts[0].taskCount)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No project data available</p>
                    )}
                </div>

                {/* Task Completion Timeline */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Task Completion</h2>
                        <LineChart className="text-gray-400 h-5 w-5" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Completed Tasks</span>
                            <span className="text-sm text-gray-500">{taskStatusDistribution.done}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">In Progress</span>
                            <span className="text-sm text-gray-500">{taskStatusDistribution.inProgress}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">To Do</span>
                            <span className="text-sm text-gray-500">{taskStatusDistribution.todo}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Blocked</span>
                            <span className="text-sm text-gray-500">{taskStatusDistribution.blocked}</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                            {totalTasks > 0 ? (
                                <>
                                    <div
                                        className="h-full bg-green-500 float-left"
                                        style={{ width: `${(taskStatusDistribution.done / totalTasks) * 100}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-blue-500 float-left"
                                        style={{ width: `${(taskStatusDistribution.inProgress / totalTasks) * 100}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-gray-400 float-left"
                                        style={{ width: `${(taskStatusDistribution.todo / totalTasks) * 100}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-red-500 float-left"
                                        style={{ width: `${(taskStatusDistribution.blocked / totalTasks) * 100}%` }}
                                    ></div>
                                </>
                            ) : (
                                <div className="h-full bg-gray-300 w-full"></div>
                            )}
                        </div>
                        {totalTasks > 0 && (
                            <div className="text-xs text-center mt-2 text-gray-600">
                                {Math.round((taskStatusDistribution.done / totalTasks) * 100)}% Complete
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}