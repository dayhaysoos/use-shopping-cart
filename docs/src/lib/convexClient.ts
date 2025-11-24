import { ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL

if (!convexUrl) {
  throw new Error(
    'Missing VITE_CONVEX_URL. Add it to your docs/.env (see docs/.env.example).'
  )
}

export const convexClient = new ConvexReactClient(convexUrl)
