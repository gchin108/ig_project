/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "social-bucket112.s3.ca-central-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
