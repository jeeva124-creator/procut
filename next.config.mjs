// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Next.js from trying to bundle Remotion packages at build time
      config.externals = [
        ...(config.externals || []),
        ({ request }, callback) => {
          if (
            request?.startsWith("@remotion/") ||
            request === "remotion"
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
  // Optional: allow serving videos from /public/renders
  output: "standalone",
};

export default nextConfig;
