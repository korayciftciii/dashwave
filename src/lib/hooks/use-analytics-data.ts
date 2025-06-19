'use client'

import { useState, useEffect } from 'react'

// Define types for analytics data
interface TaskStatusDistribution {
    todo: number
    inProgress: number
    done: number
    blocked: number
}

interface TaskPriorityDistribution {
    low: number
    medium: number
    high: number
    urgent: number
}

interface ProjectTaskCount {
    name: string
    taskCount: number
}

export interface AnalyticsData {
    totalTeams: number
    totalProjects: number
    totalTasks: number
    completionRate: number
    taskStatusDistribution: TaskStatusDistribution
    taskPriorityDistribution: TaskPriorityDistribution
    projectTaskCounts: ProjectTaskCount[]
    isLoading: boolean
    error: string | null
}

/**
 * Hook to fetch user analytics data for dashboard
 */
export function useAnalyticsData() {
    const [data, setData] = useState<AnalyticsData>({
        totalTeams: 0,
        totalProjects: 0,
        totalTasks: 0,
        completionRate: 0,
        taskStatusDistribution: {
            todo: 0,
            inProgress: 0,
            done: 0,
            blocked: 0
        },
        taskPriorityDistribution: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0
        },
        projectTaskCounts: [],
        isLoading: true,
        error: null
    })

    useEffect(() => {
        async function fetchAnalyticsData() {
            try {
                // Fetch data from API endpoint
                const response = await fetch('/api/analytics', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data')
                }

                const result = await response.json()

                // Process the data
                const completionRate = result.totalTasks > 0
                    ? Math.round((result.taskStatusDistribution.done / result.totalTasks) * 100)
                    : 0

                setData({
                    ...result,
                    completionRate,
                    isLoading: false,
                    error: null
                })
            } catch (error) {
                setData(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'An unknown error occurred'
                }))
            }
        }

        fetchAnalyticsData()
    }, [])

    return data
} 