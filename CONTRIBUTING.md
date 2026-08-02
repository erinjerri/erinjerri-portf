# Contributing Guidelines

This document outlines how to contribute to this Payload portfolio template. Whether you're reporting bugs, suggesting features, or submitting code, please read this first.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others succeed

## Getting Started

### Prerequisites

- Node.js 20.19+ (Node 22.12+ recommended)
- pnpm 10+
- Git
- Docker Desktop (for local MongoDB)
- Code editor (VS Code, JetBrains, etc.)

### Setup

1. **Fork and clone:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/erinjerri-portf-template.git
   cd erinjerri-portf-template
   ```

2. **Install dependencies:**
   ```bash
   corepack enable
   corepack prepare pnpm@10.23.0 --activate
   pnpm install
   ```

3. **Create `.env.local` for development:**
   ```bash
   cp .env.example .env.local
   ```
   Set local secrets:
   ```env
   DATABASE_URL=mongodb://127.0.0.1:27017/payload-portfolio-dev
   PAYLOAD_SECRET=test-secret-not-for-production
   PREVIEW_SECRET=test-secret-not-for-production
   CRON_SECRET=test-secret-not-for-production
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
   ```

4. **Start MongoDB:**
   ```bash
   docker compose up -d mongo
   docker compose logs mongo  # Verify it started
   ```

5. **Run the dev server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and `/admin`

6. **Seed initial content (first time only):**
   ```bash
   # Add to .env.local:
   RESTORE_ADMIN_EMAIL=test@example.com
   RESTORE_ADMIN_PASSWORD=test-password
   
   # Then run:
   pnpm seed
   ```

## Development Workflow

### Branching Strategy

- **main** – Production-ready code
- **feature/{name}** – New features (e.g., `feature/analytics-dashboard`)
- **fix/{name}** – Bug fixes (e.g., `fix/media-upload-timeout`)
- **docs/{name}** – Documentation updates (e.g., `docs/production-setup`)
- **refactor/{name}** – Code refactoring (e.g., `refactor/block-architecture`)

Create a branch:
```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write code** following the standards below
2. **Test locally:**
   ```bash
   pnpm build     # Verify build succeeds
   pnpm lint      # Check code style
   pnpm test:int  # Run integration tests (if applicable)
   pnpm test:e2e  # Run end-to-end tests (if applicable)
   ```
3. **Update docs** if behavior or APIs changed
4. **Commit** with descriptive messages (see below)
5. **Push** to your fork
6. **Create a PR** (see Pull Request Process)

### Git Workflow

```bash
# Keep main up to date
git fetch origin
git rebase origin/main

# Before pushing, ensure no merge conflicts
git rebase origin/main

# Push your branch
git push -u origin feature/your-feature-name
```

## Coding Standards

### TypeScript

- **Always use TypeScript** – No `any` unless unavoidable
- **Import types** from Payload or project types:
  ```typescript
  import type { CollectionConfig, AccessArgs } from 'payload'
  import type { User, Page } from '@/payload-types'
  ```
- **Use strict mode** – `tsconfig.json` has `strict: true`
- **Run type check** before committing:
  ```bash
  pnpm exec tsc --noEmit
  ```

### Payload CMS Patterns

Follow patterns in `AGENTS.md`:

#### Collections

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    // ... more fields
  ],
  access: {
    read: ({ req: { user } }) => Boolean(user),
  },
}
```

#### Security (CRITICAL)

```typescript
// ✅ CORRECT: Use overrideAccess: false when passing user
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false,  // REQUIRED for access control
})

// ✅ CORRECT: Pass req to nested operations in hooks
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req,  // REQUIRED for transaction safety
      })
    },
  ],
}
```

#### Access Control

```typescript
// Collection-level
export const Pages: CollectionConfig = {
  access: {
    create: ({ req }) => Boolean(req.user?.role === 'admin'),
    read: ({ req }) => {
      if (!req.user) return { _status: { equals: 'published' } }
      return true  // Authenticated users see all
    },
  },
}

