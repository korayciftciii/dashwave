'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react'

interface TaskSearchFilterProps {
    onFiltersChange: (filters: TaskFilters) => void
    teamMembers?: Array<{
        id: string
        user: {
            id: string
            clerkId: string
            name: string | null
            email: string
        }
    }>
    availableTags?: string[]
    className?: string
}

export interface TaskFilters {
    search: string
    status: string
    assignedTo: string
    tags: string[]
    dueDateFrom: string
    dueDateTo: string
    priority: string
}

const initialFilters: TaskFilters = {
    search: '',
    status: '',
    assignedTo: '',
    tags: [],
    dueDateFrom: '',
    dueDateTo: '',
    priority: ''
}

export default function TaskSearchFilter({
    onFiltersChange,
    teamMembers = [],
    availableTags = [],
    className = ""
}: TaskSearchFilterProps) {
    const [filters, setFilters] = useState<TaskFilters>(initialFilters)
    const [isExpanded, setIsExpanded] = useState(false)
    const [searchDebounce, setSearchDebounce] = useState('')

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchDebounce }))
        }, 300)
        return () => clearTimeout(timer)
    }, [searchDebounce])

    // Notify parent of filter changes
    useEffect(() => {
        onFiltersChange(filters)
    }, [filters, onFiltersChange])

    const handleFilterChange = (key: keyof TaskFilters, value: string | string[]) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const addTag = (tag: string) => {
        if (!filters.tags.includes(tag)) {
            handleFilterChange('tags', [...filters.tags, tag])
        }
    }

    const removeTag = (tag: string) => {
        handleFilterChange('tags', filters.tags.filter(t => t !== tag))
    }

    const clearAllFilters = () => {
        setFilters(initialFilters)
        setSearchDebounce('')
    }

    const hasActiveFilters = Object.values(filters).some(value =>
        Array.isArray(value) ? value.length > 0 : value !== ''
    )

    return (
        <Card className={className}>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search tasks by title..."
                                value={searchDebounce}
                                onChange={(e) => setSearchDebounce(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1">
                                    {Object.values(filters).filter(value =>
                                        Array.isArray(value) ? value.length > 0 : value !== ''
                                    ).length}
                                </Badge>
                            )}
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Expanded Filters */}
                    {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All priorities</SelectItem>
                                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                        <SelectItem value="high">🟠 High</SelectItem>
                                        <SelectItem value="medium">🟡 Medium</SelectItem>
                                        <SelectItem value="low">🟢 Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assignee Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>Assignee</span>
                                </label>
                                <Select value={filters.assignedTo} onValueChange={(value) => handleFilterChange('assignedTo', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All assignees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All assignees</SelectItem>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {teamMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.user.clerkId}>
                                                {member.user.name || member.user.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Due Date Range */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Due Date</span>
                                </label>
                                <div className="space-y-2">
                                    <Input
                                        type="date"
                                        value={filters.dueDateFrom}
                                        onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
                                        placeholder="From"
                                    />
                                    <Input
                                        type="date"
                                        value={filters.dueDateTo}
                                        onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags Filter */}
                    {isExpanded && availableTags.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                            <label className="text-sm font-medium flex items-center space-x-1">
                                <Tag className="h-4 w-4" />
                                <span>Tags</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <Button
                                        key={tag}
                                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                                        className="h-7 text-xs"
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                            {filters.search && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                    <span>Search: {filters.search}</span>
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => {
                                            setSearchDebounce('')
                                            handleFilterChange('search', '')
                                        }}
                                    />
                                </Badge>
                            )}
                            {filters.status && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                    <span>Status: {filters.status}</span>
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('status', '')} />
                                </Badge>
                            )}
                            {filters.priority && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                    <span>Priority: {filters.priority}</span>
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('priority', '')} />
                                </Badge>
                            )}
                            {filters.assignedTo && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                    <span>Assignee: {filters.assignedTo === 'unassigned' ? 'Unassigned' :
                                        teamMembers.find(m => m.user.clerkId === filters.assignedTo)?.user.name || filters.assignedTo}</span>
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('assignedTo', '')} />
                                </Badge>
                            )}
                            {filters.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                                    <span>Tag: {tag}</span>
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                </Badge>
                            ))}
                            {(filters.dueDateFrom || filters.dueDateTo) && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                    <span>
                                        Due: {filters.dueDateFrom || '...'} - {filters.dueDateTo || '...'}
                                    </span>
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => {
                                            handleFilterChange('dueDateFrom', '')
                                            handleFilterChange('dueDateTo', '')
                                        }}
                                    />
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 