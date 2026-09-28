/**
 * Button treatments shared across blocks.
 *
 * These were duplicated in HeroSplit and diverged everywhere else — the book
 * cover row used shadcn's neutral `outline` variant, so its buttons rendered
 * grey next to cobalt buttons in the hero. One definition, imported by both.
 *
 * `primary` is cobalt and `accent` is the light blue, both from the theme
 * tokens, so they stay in step with the logo and the Brand global in Payload.
 */
export const SOLID_BTN = 'border-primary bg-primary text-primary-foreground hover:opacity-90'

export const OUTLINE_BTN = 'border-accent text-accent hover:bg-accent/10'
