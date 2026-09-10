# Analytics Dashboard Setup

This project now includes:

- A normalized `analytics-snapshots` collection for cross-channel metrics
- Starter dashboard widgets on the Payload admin homepage
- A dedicated `/admin/analytics-dashboard` view for deeper reporting
- A provider-readiness job scaffold so you can validate keys before wiring each API client

## Recommended rollout order

1. Turn on first-party tracking with GA4.
2. Add one channel at a time, starting with LinkedIn and YouTube.
3. Use UTM-tagged links everywhere.
4. Sync daily summary metrics into Payload.
5. Only add native ad/conversion feedback loops after the reporting side is stable.

## Microsoft Clarity

This project loads Microsoft Clarity through the shared frontend analytics component. It is deliberately opt-in and production-only: development renders do not load third-party analytics, and the Clarity loader waits until the page has finished loading before inserting the script.

### Required variables

```env
NEXT_PUBLIC_ENABLE_CLARITY=false
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

Set these in `.env.local` for local production testing and in Netlify → Site configuration → Environment variables for the deploy context that should collect data. Use the literal value `true` to enable Clarity:

```env
NEXT_PUBLIC_ENABLE_CLARITY=true
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id
```

The project ID is intended to be exposed in browser code, so it is not a secret. Do not commit `.env`, `.env.local`, or Netlify secret values.

### Safe test sequence

1. Build with production-style variables: `NEXT_PUBLIC_ENABLE_CLARITY=true NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id pnpm run build:netlify`.
2. Start the production server with `pnpm start` and open the site in a private browser window.
3. In DevTools → Network, reload the page and wait at least two seconds.
4. Confirm a request to `https://www.clarity.ms/tag/<project-id>` and no failed JavaScript request that prevents the page from rendering.
5. In Microsoft Clarity, open the matching project and confirm a recent recording/session. Dashboard data can take a short time to appear.

If the build passes but the request is absent, check the two public environment variables and redeploy after changing them. If the request is present but no session appears, check that the project ID belongs to the intended Clarity project and that browser privacy or content-blocking extensions are not blocking Microsoft domains.

### Netlify deploy checklist

- Add `NEXT_PUBLIC_ENABLE_CLARITY=true` and `NEXT_PUBLIC_CLARITY_PROJECT_ID=<real project ID>` to the intended Netlify deploy context.
- Trigger a new deploy after changing environment variables; public variables are embedded during the build.
- Confirm the deploy logs show a successful `next build`.
- Verify the deployed site’s Network request and the Clarity dashboard session before treating the rollout as complete.
- To disable Clarity without a code change, set `NEXT_PUBLIC_ENABLE_CLARITY=false` and redeploy.

## Environment variables to gather

### Core website attribution

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `GOOGLE_ANALYTICS_PROPERTY_ID`
- `GOOGLE_ANALYTICS_CLIENT_EMAIL`
- `GOOGLE_ANALYTICS_PRIVATE_KEY`

### LinkedIn

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REFRESH_TOKEN`
- `LINKEDIN_ORGANIZATION_ID`

### Instagram / Facebook

- `META_APP_ID`
- `META_APP_SECRET`
- `META_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `FACEBOOK_PAGE_ID`

### X

- `X_CLIENT_ID`
- `X_CLIENT_SECRET`
- `X_BEARER_TOKEN`
- `X_USER_ID`

### YouTube

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`
- `YOUTUBE_CHANNEL_ID`

### Substack

Substack is different:

- Keep using `SUBSTACK_SUBSCRIBE_URL`
- Use UTM-tagged links back to your site
- Treat Substack-native stats as a manual-reference source for now

## What each provider should send into `analytics-snapshots`

### GA4

- `sessions`
- `page_views`
- `newsletter_signup`
- `affiliate_click`
- `contact_submit`
- `tool_click`
- `book_call`
- `resume_download`

Write these with:

- `provider = ga4`
- `platform = linkedin | substack | instagram | facebook | x | youtube | site`
- `metricCategory = traffic` or `conversion`

### LinkedIn / Instagram / Facebook / X / YouTube

Start with daily summary metrics:

- `impressions`
- `clicks`
- `followers`
- `subscribers`
- `video_views`
- `profile_visits`

Write these with:

- `provider = platform name`
- `platform = platform name`
- `metricCategory = engagement` or `audience`

## Practical setup checklist

### 1. GA4

- Confirm `NEXT_PUBLIC_GA_MEASUREMENT_ID` is already firing on the site.
- Create or reuse a GA4 property.
- Create a service account with Analytics Data API access.
- Add `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_ANALYTICS_CLIENT_EMAIL`, and `GOOGLE_ANALYTICS_PRIVATE_KEY`.
- Make sure every social link you publish includes UTMs.

### 2. LinkedIn

- Create a LinkedIn app.
- Request the scopes you need for organization/community reporting.
- Generate a refresh token.
- Copy your organization ID.

### 3. Meta (Instagram / Facebook)

- Create or reuse a Meta app.
- Connect your Instagram professional account and Facebook Page.
- Generate a long-lived access token.
- Copy `INSTAGRAM_BUSINESS_ACCOUNT_ID` and `FACEBOOK_PAGE_ID`.

### 4. X

- Create a developer app.
- Generate a bearer token.
- Save the user ID you want to report on.

### 5. YouTube

- Create OAuth credentials in Google Cloud.
- Generate a refresh token for the channel owner.
- Save the channel ID.

### 6. Substack

- Use UTM-tagged links from newsletter posts and welcome emails.
- Track conversions on your site through GA4 instead of waiting on a richer Substack analytics API.

## Suggested first real sync implementation

If you want the lowest-friction path, implement this next:

1. GA4 daily sync by platform
2. LinkedIn native follower/post metrics
3. YouTube channel/video metrics
4. Meta native account metrics
5. X native organic metrics

That gives you attribution plus native top-of-funnel context without trying to solve every API at once.
