'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function useNavigationLoading() {
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Sayfa yüklenirken kısa bir loading göster (gerçekçi olması için)
        setIsLoading(true)

        // Sayfa geçişi tamamlandıktan sonra loading'i kapat
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500) // 500ms sonra loading'i kapat

        return () => clearTimeout(timer)
    }, [pathname, searchParams])

    return isLoading
} 