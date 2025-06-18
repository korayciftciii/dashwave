'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'

export interface TaskFilters {
    search: string
    status: string
    assignedTo: string
    tags: string[]
    dueDateFrom: string
    dueDateTo: string
    priority: string
}

interface TaskSearchFilterProps {
    onFiltersChange: (filters: TaskFilters) => void
    teamMembers?: any[]
    availableTags?: string[]
    className?: string
}

export default function TaskSearchFilter({
    onFiltersChange,
    teamMembers = [],
    availableTags = [],
    className = ""
}: TaskSearchFilterProps) {
    const [search, setSearch] = useState('')

    const handleSearchChange = (value: string) => {
        setSearch(value)
        onFiltersChange({
            search: value,
            status: '',
            assignedTo: '',
            tags: [],
            dueDateFrom: '',
            dueDateTo: '',
            priority: ''
        })
    }

    return (
        <Card className={className}>
            <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
} 