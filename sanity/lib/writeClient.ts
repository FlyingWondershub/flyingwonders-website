import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export function getSanityWriteClient() {
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN

  if (!token) {
    console.warn('SANITY_WRITE_TOKEN / SANITY_API_TOKEN is missing. Write operations will fail.')
    return null
  }

  return createClient({
    apiVersion,
    dataset,
    projectId,
    token,
    useCdn: false,
  })
}
