'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useDashboardData() {
    return useSWR('/api/dashboard', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000, // 1 dakika
        refreshInterval: 300000, // 5 dakika
    })
}

export function useTeamData(teamId: string) {
    return useSWR(teamId ? `/api/teams/${teamId}` : null, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 1 dakika
    })
}

export function useProjectData(projectId: string) {
    return useSWR(projectId ? `/api/projects/${projectId}` : null, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 1 dakika
    })
}

export function useTaskData(taskId: string) {
    return useSWR(taskId ? `/api/tasks/${taskId}` : null, fetcher, {
        revalidateOnFocus: true,
    })
} 