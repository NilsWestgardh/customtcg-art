/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'i.redd.it'
      },
      {
        hostname: 'oaidalleapiprodscus.blob.core.windows.net'
      },
    ]
  },
};

module.exports = nextConfig;
