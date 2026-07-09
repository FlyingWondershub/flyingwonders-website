import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schema} from './sanity/schemaTypes'

export default defineConfig({
  basePath: '/studio',
  projectId: '8xtd7yiv',
  dataset: 'production',
  title: 'Flying Wonders',
  schema,
  plugins: [
    structureTool(),
  ],
})
