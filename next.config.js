/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimize for production
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        serverActions: {
            bodySizeLimit: '2mb',
        },
        // Add more experimental features
        scrollRestoration: true,
    },

    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ]
    },

    // Redirect configuration
    async redirects() {
        return [
            {
                source: '/login',
                destination: '/sign-in',
                permanent: true,
            },
            {
                source: '/register',
                destination: '/sign-up',
                permanent: true,
            },
        ]
    },

    // Webpack optimization
    webpack: (config, { dev, isServer }) => {
        // Handle nodemailer on client side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
            }
        }

        // Optimize bundle size in production
        if (!dev && !isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                // Remove unused lodash modules
                'lodash': 'lodash-es',
            }

            // Add more production optimizations
            config.optimization.minimize = true;
            config.optimization.usedExports = true;
        }

        return config
    },

    // Performance optimizations
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Enable SWC minification
    swcMinify: true,

    // Add more performance optimizations
    poweredByHeader: false,
    reactStrictMode: true,
}

module.exports = nextConfig 