import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Update team member role and permissions
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; memberId: string } }
) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current user from database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const teamId = params.id
        const memberId = params.memberId

        // Check if current user can manage this team
        const currentMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: dbUser.id
                }
            }
        })

        if (!currentMember || (!currentMember.canManageTeam && currentMember.role !== 'OWNER')) {
            return NextResponse.json({ error: 'Not authorized to manage team members' }, { status: 403 })
        }

        // Get the member to update
        const memberToUpdate = await prisma.teamMember.findUnique({
            where: { id: memberId },
            include: { user: true }
        })

        if (!memberToUpdate || memberToUpdate.teamId !== teamId) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
        }

        // Prevent non-owners from changing owner role or making someone else owner
        const body = await request.json()
        const { role, customRoleTitle, canManageTeam, canManageProjects, canManageTasks, canViewAll } = body

        if (currentMember.role !== 'OWNER') {
            if (memberToUpdate.role === 'OWNER' || role === 'OWNER') {
                return NextResponse.json({ error: 'Only owners can manage owner roles' }, { status: 403 })
            }
        }

        // Update the team member
        const updatedMember = await prisma.teamMember.update({
            where: { id: memberId },
            data: {
                role,
                customRoleTitle,
                canManageTeam: role === 'OWNER' ? true : canManageTeam,
                canManageProjects: role === 'OWNER' ? true : canManageProjects,
                canManageTasks: role === 'OWNER' ? true : canManageTasks,
                canViewAll: role === 'OWNER' ? true : canViewAll,
            },
            include: { user: true }
        })

        return NextResponse.json({
            success: true,
            member: {
                id: updatedMember.id,
                role: updatedMember.role,
                customRoleTitle: updatedMember.customRoleTitle,
                canManageTeam: updatedMember.canManageTeam,
                canManageProjects: updatedMember.canManageProjects,
                canManageTasks: updatedMember.canManageTasks,
                canViewAll: updatedMember.canViewAll,
                user: {
                    id: updatedMember.user.id,
                    name: updatedMember.user.name,
                    email: updatedMember.user.email
                }
            }
        })
    } catch (error) {
        console.error('Error updating team member:', error)
        return NextResponse.json(
            { error: 'Failed to update team member' },
            { status: 500 }
        )
    }
}

// Remove team member
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; memberId: string } }
) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current user from database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const teamId = params.id
        const memberId = params.memberId

        // Check if current user can manage this team
        const currentMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: dbUser.id
                }
            }
        })

        if (!currentMember || (!currentMember.canManageTeam && currentMember.role !== 'OWNER')) {
            return NextResponse.json({ error: 'Not authorized to manage team members' }, { status: 403 })
        }

        // Get the member to remove
        const memberToRemove = await prisma.teamMember.findUnique({
            where: { id: memberId },
            include: { user: true }
        })

        if (!memberToRemove || memberToRemove.teamId !== teamId) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
        }

        // Prevent removing the owner or removing yourself
        if (memberToRemove.role === 'OWNER') {
            return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 })
        }

        if (memberToRemove.userId === dbUser.id) {
            return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 400 })
        }

        // Remove the team member
        await prisma.teamMember.delete({
            where: { id: memberId }
        })

        return NextResponse.json({ success: true, message: 'Team member removed successfully' })
    } catch (error) {
        console.error('Error removing team member:', error)
        return NextResponse.json(
            { error: 'Failed to remove team member' },
            { status: 500 }
        )
    }
} 