// Field-level
{
  name: 'salary',
  type: 'number',
  access: {
    read: ({ req, doc }) => {
      // Only admin or self can read
      return req.user?.role === 'admin' || req.user?.id === doc?.id
    },
  },
}
```

### React & Next.js

- **Prefer Server Components** unless you need state/effects
- **Use `next/image`** for responsive images
- **Avoid `defaultProps`** – Use destructuring defaults
- **Type props** with TypeScript interfaces:
  ```typescript
  interface MyComponentProps {
    title: string
    onClick?: () => void
  }
  
  export function MyComponent({ title, onClick }: MyComponentProps) {
    // ...
  }
  ```

### Styling

- **Use Tailwind CSS** – Avoid inline styles
- **Follow existing patterns** in `src/components/` and blocks
- **Use CSS variables** for theme tokens:
  ```css
  .my-component {
    background-color: var(--theme-elevation-500);
    color: var(--theme-text);
  }
  ```

### File Organization

```
src/
├── collections/          # One file per collection
├── globals/              # One file per global
├── blocks/               # One directory per block
│   └── MyBlock/
│       ├── config.ts     # Payload block config
│       ├── Component.tsx # React component
│       └── styles.module.css
├── components/           # Shared components
├── utilities/            # Helper functions
└── ...
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `MyComponent.tsx` |
| **Hooks** | camelCase with `use` prefix | `useMediaQuery.ts` |
| **Utilities** | camelCase | `formatDate.ts` |
| **Types** | PascalCase with `Type` or `Props` suffix | `UserType.ts`, `ButtonProps.ts` |
| **CSS Classes** | kebab-case | `my-component`, `btn-primary` |
| **Variables** | camelCase | `isLoading`, `maxWidth` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_TIMEOUT` |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Format

- **type:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- **scope:** Optional. Area of change: `collections`, `blocks`, `components`, `media`, `auth`, `types`
- **subject:** Imperative mood, lowercase, no period. Max 50 chars.
- **body:** Explain **why**, not what. Max 72 chars per line.
- **footer:** Reference issues: `Closes #123`, `Fixes #456`

### Examples

```bash
# New feature
git commit -m "feat(blocks): add testimonial block with author photos"

# Bug fix
git commit -m "fix(media): handle R2 timeouts on slow connections"

# Documentation
git commit -m "docs(production): update launch order for MongoDB Atlas"

# Refactoring
git commit -m "refactor(collections): extract access control to access/ dir"

# Type generation after schema change
git commit -m "chore: regenerate Payload types and import map"
```

**Always reference issues:**
```bash
git commit -m "fix(auth): resolve JWT expiration bug

Users logged out unexpectedly after 1 hour. Secret rotation was
causing new JWTs to be rejected. Use stable encryption key.

Fixes #789"
```

## Pull Request Process

### Before Submitting

1. **Rebase on main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run checks locally:**
   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm build
   pnpm test:int  # If applicable
   pnpm test:e2e  # If applicable
   ```

3. **Update documentation** if APIs changed

4. **Keep commits clean:**
   - Each commit should compile and pass tests
   - Squash "fixup" commits before pushing:
     ```bash
     git rebase -i origin/main
     ```

### PR Title & Description

**Title:** Should be a single sentence matching the first commit message
```
feat: add analytics dashboard widget
fix: resolve media upload on slow networks
docs: clarify R2 custom domain setup
```

**Description:**

```markdown
## Summary
Brief explanation of what changed and why.

## Motivation
Why is this change needed? What problem does it solve?

## Changes
- Bullet list of changes
- One per significant change
- Include both code and docs

## Testing
- How to test locally
- Edge cases covered
- Expected behavior

