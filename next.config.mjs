const isPreviewOrStaging =
  process.env.VERCEL_ENV === "preview" ||
  process.env.RAILWAY_ENVIRONMENT_NAME === "staging" ||
  process.env.NODE_ENV === "staging";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  ...(isPreviewOrStaging && {
    swcMinify: false,
    webpack: (config) => {
      config.optimization.minimize = false;
      return config;
    },
  }),
};

export default nextConfig;
