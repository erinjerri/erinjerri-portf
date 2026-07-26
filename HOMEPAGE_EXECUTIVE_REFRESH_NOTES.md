# Homepage Executive Positioning Refresh Notes

## Audit report

From a conference organizer, executive recruiter, founder, or corporate innovation leader perspective, the homepage already communicates the core domain quickly: AI, spatial computing, founder/operator experience, and O'Reilly credibility. The first 10 seconds make the technical frontier clear, especially through the hero, ribbon, stats, and pill-based bio.

The underemphasized items were not missing authority signals; they were hierarchy issues. Speaking/advisory framing required more scrolling, and book credibility could read too close to commerce when purchase links appeared without enough authority context. The update keeps the visual system intact and brings a lightweight "Selected talks" signal into the existing signature section flow.

## Biography consolidation plan

The pill-based `bioBlock` is the canonical biography. It is already CMS-editable through Payload fields for eyebrow, headline, headshot, paragraphs, paragraph highlights, and pills.

The duplicate lower biography was a separate rich-text `content` block. The renderer now suppresses only homepage `content` blocks that immediately follow `bioBlock` and match Erin biography text signals. This preserves editor functionality in the retained Bio #1 while preventing Bio #2 from appearing as a separate section.

## Typography root cause

Previous typography edits likely targeted `RichText`, `.payload-richtext`, `.prose`, or global theme typography. Those did not visibly affect Bio #1 because the retained pill-based biography does not render through `RichText` or prose classes.

The actual override was local to `src/blocks/BioBlock/Component.tsx`: each biography paragraph used a hard-coded Tailwind class, `text-base leading-8`. That fixed class kept Bio #1 at 16px regardless of changes to rich-text wrappers, Payload Lexical styles, or `.theme-prismatic .payload-richtext.prose`.

The retained biography now uses `text-[1rem]` on mobile and `md:text-[1.0625rem] md:leading-9` on desktop, keeping the existing layout, colors, pills, and visual language while making the body copy visibly more readable.

## Minimal hierarchy improvements

The home signature flow now includes a compact `signatureTalks` block seeded as "Selected talks" using the existing design system. It avoids large cards, screenshots, and a new visual pattern.

The homepage ribbon copy now positions Erin as someone who advises, architects, and builds systems, while preserving founder, operator, and technical credibility.

## Copy recommendations

Keep using "advisor", "architect", "operator", "founder", "author", and "speaker". Avoid "consultant", "freelancer", "services", and "agency" language.

Book sections should lead with O'Reilly, translated editions, international distribution, and influence across AI/XR/spatial computing before purchase links. Purchase CTAs should remain secondary.
