import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
    try {
        // Check authentication
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse request body
        const { title, description } = await request.json()

        if (!title || typeof title !== 'string') {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        // Get API key from environment variables
        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
        }

        // Prepare messages based on whether we're generating or refining
        const messages = [
            {
                role: "system",
                content:
                    "You are an assistant that writes helpful task descriptions in plain English. Do not use markdown symbols like #, *, -, or **. Always return clean plain text.",
            },
            {
                role: "user",
                content:
                    description?.length > 10
                        ? `Can you improve the following task description?\n\nTitle: ${title}\nDescription: ${description}`
                        : `Write a helpful plain-text description for a task titled: "${title}"`,
            },
        ]

        // Make request to OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'Dashwave Task Description Generator'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-0528:free',
                messages,
                temperature: 0.7,
                max_tokens: 300
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('OpenRouter API error:', errorData)
            return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
        }

        const data = await response.json()
        const generatedDescription = data.choices[0]?.message?.content?.trim() || ''

        // Clean any remaining markdown that might have slipped through
        const cleanDescription = generatedDescription
            .replace(/^#+\s+/gm, '') // Remove headers
            .replace(/\*\*/g, '')    // Remove bold
            .replace(/\*/g, '')      // Remove italics
            .replace(/^-\s+/gm, '')  // Remove list items

        return NextResponse.json({ description: cleanDescription })
    } catch (error) {
        console.error('Error generating description:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 