# Available Blocks

This template includes several content blocks for building flexible page layouts in Payload CMS.

## Video Blocks

### Large Video Embed
**Slug:** `largeVideoEmbed`

Full-width immersive video hero section inspired by Kate Spade and Michael Kors designs.

**Features:**
- Multiple video sources: YouTube, Vimeo, direct URLs (.mp4/.webm), or local uploads
- Optional text overlay with configurable opacity (0-100)
- Adjustable height variants: 60vh, 70vh, 80vh
- Autoplay, loop, and mute controls
- Optional poster/thumbnail image

**Best for:** Hero sections, video backgrounds, promotional videos

---

### Watch Talks
**Slug:** `watchTalks`

Interactive video player with selectable talk/video list for browsing speaking engagements.

**Features:**
- Video player (left) + scrollable talk selector (right)
- Support for local uploads and YouTube embeds
- Click to toggle between different videos
- Title and event/year metadata for each talk
- Optional thumbnail previews
- Configurable player height (small/medium/large)
- SEO-optimized structure

**Best for:** Speaking engagement showcases, talk/presentation libraries

---

## E-Commerce Blocks

### Amazon Store
**Slug:** `amazonStore`

Modern ecommerce store layout for displaying affiliate products.

**Features:**
- Featured products section (carousel or grid)
- Full product grid with responsive columns (2/3/4 on desktop)
- Multiple card styles: minimal, full info, compact
- Automatic Amazon affiliate tag injection
- Optional category/brand tags
- Smooth hover effects
- Affiliate disclosure for compliance
- Reuses existing AffiliateProducts collection

**Best for:** Product showcases, Amazon affiliate stores, recommendations

---

## Media Blocks

### Media Block
Standard media display with multiple layout options.

**Features:**
- Image, video, or audio support
- Display styles: default, full-width transition, hero overlay
- Optional overlay text and links
- Configurable opacity
- Caption support

---

## Content Blocks

### Content
Rich text content with Lexical editor.

---

### Call to Action
Prominent action section with links and messaging.

---

### Document Block
Embed documents or files.

---

## Layout & Navigation

### Top Line Header
Header section with background and branding.

---

### Tag Pills
Display tags or pills for categorization.

---

### Stat Strip
Display statistics or metrics.

---

## Gallery & Showcase

### Book Cover Row
Display book covers in a grid.

---

### Product Showcase
Feature products or items.

---

### Brand Logos
Display brand logos.

---

## Advanced Blocks

### Archive
Display archive of posts/content.

---

### Form Block
Embedded forms for user input.

---

### Video Background Transition
Video with transition effects.

---

## Adding Blocks to Pages

1. Go to **Pages** collection in Payload admin
2. Open a page (or create new)
3. Go to **Content** tab
4. Click **Add Block**
5. Choose a block from the dropdown
6. Configure the block fields
7. Save and publish

---

## Block Surfaces

Blocks can have optional background/surface styling via the admin UI. Each block supports:
- Background color/opacity
- Border and shadow effects
- Padding and spacing

---

## Custom Block Development

To add a new block:

1. Create folder: `src/blocks/YourBlock/`
2. Add `config.ts` (Payload block configuration)
3. Add `Component.tsx` (React component)
4. Import in `src/collections/Pages/index.ts`
5. Add to `src/blocks/RenderBlocks.tsx`
6. Run `npm run generate:types`

See existing blocks for examples.
