import type { CollectionConfig, RowField, Validate, Where } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { slugify } from 'payload/shared'

/**
 * Nested categories share URL segments per branch (`/parent/child`), but the default
 * `slugField` enforces a single `slug` value across the whole collection. That blocks
 * e.g. root `/games` when `/technology/games` already exists, or two same-named leaves
 * under different parents. Uniqueness should match the tree: same slug is allowed when
 * `parent` differs; forbidden among siblings (including roots, where parent is empty).
 */
const validateSlugAmongSiblings: Validate<string | undefined | null> = async (value, { data, id, req }) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return true

  const normalized = slugify(raw)
  if (!normalized) return 'Use a slug with letters or numbers'

  const parent = data?.parent
  const parentId =
    parent === null || parent === undefined
      ? null
      : typeof parent === 'object' && parent !== null && 'id' in parent
        ? String((parent as { id: string }).id)
        : String(parent)

  const andClause: Where[] = [{ slug: { equals: normalized } }]

  if (id) {
    andClause.push({ id: { not_equals: id } })
  }

  if (parentId) {
    andClause.push({ parent: { equals: parentId } })
  } else {
    andClause.push({
      or: [{ parent: { exists: false } }, { parent: { equals: null } }],
    })
  }

  const dupes = await req.payload.find({
    collection: 'categories',
    where: { and: andClause },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (dupes.docs.length > 0) {
    return 'This slug is already used under the same parent. Pick another slug, or clear Parent to create a separate top-level category.'
  }

  return true
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  lockDocuments: false,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && typeof data.slug === 'string' && data.slug.trim()) {
          data.slug = slugify(data.slug)
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
      overrides: (field) =>
        ({
          ...field,
          fields: field.fields.map((sub) =>
            'name' in sub && sub.name === 'slug' && 'type' in sub && sub.type === 'text'
              ? { ...sub, unique: false, validate: validateSlugAmongSiblings }
              : sub,
          ),
        }) as RowField,
    }),
  ],
}
