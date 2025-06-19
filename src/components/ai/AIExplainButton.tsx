'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AIExplainButtonProps {
    title: string
    description?: string
    onDescriptionGenerated: (description: string) => void
    disabled?: boolean
    mode?: 'generate' | 'improve'
}

export function AIExplainButton({
    title,
    description = '',
    onDescriptionGenerated,
    disabled = false,
    mode = 'generate'
}: AIExplainButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateDescription = async () => {
        if (!title.trim()) {
            toast.error('Please enter a task title first')
            return
        }

        try {
            setIsGenerating(true)

            const response = await fetch('/api/ai-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate description')
            }

            const data = await response.json()
            onDescriptionGenerated(data.description)

            if (mode === 'generate') {
                toast.success('Description generated successfully')
            } else {
                toast.success('Description improved successfully')
            }
        } catch (error) {
            console.error('Error generating description:', error)
            toast.error(`Failed to ${mode === 'generate' ? 'generate' : 'improve'} description. Please try again.`)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateDescription}
            disabled={isGenerating || disabled || !title.trim()}
            className="gap-2"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{mode === 'generate' ? 'Generating...' : 'Improving...'}</span>
                </>
            ) : (
                <>
                    <Sparkles className="h-4 w-4" />
                    <span>{mode === 'generate' ? 'Generate with AI' : 'Improve with AI'}</span>
                </>
            )}
        </Button>
    )
} 