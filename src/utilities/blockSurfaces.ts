import type { BlockBackground } from '@/fields/blockBackground'

export type ResolvedSurface = 'default' | 'raised' | 'light'

export const BLOCK_SURFACE_CLASS: Record<ResolvedSurface, string> = {
  default: '',
  raised: 'block-surface-raised',
  light: 'block-surface-light',
}

/**
 * Turns each block's `background` setting into the surface it should render on.
 *
 * An `auto` block resolves to the opposite of whatever the previous section
 * resolved to, so neighbouring sections never share a surface. Explicit values
 * always win, and the alternation picks back up from the explicit choice rather
 * than from a fixed odd/even index, which keeps the rhythm intact when an editor
 * pins one section to `light`.
 *
 * Blocks saved before this field existed have no value and are treated as auto.
 */
export function resolveBlockSurfaces(
  values: readonly (BlockBackground | string | null | undefined)[],
): ResolvedSurface[] {
  const resolved: ResolvedSurface[] = []
  let previous: ResolvedSurface = 'default'

  values.forEach((value, index) => {
    let surface: ResolvedSurface

    if (value === 'default' || value === 'raised' || value === 'light') {
      surface = value
    } else if (index === 0) {
      // The first section sits directly under the hero; keep it flat so the
      // hero and the section below it read as one composition.
      surface = 'default'
    } else {
      surface = previous === 'default' ? 'raised' : 'default'
    }

    resolved.push(surface)
    previous = surface
  })

  return resolved
}
