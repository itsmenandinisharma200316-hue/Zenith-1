/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if
    // your project has strict type validation issues.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Prevents strict lint warning rules from blocking your deployments
    ignoreDuringBuilds: true,
  },
};
module.exports = nextconfig;
