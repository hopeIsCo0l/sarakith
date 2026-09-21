// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   compress: true,
//   poweredByHeader: false,
//   experimental: {
//     optimizePackageImports: ['lucide-react'],
//   },
//   images: {
//     formats: ['image/avif', 'image/webp'],
//     deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
//     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
//     minimumCacheTTL: 31536000,
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//       },
//       {
//         protocol: 'https',
//         hostname: '*.supabase.co',
//       },
//     ],
//   },
//   async headers() {
//     return [
//       {
//         source: '/:path*\\.(otf|woff|woff2|png|jpg|jpeg|webp|avif|svg)',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=31536000, immutable',
//           },
//         ],
//       },
//     ];
//   },
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  /* keep any existing configuration options here */

  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://www.google.com',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;


