import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile @react-three packages so Next.js can handle their ESM/CJS correctly
  transpilePackages: [
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
    'three',
  ],
};

export default nextConfig;
