/**
 * Hero / bio RichText: thinner body (font-light) while keeping hierarchy readable.
 * Headings drop from default prose bold to medium; strong/links stay slightly heavier.
 */
export const heroBioRichTextClassName =
  '[&_.prose]:font-light [&_.prose_h1]:!font-medium [&_.hero-rich-demoted-h1]:!font-medium [&_.prose_h2]:!font-medium [&_.prose_h3]:!font-normal [&_.prose_strong]:!font-semibold [&_.prose_a]:font-medium'
