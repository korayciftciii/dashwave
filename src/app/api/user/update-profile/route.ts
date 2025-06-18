import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Debug: Log Clerk user data
        console.log('Clerk User Data:', {
            id: user.id,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddresses: user.emailAddresses.map(e => e.emailAddress),
            externalAccounts: user.externalAccounts.map(a => ({
                provider: a.provider,
                emailAddress: a.emailAddress,
                firstName: a.firstName,
                lastName: a.lastName
            }))
        })

        // Try to get name from different sources
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
            // Try to get from external accounts (Google)
            const googleAccount = user.externalAccounts.find(account => account.provider === 'oauth_google')
            if (googleAccount) {
                if (googleAccount.firstName && googleAccount.lastName) {
                    userName = `${googleAccount.firstName} ${googleAccount.lastName}`
                } else if (googleAccount.firstName) {
                    userName = googleAccount.firstName
                } else if (googleAccount.lastName) {
                    userName = googleAccount.lastName
                }
            }
        }

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
                name: userName,
                email: user.emailAddresses[0]?.emailAddress || dbUser.email,
            }
        })

        return NextResponse.json({
            success: true,
            user: updatedUser,
            clerkData: {
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                hasGoogleAccount: !!user.externalAccounts.find(a => a.provider === 'oauth_google')
            }
        })
    } catch (error) {
        console.error('Error updating user profile:', error)
        return NextResponse.json(
            { error: 'Failed to update user profile' },
            { status: 500 }
        )
    }
} 