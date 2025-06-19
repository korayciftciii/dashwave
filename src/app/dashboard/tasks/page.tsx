import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TasksContent from './tasks-content'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function TasksPage() {
    const user = await currentUser()

    if (!user) {
        redirect('/sign-in')
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
    })

    if (!dbUser) {
        redirect('/sign-in')
    }

    // Get tasks assigned to user with team membership information
    const assignedTasks = await prisma.task.findMany({
        where: {
            assignedToId: dbUser.id
        },
        include: {
            project: {
                include: {
                    team: {
                        include: {
                            members: {
                                where: {
                                    userId: dbUser.id
                                },
                                select: {
                                    role: true,
                                    canManageTasks: true
                                }
                            }
                        }
                    }
                }
            },
            assignedTo: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TasksContent initialTasks={JSON.parse(JSON.stringify(assignedTasks))} />
        </Suspense>
    )
} 