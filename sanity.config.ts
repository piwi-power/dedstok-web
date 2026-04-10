import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from './sanity/schemas'

export default defineConfig({
  name: 'dedstok',
  title: 'DEDSTOK CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '6aatrh9k',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemas,
  },
})
