'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
    const [isOpen, setIsOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    // Initialize from localStorage on mount
    useEffect(() => {
        // Check if we're on mobile
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)

            // On mobile, sidebar should be closed by default
            if (mobile) {
                setIsOpen(false)
            } else {
                // On desktop, load from localStorage or default to open
                const savedState = localStorage.getItem('sidebarOpen')
                setIsOpen(savedState !== null ? savedState === 'true' : true)
            }
        }

        // Check initially
        checkMobile()

        // Add resize listener
        window.addEventListener('resize', checkMobile)

        return () => {
            window.removeEventListener('resize', checkMobile)
        }
    }, [])

    // Save to localStorage when state changes
    useEffect(() => {
        if (!isMobile) {
            localStorage.setItem('sidebarOpen', String(isOpen))
        }
    }, [isOpen, isMobile])

    const toggle = () => setIsOpen(prev => !prev)

    return { isOpen, toggle, isMobile }
}
