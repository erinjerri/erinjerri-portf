# Substack Integration

The project supports Substack in two independent ways:

1. Newsletter subscription from the footer
2. Importing Substack articles into Payload posts

You may use either feature without enabling the other.

## Publication URL

Find the public URL of the Substack publication:

```text
https://yourpublication.substack.com
```

Its RSS feed is normally:

```text
https://yourpublication.substack.com/feed
```

If a custom domain is configured in Substack, verify the feed by opening `/feed` in a browser.

## Footer subscription

Set:

```env
NEXT_PUBLIC_SUBSTACK_URL=https://yourpublication.substack.com
SUBSTACK_SUBSCRIBE_URL=https://yourpublication.substack.com
```

Restart the development server. In Payload, open **Globals → Footer** and ensure the subscription
section is enabled.

The API route sends the subscriber to the configured Substack publication when direct enrollment
is unavailable. Test the complete flow with an email address you control.

If no Substack URL is configured, the template hides the footer subscription form.

## One-time article import

Set:

```env
SUBSTACK_RSS_URL=https://yourpublication.substack.com/feed
SUBSTACK_SYNC_MODE=review
SUBSTACK_SYNC_DOWNLOAD_IMAGES=true
SUBSTACK_SYNC_MAX_ITEMS=20
```

Run:

```bash
pnpm sync:substack
```

Open **Payload → Posts** and review the imported drafts.

## Import modes

### Review mode

```env
SUBSTACK_SYNC_MODE=review
```

Recommended initially. New items are imported as drafts for formatting, SEO, attribution, and
image review.

### Automatic publishing

```env
SUBSTACK_SYNC_MODE=auto_publish
```

Use only after several successful review-mode imports.

## Map imported posts to an author

Create the author in Payload, then use either:

```env
SUBSTACK_DEFAULT_AUTHOR_EMAIL=you@example.com
```

or:

```env
SUBSTACK_DEFAULT_AUTHOR_ID=payload-document-id
```

Email is easier to move between environments. An ID is specific to one database.

## Images

```env
SUBSTACK_SYNC_DOWNLOAD_IMAGES=true
SUBSTACK_SYNC_MAX_IMAGES_PER_POST=25
```

When enabled, remote images are downloaded into the Payload Media collection. Production imports
therefore need persistent media storage such as Cloudflare R2.

Set this to `false` if images should continue loading from Substack:

```env
SUBSTACK_SYNC_DOWNLOAD_IMAGES=false
```

## Scheduled Netlify sync

Set production variables:

```env
SUBSTACK_SYNC_ENABLED=true
SUBSTACK_RSS_URL=https://yourpublication.substack.com/feed
SUBSTACK_SYNC_MODE=review
CRON_SECRET=a-long-random-secret
```

The included Netlify scheduled function calls:

```text
POST /next/sync-substack
Authorization: Bearer CRON_SECRET
```

The Netlify schedule is defined in `netlify/functions/substack-sync-cron.ts`. Confirm the scheduled
function appears in Netlify after deployment.

For another hosting provider, configure an external scheduler to send the same authenticated POST
request.

## Useful optional settings

```env
SUBSTACK_SYNC_NOTIFY_EMAIL=
SUBSTACK_SYNC_FORCE_UPDATE=false
SUBSTACK_SYNC_ALWAYS_FETCH_FULL_ARTICLE=false
SUBSTACK_SYNC_DISCOVER_FROM_ARCHIVE=false
SUBSTACK_SYNC_INCLUDE_IMAGE_SOURCE_LINKS=false
```

- `SUBSTACK_SYNC_NOTIFY_EMAIL` receives an import summary when SMTP is configured.
- `SUBSTACK_SYNC_FORCE_UPDATE=true` replaces previously imported content.
- Full-article and archive discovery increase request time and are better for manual imports than
  frequent serverless cron runs.

## Troubleshooting

### No posts are imported

Open the RSS URL directly and confirm it returns XML with article items. Check that the publication
is public.

### Imported posts remain invisible

Review-mode items are drafts. Open the post in Payload and publish it.

### Posts have no author

Set `SUBSTACK_DEFAULT_AUTHOR_EMAIL` to the exact email of an existing Payload user.

### Images fail in production

Configure R2 and confirm `USE_R2_STORAGE=true`. Serverless local files are not durable.

### Scheduled sync returns 403

Confirm the scheduler sends:

```text
Authorization: Bearer your-actual-cron-secret
```

and that its value exactly matches `CRON_SECRET` in the deployed environment.

### Duplicate content

The importer tracks source URLs. Do not change the publication domain or force-update settings
without reviewing existing post source fields.
