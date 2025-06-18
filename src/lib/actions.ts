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
        // Try to get the best name from user data
        let userName = 'User'

        // First try direct user properties
        if (user.fullName) {
            userName = user.fullName
        } else if (user.firstName && user.lastName) {
            userName = `${user.firstName} ${user.lastName}`
        } else if (user.firstName) {
            userName = user.firstName
        } else if (user.lastName) {
            userName = user.lastName
        } else {
            // Try to get from external accounts (Google, GitHub, etc.)
            const externalAccount = user.externalAccounts.find(account =>
                account.provider === 'oauth_google' ||
                account.provider === 'oauth_github' ||
                account.provider === 'oauth_microsoft'
            )

            if (externalAccount) {
                if (externalAccount.firstName && externalAccount.lastName) {
                    userName = `${externalAccount.firstName} ${externalAccount.lastName}`
                } else if (externalAccount.firstName) {
                    userName = externalAccount.firstName
                } else if (externalAccount.lastName) {
                    userName = externalAccount.lastName
                }
            } else {
                // Use email username as fallback
                const email = user.emailAddresses[0]?.emailAddress
                if (email) {
                    userName = email.split('@')[0]
                }
            }
        }

        dbUser = await prisma.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                name: userName,
            },
        })
    } else {
        // Update existing user if name is still 'User' or 'New User' and we have better data
        if (dbUser.name === 'User' || dbUser.name === 'New User' || !dbUser.name) {
            let userName = dbUser.name || 'User'

            // First try direct user properties
            if (user.fullName) {
                userName = user.fullName
            } else if (user.firstName && user.lastName) {
                userName = `${user.firstName} ${user.lastName}`
            } else if (user.firstName) {
                userName = user.firstName
            } else if (user.lastName) {
                userName = user.lastName
            } else {
                // Try to get from external accounts (Google, GitHub, etc.)
                const externalAccount = user.externalAccounts.find(account =>
                    account.provider === 'oauth_google' ||
                    account.provider === 'oauth_github' ||
                    account.provider === 'oauth_microsoft'
                )

                if (externalAccount) {
                    if (externalAccount.firstName && externalAccount.lastName) {
                        userName = `${externalAccount.firstName} ${externalAccount.lastName}`
                    } else if (externalAccount.firstName) {
                        userName = externalAccount.firstName
                    } else if (externalAccount.lastName) {
                        userName = externalAccount.lastName
                    }
                }
            }

            if (userName !== dbUser.name) {
                await prisma.user.update({
                    where: { id: dbUser.id },
                    data: {
                        name: userName,
                        email: user.emailAddresses[0]?.emailAddress || dbUser.email,
                    }
                })
                dbUser.name = userName
            }
        }
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
    const todoTasks = allTasks.filter((task: any) => task.status === 'todo').length
    const inProgressTasks = allTasks.filter((task: any) => task.status === 'in-progress').length

    return {
        totalTeams,
        totalProjects,
        totalTasks,
        completedTasks,
        todoTasks,
        inProgressTasks
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
        include: {
            assignedTo: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return tasks
}

export async function createTask(
    projectId: string,
    title: string,
    description?: string,
    assignedToClerkId?: string,
    status: 'todo' | 'in-progress' | 'done' = 'todo',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    dueDate?: string,
    startDate?: string,
    estimatedHours?: number,
    tags?: string[],
    notes?: string
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
            priority: priority || 'medium',
            assignedToId: assignedToUserId,
            createdById: currentUser.id,
            dueDate: dueDate ? new Date(dueDate) : null,
            startDate: startDate ? new Date(startDate) : null,
            estimatedHours: estimatedHours || null,
            tags: tags || [],
            notes: notes || null
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

export async function updateUserWithClerkData() {
    const user = await currentUser()
    if (!user) {
        redirect('/sign-in')
    }

    await ensureUserExists()
    return { success: true }
}

export async function getUserDashboardData(clerkId: string) {
    // Get user from clerk ID
    const user = await prisma.user.findUnique({
        where: { clerkId }
    })

    if (!user) {
        throw new Error('User not found')
    }

    // Get all user teams with projects and tasks
    const teamsWithProjects = await prisma.teamMember.findMany({
        where: { userId: user.id },
        include: {
            team: {
                include: {
                    projects: {
                        include: {
                            tasks: {
                                include: {
                                    assignedTo: true
                                }
                            },
                            team: true
                        }
                    },
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    })

    // Flatten all tasks from all projects
    const allTasks: any[] = []
    const allProjects: any[] = []
    const teamMembers: any[] = []
    const availableTags = new Set<string>()

    teamsWithProjects.forEach(teamMember => {
        // Add team members
        teamMember.team.members.forEach(member => {
            if (!teamMembers.some(tm => tm.id === member.id)) {
                teamMembers.push(member)
            }
        })

        // Add projects and tasks
        teamMember.team.projects.forEach(project => {
            allProjects.push({
                ...project,
                tasks: project.tasks.map(task => ({
                    ...task,
                    assignedTo: task.assignedTo ? {
                        name: task.assignedTo.name,
                        email: task.assignedTo.email
                    } : null
                }))
            })

            project.tasks.forEach(task => {
                allTasks.push({
                    ...task,
                    assignedTo: task.assignedTo ? {
                        name: task.assignedTo.name,
                        email: task.assignedTo.email
                    } : null,
                    project: {
                        name: project.name,
                        team: {
                            name: teamMember.team.name
                        }
                    }
                })

                // Collect tags
                if (task.tags && Array.isArray(task.tags)) {
                    task.tags.forEach(tag => availableTags.add(tag))
                }
            })
        })
    })

    return {
        allTasks,
        allProjects,
        teamMembers,
        availableTags: Array.from(availableTags)
    }
} 