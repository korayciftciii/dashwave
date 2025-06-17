import { NextRequest, NextResponse } from 'next/server'
import { updateTaskStatus } from '@/lib/actions'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { status } = body

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            )
        }

        await updateTaskStatus(params.id, status)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating task:', error)
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        )
    }
}
