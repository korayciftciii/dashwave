'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface InviteMemberDialogProps {
    children: React.ReactNode
    teamId: string
    teamName: string
    inviterName: string
}

export default function InviteMemberDialog({
    children,
    teamId,
    teamName,
    inviterName
}: InviteMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string

        if (!email.trim()) {
            toast.error("Please enter an email address")
            setLoading(false)
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address")
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/teams/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamId,
                    email,
                    inviterName,
                    teamName,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send invitation')
            }

            if (result.success) {
                toast.success(`Invitation sent to ${email}`)
                setOpen(false)
            } else {
                toast.error(result.error || "Failed to send invitation")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span>Invite Team Member</span>
                    </DialogTitle>
                    <DialogDescription>
                        Send an invitation email to add a new member to "{teamName}".
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="colleague@company.com"
                            disabled={loading}
                            required
                        />
                        <p className="text-sm text-gray-500">
                            They'll receive an email invitation to join your team.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Email invitation will be sent</li>
                            <li>• If they don't have an account, they'll sign up first</li>
                            <li>• They'll automatically join your team after signing up</li>
                        </ul>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Sending...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4" />
                                    <span>Send Invitation</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 