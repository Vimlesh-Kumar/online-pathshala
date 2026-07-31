/**
 * plugins/icons.ts
 *
 * Registers the offline Iconify subsets so `<AppIcon>` never hits the Iconify API.
 * The subsets are generated from actual source usage by `npm run icons`.
 */
import { addCollection } from '@iconify/vue/offline'
import * as collections from './icons.data'

export function registerIcons() {
  for (const collection of Object.values(collections)) addCollection(collection)
}
