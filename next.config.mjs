/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '1337',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '1338',
                pathname: '/**',
            }
        ],
    },
};



export default nextConfig;
