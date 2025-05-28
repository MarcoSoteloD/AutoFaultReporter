import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Added for flexibility with potential dynamic image sources during development
      // For production, this should be reviewed and locked down.
      // {
      //   protocol: 'https',
      //   hostname: '**', 
      // },
      // {
      //   protocol: 'http',
      //   hostname: '**',
      // }
    ],
     domains: ['localhost'], // For src="blob:http://localhost..." from URL.createObjectURL
  },
};

export default nextConfig;
