import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  webpackDevMiddleware: (config: any) => {
    config.watchOptions = {
      //小さな値にすると、ポーリングの頻度が上がるので、重くなるっぽい。
      //poll: 800,
      poll: 5000,
      aggregateTimeout: 300,
      ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
    }
    return config
  },
  serverExternalPackages: ['@libsql/isomorphic-ws'],
}

export default nextConfig

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
