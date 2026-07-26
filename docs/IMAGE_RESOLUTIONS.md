# Image Recommendations

| Use | Recommended size | Ratio | Notes |
| --- | ---: | ---: | --- |
| Homepage hero | 1600 × 900 | 16:9 | WebP or AVIF; keep the focal point away from text |
| Project card | 1200 × 800 | 3:2 | Use a consistent ratio across projects |
| Project detail hero | 1920 × 1080 | 16:9 | Compress before upload |
| Headshot | 1200 × 1500 | 4:5 | Leave safe space around the face |
| Article hero | 1600 × 900 | 16:9 | Avoid embedding important text in the image |
| Publication cover | 1200 × 1600 | 3:4 | PNG or WebP |
| Social sharing image | 1200 × 630 | 1.91:1 | Update `NEXT_PUBLIC_DEFAULT_OG_IMAGE_PATH` |
| Logo | SVG preferred | flexible | Use a transparent background |

Payload generates configured image sizes after upload. Keep original files large enough for the
largest required output, but compress them before uploading. Production media should live in
persistent object storage such as Cloudflare R2.