## Checklist
- [ ] TypeScript compiles (`pnpm exec tsc --noEmit`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Commits follow Conventional Commits format
- [ ] No hardcoded secrets, API keys, or credentials
```

### Review Process

- At least one approval required
- Address feedback and push updates
- Merge only after all checks pass
- Delete branch after merge

## Testing

### Unit Tests

Vitest configuration in `vitest.config.mts`:

```bash
pnpm test:int
```

Test file pattern: `**/*.int.spec.ts`

### End-to-End Tests

Playwright configuration in `playwright.config.ts`:

```bash
pnpm test:e2e
```

Test file pattern: `**/*.e2e.spec.ts`

**Important:** E2E tests require a running dev server:
```bash
pnpm dev &  # Start in background
pnpm test:e2e
```

### Manual Testing Checklist

Before submitting a PR with UI changes:

- [ ] Renders correctly on mobile (375px)
- [ ] Renders correctly on tablet (768px)
- [ ] Renders correctly on desktop (1440px)
- [ ] Dark mode works (if applicable)
- [ ] Keyboard navigation works
- [ ] Screen readers can access content
- [ ] No console errors or warnings
- [ ] Images load and display correctly
- [ ] Links navigate to correct pages
- [ ] Forms submit without errors

## Documentation

### When to Update Docs

- **New feature:** Add usage example and env var requirements
- **API change:** Update relevant docs and type definitions
- **Bug fix:** If it changes expected behavior, update docs
- **New integration:** Add guide to `docs/`

### Documentation Format

- **Location:** `docs/` for substantial guides, README.md for quick reference
- **Format:** Markdown with clear sections and code examples
- **Code examples:** Include language tags and output
- **Links:** Use relative paths for cross-document links
- **Keep current:** Update docs when code changes

### Docs File Checklist

- [ ] Clear title (H1: `# Title`)
- [ ] Table of contents (if >5 sections)
- [ ] Prerequisites listed
- [ ] Examples are copy-paste ready
- [ ] Images/diagrams have captions
- [ ] Relevant links to related docs
- [ ] TODO notes for missing details (not assumptions)

## Common Tasks

### Adding a New Collection

1. Create `src/collections/MyCollection.ts`
2. Export from `src/payload.config.ts`
3. Run `pnpm generate:types`
4. Commit with `chore: add MyCollection`

### Adding a New Block

1. Create `src/blocks/MyBlock/config.ts`
2. Create `src/blocks/MyBlock/Component.tsx`
3. Add to `src/payload.config.ts` blocks array
4. Export from `src/blocks/RenderBlocks.tsx`
5. Run `pnpm generate:importmap`
6. Test in Pages editor
7. Commit with `feat(blocks): add MyBlock`

### Updating Payload Types

After modifying collections or globals:

```bash
pnpm generate:types      # Generate TypeScript types
pnpm generate:importmap  # Update admin component paths
pnpm exec tsc --noEmit   # Verify types
git add src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "chore: regenerate Payload types"
```

### Modifying Access Control

1. Update access function in `src/collections/` or `src/access/`
2. Test in dev environment:
   ```bash
   # Create test users with different roles
   # Verify they see/can't access expected data
   ```
3. Update `AGENTS.md` if pattern is new
4. Commit with `feat(access): add ...`

### Adding Environment Variables

1. Add to `.env.example` with comment
2. Document in `ARCHITECTURE.md` or relevant `docs/` file
3. If sensitive (secret/token), add to production setup guide
4. Example:
   ```env
   # Description of what this var does
   MY_NEW_VAR=default-value
   ```

## Troubleshooting

### Common Issues

#### Port 3000 is already in use
```bash
# Find and kill process
lsof -ti :3000 | xargs kill -9

# Or use a different port
pnpm dev -- --port 3001
```

#### MongoDB connection refused
```bash
# Check if Docker container is running
docker compose ps

# View logs
docker compose logs mongo

# Restart
docker compose down
docker compose up -d mongo
```

#### TypeScript errors after schema changes
```bash
# Regenerate types
pnpm generate:types
pnpm generate:importmap
pnpm exec tsc --noEmit
```

#### Admin import errors
```bash
# Clear Next.js cache and regenerate import map
pnpm generate:importmap
pnpm exec tsc --noEmit
pnpm build
```

#### Seed fails
```bash
# Check database is empty or use force
RESTORE_FORCE=true pnpm seed

# Or manually clear before seeding
# (via MongoDB UI or mongosh)
```

### Getting Help

- **Documentation:** Check `docs/`, `README.md`, `ARCHITECTURE.md`
- **Similar code:** Search repo for similar patterns
- **Payload docs:** https://payloadcms.com/docs
- **Issues:** Search GitHub issues, create one with reproduction steps
- **Discussions:** Check GitHub Discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (typically MIT).

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

Thank you for contributing! 🎉
