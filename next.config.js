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
  // Désactivation temporaire de optimizePackageImports pour éviter les erreurs de chunks manquants
  experimental: {
    // optimizePackageImports: ['thirdweb', '@thirdweb-dev/react'],
  },
  
  // Externaliser certains packages côté serveur
  serverExternalPackages: ['@magic-ext/oauth', 'magic-sdk', '@magic-ext/react-native-bare-oauth'],
  
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

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: false,
      };
    }

    // Neutraliser COMPLÈTEMENT Magic SDK et ses extensions
    config.resolve.alias = {
      ...config.resolve.alias,
      process: 'process/browser',
      // Remplacer Magic SDK par des modules vides
      'magic-sdk': false,
      '@magic-ext/oauth': false,
      '@magic-ext/oauth/dist/es/index.mjs': false,
      '@magic-ext/oauth/dist/es/core': false,
      '@magic-ext/oauth/core': false,
      '@magic-ext/react-native-bare-oauth': false,
      '@magic-ext/react-native-expo-oauth': false,
      // Neutraliser tous les wallets Magic dans Thirdweb
      '@thirdweb-dev/wallets/evm/wallets/magic': false,
      '@thirdweb-dev/wallets/evm/connectors/magic': false,
    };

    // Remplacer les imports Magic par des modules vides
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /magic-sdk|@magic-ext/,
      use: 'null-loader'
    });

    // Optimisations pour le développement
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      // Désactiver le cache persistant sur disque (évite les erreurs PackFileCacheStrategy)
      config.cache = { type: 'memory' };
    }

    return config;
  },
  
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
