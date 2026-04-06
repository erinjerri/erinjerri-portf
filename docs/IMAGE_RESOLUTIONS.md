# Image Resolution Guidelines

Recommended minimum dimensions for sharp display on standard and retina screens.

## Quick Reference

| Use Case | Min Width | Aspect | Notes |
|----------|-----------|--------|-------|
| **Hero / full-width** | 1920px | 16:9 or 3:2 | Creating AR VR book page, home hero |
| **Card thumbnail (grid)** | 1280px | 4:3 or 16:10 | Archive cards, affiliate products |
| **Event/speaking** | 1200px | 4:3 | Berkeley, Harvard WeCode, etc. |
| **Book cover (overlay)** | 1200px | 3:4 | O'Reilly/Amazon overlay blocks |
| **Icon / small** | 256px | 1:1 | Icons in content columns |

## High-Res Source Files

For best results with images like `CreatingXR-Cal-VR-at-Berkeley` and `erin-jazmin-harvard-wecode`:

- **Upload at native resolution** — no need to downscale before upload
- Next.js Image handles optimization and will serve appropriate sizes
- Quality is now 85 for content images (was 60), 80 for hero images (was 75)
- `sizes` attributes ensure retina displays get 2x resolution

## Custom Overrides

Pass `quality` or `size` to the Media component when needed:

```tsx
<Media
  resource={image}
  quality={90}
  size="(max-width: 640px) 100vw, 1920px"
/>
```
