/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration Turbopack moderne
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Optimisations des packages
  experimental: {
    optimizePackageImports: ['thirdweb', '@thirdweb-dev/react'],
  },
  
  webpack: (config, { isServer, dev }) => {
    // Configuration pour thirdweb
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      buffer: false,
      util: false,
      events: false,
      querystring: false,
    };

    // Configuration spécifique pour thirdweb
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: false,
      };
    }

    // Ajouter des alias pour thirdweb
    config.resolve.alias = {
      ...config.resolve.alias,
      'process': 'process/browser',
    };

    // Optimisations pour le développement
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

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
  
  // Configuration pour le développement
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
