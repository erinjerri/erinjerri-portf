# Portfolio Customization and Handoff Checklist

## Start with identity

Update `.env`:

```env
NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
NEXT_PUBLIC_SITE_OWNER_ROLE=Your Role
NEXT_PUBLIC_SITE_TITLE=Your Name — Portfolio
NEXT_PUBLIC_SITE_DESCRIPTION=One clear sentence about your work.
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/in/yourhandle
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourhandle
NEXT_PUBLIC_TWITTER_HANDLE=@yourhandle
```

Restart the development server after changing environment variables.

## Replace starter content in Payload

### Home

Open **Pages → Home** and replace:

- Hero heading and supporting statement
- Hero images
- Calls to action
- Strategy/design/delivery columns
- Selected talks or areas of expertise
- Statistics
- Biography and credential pills

The starter intentionally uses static gradients. It does not load Three.js or an animated canvas
background.

### About

Open **Pages → About** and replace:

- Short and long biography
- Headshot
- Experience and credentials
- Inquiry language

### Projects

Create one project per case study. A useful case study normally includes:

1. Context and problem
2. Your role
3. Constraints
4. Process and decisions
5. Outcome
6. Images, video, or links

### Posts and newsletters

Write directly in Payload or import existing work from Substack, Medium, or Paragraph. Imported
content should use `review` mode until formatting has been checked.

### Speaking

Open **Pages → Speaking** and replace:

- Speaker biography
- Talk titles and descriptions
- Availability
- Request form recipients

Update notification recipients inside **Forms**. Starter email addresses are placeholders and must
not be used in production.

## Navigation, footer, and social links

Open:

- **Globals → Header** to change navigation
- **Globals → Footer** to change link groups, social links, copyright, and subscription visibility

If you do not use Substack, disable the subscribe section in Footer.

## Brand system

Open **Globals → Brand** to change:

- Title and body font stacks
- Background, foreground, primary, secondary, and accent colors
- Border and status colors
- Border radius

The design also contains utility classes in `src/app/(frontend)/globals.css`. Change those only
after configuring the Brand global.

## Images

Upload personal media through Payload instead of committing it to `public/media`.

Recommended starting assets:

- Headshot: portrait, at least 1200 × 1500
- Project hero: 1600 × 900
- Project gallery: at least 1400 px wide
- Social sharing image: 1200 × 630
- Logo: SVG or transparent WebP

Cloudflare R2 is recommended for production uploads. See [Media and R2](MEDIA_AND_R2.md).

## Optional features

Remove or hide anything the portfolio owner does not need:

- Watch/video collection
- Poetry collection and routes
- Speaking forms and blocks
- Affiliate products
- Medium and Paragraph import jobs
- Analytics dashboard

When removing a Payload collection or block:

```bash
pnpm generate:types
pnpm generate:importmap
pnpm exec tsc --noEmit
```

## Before launch

- [ ] Replace every instance of “Your Name”
- [ ] Replace generic biography paragraphs and statistics
- [ ] Replace starter images
- [ ] Update form notification recipients
- [ ] Configure the real domain
- [ ] Configure Substack or disable subscription UI
- [ ] Add production MongoDB
- [ ] Add persistent media storage
- [ ] Confirm SEO titles and descriptions
- [ ] Confirm social sharing image
- [ ] Test contact and speaking forms
- [ ] Test mobile navigation
- [ ] Review accessibility text and image alt text
- [ ] Run `pnpm build`
- [ ] Run the relevant tests
