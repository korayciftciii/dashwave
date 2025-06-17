'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Trash2, Crown, Shield, Edit, Users, Eye } from 'lucide-react'

interface TeamMember {
    id: string
    role: string
    customRoleTitle: string | null
    canManageTeam: boolean
    canManageProjects: boolean
    canManageTasks: boolean
    canViewAll: boolean
    user: {
        id: string
        name: string | null
        email: string
    }
}

interface ManageTeamMemberDialogProps {
    member: TeamMember
    teamId: string
    isOwner: boolean
}

const roleOptions = [
    { value: 'OWNER', label: 'Owner', icon: Crown, description: 'Full access, can manage team and transfer ownership' },
    { value: 'MANAGER', label: 'Manager', icon: Shield, description: 'Can manage projects, tasks, and team members' },
    { value: 'WRITER', label: 'Writer', icon: Edit, description: 'Can create and manage projects and tasks' },
    { value: 'MEMBER', label: 'Member', icon: Users, description: 'Can create tasks and participate in projects' },
    { value: 'VIEWER', label: 'Viewer', icon: Eye, description: 'Can view team content but cannot make changes' }
]

export function ManageTeamMemberDialog({ member, teamId, isOwner }: ManageTeamMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(member.role)
    const [customRoleTitle, setCustomRoleTitle] = useState(member.customRoleTitle || '')
    const [permissions, setPermissions] = useState({
        canManageTeam: member.canManageTeam,
        canManageProjects: member.canManageProjects,
        canManageTasks: member.canManageTasks,
        canViewAll: member.canViewAll
    })

    const handleUpdateMember = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/teams/${teamId}/members/${member.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: selectedRole,
                    customRoleTitle: customRoleTitle.trim() || null,
                    ...permissions
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update member')
            }

            alert('Team member updated successfully')
            setOpen(false)
            window.location.reload() // Refresh to show changes
        } catch (error) {
            alert('Failed to update team member')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveMember = async () => {
        if (!confirm(`Are you sure you want to remove ${member.user.name || member.user.email} from the team?`)) {
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/teams/${teamId}/members/${member.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to remove member')
            }

            alert('Team member removed successfully')
            setOpen(false)
            window.location.reload() // Refresh to show changes
        } catch (error) {
            alert('Failed to remove team member')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = (newRole: string) => {
        setSelectedRole(newRole)

        // Set default permissions based on role
        const defaultPermissions = {
            OWNER: { canManageTeam: true, canManageProjects: true, canManageTasks: true, canViewAll: true },
            MANAGER: { canManageTeam: true, canManageProjects: true, canManageTasks: true, canViewAll: true },
            WRITER: { canManageTeam: false, canManageProjects: true, canManageTasks: true, canViewAll: true },
            MEMBER: { canManageTeam: false, canManageProjects: false, canManageTasks: true, canViewAll: true },
            VIEWER: { canManageTeam: false, canManageProjects: false, canManageTasks: false, canViewAll: true }
        }

        setPermissions(defaultPermissions[newRole as keyof typeof defaultPermissions] || permissions)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Team Member</DialogTitle>
                    <DialogDescription>
                        Update role and permissions for {member.user.name || member.user.email}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Member Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium">{member.user.name || member.user.email}</h3>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={selectedRole} onValueChange={handleRoleChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((role) => {
                                    const Icon = role.icon
                                    return (
                                        <SelectItem key={role.value} value={role.value}>
                                            <div className="flex items-center space-x-2">
                                                <Icon className="h-4 w-4" />
                                                <span>{role.label}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-600">
                            {roleOptions.find(r => r.value === selectedRole)?.description}
                        </p>
                    </div>

                    {/* Custom Role Title */}
                    <div className="space-y-2">
                        <Label htmlFor="customRole">Custom Role Title (Optional)</Label>
                        <Input
                            id="customRole"
                            placeholder="e.g., Lead Developer, Designer, etc."
                            value={customRoleTitle}
                            onChange={(e) => setCustomRoleTitle(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                            Display a custom title while keeping the base role permissions
                        </p>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-3">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={permissions.canManageTeam}
                                    onChange={(e) => setPermissions(prev => ({ ...prev, canManageTeam: e.target.checked }))}
                                    disabled={selectedRole === 'OWNER'} // Owner always has this permission
                                />
                                <span className="text-sm">Can manage team members</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={permissions.canManageProjects}
                                    onChange={(e) => setPermissions(prev => ({ ...prev, canManageProjects: e.target.checked }))}
                                    disabled={selectedRole === 'OWNER'} // Owner always has this permission
                                />
                                <span className="text-sm">Can manage projects</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={permissions.canManageTasks}
                                    onChange={(e) => setPermissions(prev => ({ ...prev, canManageTasks: e.target.checked }))}
                                    disabled={selectedRole === 'OWNER'} // Owner always has this permission
                                />
                                <span className="text-sm">Can manage tasks</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={permissions.canViewAll}
                                    onChange={(e) => setPermissions(prev => ({ ...prev, canViewAll: e.target.checked }))}
                                    disabled={selectedRole === 'OWNER'} // Owner always has this permission
                                />
                                <span className="text-sm">Can view all team content</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="destructive"
                            onClick={handleRemoveMember}
                            disabled={loading || member.role === 'OWNER'}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Member
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateMember} disabled={loading}>
                                {loading ? 'Updating...' : 'Update Member'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
