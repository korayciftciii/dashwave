'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

function LoadingIndicator({ isLoading }: { isLoading: boolean }) {
    if (!isLoading) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-50">
            <div className="h-full bg-blue-600 animate-pulse"></div>
        </div>
    );
}

export default function ClientLoadingIndicator() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Sayfa geçişlerini izle
    useEffect(() => {
        // Yükleme başladı
        setIsLoading(true);

        // Yükleme tamamlandı
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    return <LoadingIndicator isLoading={isLoading} />;
} 