import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Check database connectivity
        await prisma.$queryRaw`SELECT 1`

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: 'connected',
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        })
    } catch (error) {
        console.error('Health check failed:', error)

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
            environment: process.env.NODE_ENV || 'development'
        }, { status: 503 })
    }
}