# Cloudflare R2 Setup Guide

This guide covers setting up Cloudflare R2 (object storage) for Payload CMS media management. It uses the erinjerri-portf configuration as reference.

## Prerequisites

- Cloudflare account (free or paid)
- Payload CMS 3.0+
- Node.js environment with access to environment variables

## Step 1: Create an R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Storage & Databases** → **R2**
3. Click **Create bucket**
4. Enter a bucket name: `erinjerri-portf-media` (or similar)
5. Leave location as default (Western North America recommended for US-based sites)
6. Click **Create bucket**

## Step 2: Create Cloudflare API Token

You need a token with specific R2 permissions. Cloudflare uses granular permissions to restrict access.

### For Production (Recommended: Read + Write Token)

1. In Cloudflare Dashboard, go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Set up as follows:
   - **Token Name**: `erinjerri-portf-R2` (or `{project}-R2`)
   - **Permission Policies**: Custom
   - **Expand** these permission groups:
     - **Workers R2 Storage** → Enable `Read` and `Write`
     - (Optional) **Workers R2 SQL** → Enable `Read` if using R2 SQL features
   - **Account Resources**: Select your account
   - **IP Address Filtering**: (Optional) Set to allow only your deployment server's IP
   - **Token Expiration**: Set to `No expiration` or your preferred renewal period

4. Click **Review Token** and verify permissions
5. Click **Create Token**
6. Copy the token immediately (you won't see it again)

### For CI/CD Deployments (Separate Read-Only Token)

Create an additional token with **Read-Only** access for preview deployments:

1. Create Token with name: `erinjerri-portf-R2-readonly`
2. Set **Workers R2 Storage** → Enable `Read` only
3. This prevents accidental overwrites during preview builds

## Step 3: Get R2 Connection Details

1. In **R2** section, select your bucket
2. Click **Settings** tab
3. Note these values:
   - **Bucket name**: `erinjerri-portf-media`
   - **Zone ID** (Account ID): Found in R2 dashboard URL or here
   - **Endpoint**: `https://{account-id}.r2.cloudflarestorage.com`

You can also find your Account ID in **Account Home** → scroll down to see it

## Step 4: Configure Environment Variables

Add these to your `.env.local` (development) and deployment environment:

```env
# Cloudflare R2 Storage
PAYLOAD_STORAGE_ADAPTER=r2
R2_BUCKET_NAME=erinjerri-portf-media
R2_REGION=auto
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-api-token
R2_SECRET_ACCESS_KEY=your-api-token-secret
```

**Note**: The API token value goes in both `R2_ACCESS_KEY_ID` (if they're the same) or create separate read/write tokens.

## Step 5: Configure Payload CMS

In `payload.config.ts`, add the S3 adapter for R2:

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { s3Adapter } from '@payloadcms/storage-s3'

export default buildConfig({
  // ... other config

  // Use S3 adapter for Cloudflare R2
  plugins: [
    s3Adapter({
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: process.env.R2_REGION || 'auto',
        endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      },
      bucket: process.env.R2_BUCKET_NAME || 'erinjerri-portf-media',
    }),
  ],

  // ... rest of config
})
```

Or, if using collection-specific storage:

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    // ... other upload config
    adapter: s3Adapter({
      // ... adapter config
    }),
  },
}
```

## Step 6: Test the Connection

1. Start dev server: `pnpm dev`
2. Go to admin panel → Media collection
3. Try uploading a test image
4. Check Cloudflare R2 dashboard → your bucket → should see the file

## Serving Media Files

### Option A: Direct R2 URL (Public Access Required)

If your bucket is public, media URLs look like:
```
https://erinjerri-portf-media.{account-id}.r2.cloudflarestorage.com/uploads/image.jpg
```

### Option B: Cloudflare CDN (Recommended)

Set up a custom domain to serve R2 files through Cloudflare's CDN:

1. In R2 bucket **Settings**
2. Under **CORS**, add your domain
3. Create a Cloudflare Worker to proxy R2 requests (optional)

### Option C: Private Bucket with Signed URLs

For private content, Payload generates signed URLs that expire after a set time.

## Troubleshooting

### "AccessDenied" errors
- Verify API token has `Workers R2 Storage` → `Write` permission
- Check token hasn't expired
- Verify bucket name matches exactly

### Files upload but don't appear in media
- Check R2 bucket permissions are set correctly
- Verify Payload is using the correct adapter
- Check CloudFlare account and bucket match

### CORS errors when accessing files
- Enable CORS in R2 bucket settings for your domain
- Or use a Cloudflare Worker to handle CORS

### High costs with R2
- R2 charges per operation; optimize upload patterns
- Delete unused files regularly
- Consider lifecycle policies to archive old files

## Security Best Practices

✅ **Do:**
- Use separate tokens for production and staging
- Set IP restrictions on tokens for production
- Set token expiration dates (e.g., 90 days)
- Use read-only tokens for preview environments
- Keep tokens in environment variables only

❌ **Don't:**
- Commit API tokens to Git
- Share tokens between projects
- Use account-wide tokens for single buckets
- Store tokens in code or config files

## Performance Optimization

1. **Enable R2 Caching**
   - Set cache headers on uploads
   - Use Cloudflare Cache Rules

2. **Image Optimization**
   - Use Cloudflare Image Optimization add-on
   - Configure Sharp for responsive images

3. **Regional Routing**
   - R2 is distributed globally
   - Cloudflare automatically routes to nearest edge

## Example: Complete erinjerri-portf Setup

Here's how the portfolio is configured:

```typescript
// payload.config.ts
const isProduction = process.env.NODE_ENV === 'production'

export default buildConfig({
  // ...
  plugins: [
    s3Adapter({
      config: {
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
      bucket: process.env.R2_BUCKET_NAME || 'erinjerri-portf-media',
      generateUrl: (args) => {
        // Custom URL generation for CDN
        return `${process.env.R2_PUBLIC_URL}/${args.filename}`
      },
    }),
  ],
})
```

## Related Documentation

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Payload S3 Storage Adapter](https://payloadcms.com/docs/storage/overview)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
