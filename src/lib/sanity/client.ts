import { createClient, type SanityClient } from 'next-sanity'

let _client: SanityClient | null = null

export function getSanityClient(): SanityClient {
  if (!_client) {
    const isProd = process.env.NODE_ENV === 'production'
    _client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
      useCdn: isProd,
      // Only use token in dev (draft preview). In production all content is
      // public and a token — even a placeholder — forces the client off the
      // CDN and onto the authenticated API, which breaks with a fake token.
      token: isProd ? undefined : process.env.SANITY_API_TOKEN,
    })
  }
  return _client
}
