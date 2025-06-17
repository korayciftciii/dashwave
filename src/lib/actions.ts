import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function ensureUserExists() {
    const user = await currentUser()
    if (!user) {
        redirect('/sign-in')
    }

    // Check if user exists in database
    let dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    })

    // Create user if doesn't exist
    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                name: user.fullName || user.firstName || 'User',
            },
        })
    }

    return dbUser
}

export async function getUserStats(clerkId: string) {
    await ensureUserExists()

    // Get user's teams
    const userTeams = await prisma.teamMember.findMany({
        where: {
            user: { clerkId }
        },
        include: {
            team: {
                include: {
                    projects: {
                        include: {
                            tasks: true
                        }
                    }
                }
            }
        }
    })

    const totalTeams = userTeams.length
    const totalProjects = userTeams.reduce((acc: number, tm: any) => acc + tm.team.projects.length, 0)
    const allTasks = userTeams.flatMap((tm: any) => tm.team.projects.flatMap((p: any) => p.tasks))
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((task: any) => task.status === 'done').length

    return {
        totalTeams,
        totalProjects,
        totalTasks,
        completedTasks
    }
}

export async function getUserTeams(clerkId: string) {
    await ensureUserExists()

    const userTeams = await prisma.teamMember.findMany({
        where: {
            user: { clerkId }
        },
        include: {
            team: {
                include: {
                    members: true
                }
            }
        }
    })

    return userTeams.map((tm: any) => ({
        id: tm.team.id,
        name: tm.team.name,
        role: tm.role,
        members: tm.team.members,
        createdAt: tm.team.createdAt
    }))
}

export async function createTeam(name: string) {
    const user = await ensureUserExists()

    const team = await prisma.team.create({
        data: {
            name,
            members: {
                create: {
                    userId: user.id,
                    role: 'OWNER',
                    canManageTeam: true,
                    canManageProjects: true,
                    canManageTasks: true,
                    canViewAll: true
                }
            }
        }
    })

    return team
}

export async function getTeamProjects(teamId: string) {
    const { userId } = auth()
    if (!userId) {
        redirect('/sign-in')
    }

    // Check if user is member of team
    const membership = await prisma.teamMember.findFirst({
        where: {
            teamId,
            user: { clerkId: userId }
        }
    })

    if (!membership) {
        throw new Error('Not authorized to view this team')
    }

    const projects = await prisma.project.findMany({
        where: { teamId },
        include: {
            tasks: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return projects
}

export async function createProject(teamId: string, name: string) {
    const { userId } = auth()
    if (!userId) {
        redirect('/sign-in')
    }

    // Check if user is member of team
    const membership = await prisma.teamMember.findFirst({
        where: {
            teamId,
            user: { clerkId: userId }
        }
    })

    if (!membership) {
        throw new Error('Not authorized to create projects in this team')
    }

    const project = await prisma.project.create({
        data: {
            name,
            teamId
        }
    })

    return project
}

export async function getProjectTasks(projectId: string) {
    const { userId } = auth()
    if (!userId) {
        redirect('/sign-in')
    }

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            team: {
                members: {
                    some: {
                        user: { clerkId: userId }
                    }
                }
            }
        }
    })

    if (!project) {
        throw new Error('Project not found or access denied')
    }

    const tasks = await prisma.task.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
    })

    return tasks
}

export async function createTask(
    projectId: string,
    title: string,
    description?: string,
    assignedToClerkId?: string,
    status: 'todo' | 'in-progress' | 'done' = 'todo'
) {
    const { userId } = auth()
    if (!userId) {
        redirect('/sign-in')
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    if (!currentUser) {
        throw new Error('User not found')
    }

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            team: {
                members: {
                    some: {
                        user: { clerkId: userId }
                    }
                }
            }
        }
    })

    if (!project) {
        throw new Error('Project not found or access denied')
    }

    // Find assigned user if provided
    let assignedToUserId = null
    if (assignedToClerkId) {
        const assignedUser = await prisma.user.findUnique({
            where: { clerkId: assignedToClerkId }
        })
        if (assignedUser) {
            assignedToUserId = assignedUser.id
        }
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            projectId,
            status: status || 'todo',
            assignedToId: assignedToUserId,
            createdById: currentUser.id
        }
    })

    return task
}

export async function updateTaskStatus(taskId: string, status: string) {
    const { userId } = auth()
    if (!userId) {
        redirect('/sign-in')
    }

    // Check if user has access to this task
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                team: {
                    members: {
                        some: {
                            user: { clerkId: userId }
                        }
                    }
                }
            }
        }
    })

    if (!task) {
        throw new Error('Task not found or access denied')
    }

    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status }
    })

    return updatedTask
} 