# Tech Stack & Dependencies

Complete breakdown of technologies and packages used in this template.

## Runtime Requirements

- **Node.js:** ^18.20.2 || >=20.9.0
- **pnpm:** ^9 || ^10
- **Package Manager:** pnpm@10.23.0 (strict)

## Core Framework & React

- **Next.js:** 15.4.11 - React framework for production
- **React:** 19.2.3 - UI library
- **React DOM:** 19.2.3 - React rendering for web

## Payload CMS

- **Payload:** 3.78.0 - Headless CMS
- **@payloadcms/next:** 3.78.0 - Payload integration for Next.js
- **@payloadcms/ui:** 3.78.0 - Admin UI components

### Payload Plugins & Features

- **@payloadcms/plugin-form-builder:** 3.78.0 - Create forms in CMS
- **@payloadcms/plugin-nested-docs:** 3.78.0 - Nested document hierarchies
- **@payloadcms/plugin-redirects:** 3.78.0 - Manage URL redirects
- **@payloadcms/plugin-search:** 3.78.0 - Full-text search
- **@payloadcms/plugin-seo:** 3.78.0 - SEO metadata management
- **@payloadcms/richtext-lexical:** 3.78.0 - Rich text editor (Lexical)
- **@payloadcms/admin-bar:** 3.78.0 - Admin preview bar
- **@payloadcms/live-preview-react:** 3.78.0 - Live frontend preview

### Payload Adapters

- **@payloadcms/db-mongodb:** 3.78.0 - MongoDB database adapter
- **@payloadcms/storage-s3:** 3.78.0 - AWS S3 media storage
- **@payloadcms/email-nodemailer:** 3.78.0 - Email via Nodemailer

## Database & Storage

- **@aws-sdk/client-s3:** 3.717.0 - AWS S3 client
- **sharp:** 0.34.5 - Image processing/optimization
- **wrangler:** ^4.67.0 - Cloudflare Workers CLI

## UI & Styling

### Component Libraries

- **@radix-ui/react-checkbox:** ^1.0.4
- **@radix-ui/react-label:** ^2.0.2
- **@radix-ui/react-select:** ^2.0.0
- **@radix-ui/react-slot:** ^1.0.2
- **lucide-react:** ^0.378.0 - Icon library

### CSS & Styling

- **tailwindcss:** ^3.4.3 - Utility-first CSS framework
- **tailwind-merge:** ^2.3.0 - Merge Tailwind classes safely
- **tailwindcss-animate:** ^1.0.7 - Tailwind animation utilities
- **class-variance-authority:** ^0.7.0 - Component variant management
- **autoprefixer:** ^10.4.19 - CSS vendor prefixes
- **postcss:** ^8.4.38 - CSS transformations

### Typography

- **@tailwindcss/typography:** ^0.5.13 - Prose styling plugin
- **prism-react-renderer:** ^2.3.1 - Syntax highlighting

## 3D Graphics

- **three:** ^0.183.1 - 3D graphics library
- **@react-three/fiber:** ^9.5.0 - React renderer for Three.js
- **@react-three/drei:** ^10.7.7 - Helpful Three.js components
- **@react-three/postprocessing:** ^3.0.4 - Post-processing effects

## Forms & State

- **react-hook-form:** 7.45.4 - Lightweight form management
- **clsx:** ^2.1.1 - Conditional className utility

## Content & Data

### Content Syndication

- **rss-parser:** ^3.13.0 - Parse RSS feeds (Substack, Medium, Paragraph sync)

### Analytics & Charts

- **recharts:** ^3.8.1 - Composable chart library
- **graphql:** ^16.8.2 - GraphQL client

### SEO & Sitemaps

- **next-sitemap:** ^4.2.3 - Dynamic sitemap generation

## Deployment & Hosting

### Netlify

- **@netlify/functions:** ^3.0.0 - Netlify Functions support
- **@netlify/plugin-nextjs:** ^5.15.9 - Netlify Next.js plugin

## Development & Build Tools

### Type Safety

- **typescript:** 5.7.3 - TypeScript compiler
- **@types/node:** 22.5.4
- **@types/react:** 19.2.3
- **@types/react-dom:** 19.2.3

### Build & Transpilation

- **tsx:** ^4.21.0 - TypeScript executor
- **cross-env:** ^7.0.3 - Cross-platform environment variables
- **@next/bundle-analyzer:** ^15.5.12 - Analyze Next.js bundles

### Linting & Formatting

- **eslint:** ^9.16.0 - JavaScript linter
- **eslint-config-next:** 15.4.11 - Next.js ESLint config
- **@eslint/eslintrc:** ^3.2.0
- **prettier:** ^3.4.2 - Code formatter

### Testing

- **playwright:** 1.56.1 - Browser automation & E2E testing
- **playwright-core:** 1.56.1
- **@playwright/test:** 1.56.1
- **vitest:** 3.2.3 - Unit test framework
- **@vitejs/plugin-react:** 4.5.2
- **@testing-library/react:** 16.3.0 - Component testing utilities
- **jsdom:** 26.1.0 - DOM simulation
- **@types/jsdom:** ^21.1.7

### Build & Performance

- **vite-tsconfig-paths:** 5.1.4 - Vite config for TypeScript paths
- **copyfiles:** ^2.4.1 - File copy utility
- **baseline-browser-mapping:** ^2.10.0 - Browser compatibility data
- **lighthouse:** ^13.0.3 - Performance auditing

### Environment

- **dotenv:** 16.4.7 - Environment variable loading

## Configuration

### pnpm Overrides

Pinned versions (prevent dependency conflicts):
- `@aws-sdk/client-s3`: 3.717.0
- `@aws-sdk/lib-storage`: 3.717.0
- `@aws-sdk/s3-request-presigner`: 3.717.0
- `react`: 19.2.3
- `react-dom`: 19.2.3

### Supported Architectures

- **OS:** macOS (darwin), Linux
- **CPU:** x64, arm64

### Build Dependencies

Only built from source:
- `sharp`
- `esbuild`
- `unrs-resolver`

## Browser Support

Targets modern browsers (last 2 years):
- Chrome >= 111
- Edge >= 111
- Firefox >= 111
- Safari >= 16.4

## Key Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm seed             # Seed database with sample data

# Content Syncing
pnpm sync:substack    # Import Substack posts
pnpm sync:medium      # Import Medium posts
pnpm sync:paragraph   # Import Paragraph posts

# Testing
pnpm test             # Run all tests
pnpm test:int         # Run integration tests (Vitest)
pnpm test:e2e         # Run E2E tests (Playwright)

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues

# Types & Generation
pnpm generate:types   # Generate Payload TypeScript types
pnpm generate:importmap # Generate import map

# Build Analysis
pnpm analyze          # Analyze bundle size
pnpm lighthouse       # Run Lighthouse audit
```

## Performance Optimizations

- **Sharp:** Server-side image optimization
- **Next.js:** Automatic code splitting and optimization
- **Tailwind CSS:** Purges unused styles
- **Recharts:** Lazy-loaded chart library

## Security

- **dotenv:** Secure environment variable handling
- **Playwright:** Sandboxed browser testing
- **TypeScript:** Type safety for fewer runtime errors

## Deployment Platforms

- **Netlify:** Primary hosting (with Next.js plugin)
- **AWS S3:** Media storage
- **Cloudflare:** Workers support (via Wrangler)

---

## Installation

All dependencies are installed via:

```bash
pnpm install
```

Configuration is defined in `package.json` with pnpm-specific settings for strict reproducibility.
