/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Configuration pour thirdweb
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimisation des chunks pour thirdweb
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        thirdweb: {
          test: /[\\/]node_modules[\\/]thirdweb[\\/]/,
          name: 'thirdweb',
          chunks: 'all',
          priority: 10,
        },
      },
    };

    return config;
  },
  // Configuration pour les images externes
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
