'use client'

import { useNavigationLoading } from '@/lib/hooks/use-navigation-loading'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingOverlay() {
    const isLoading = useNavigationLoading()

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                >
                    <div className="flex flex-col items-center gap-2">
                        <LoadingSpinner size="lg" />
                        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
} 