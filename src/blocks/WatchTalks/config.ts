import type { Block } from 'payload'

export const WatchTalks: Block = {
  slug: 'watchTalks',
  interfaceName: 'WatchTalks',
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Section title (e.g., "Watch My Talks")',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Optional description above the video player.',
      },
    },
    {
      name: 'talks',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Talk title or event name',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: {
            description: 'Event details, year, or conference name',
          },
        },
        {
          name: 'videoSource',
          type: 'select',
          required: true,
          defaultValue: 'upload',
          options: [
            {
              label: 'Local Video Upload',
              value: 'upload',
            },
            {
              label: 'YouTube URL',
              value: 'youtube',
            },
            {
              label: 'Direct Video URL',
              value: 'url',
            },
          ],
          admin: {
            description: 'Choose the video source type.',
          },
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mediaType: {
              equals: 'video',
            },
          },
          admin: {
            condition: (_, siblingData) => siblingData?.videoSource === 'upload',
            description: 'Select a video from the media library.',
          },
          validate: (value: unknown, { siblingData }: { siblingData?: any }) => {
            if (siblingData?.videoSource !== 'upload') return true
            return Boolean(value) || 'Please select a video.'
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            condition: (_, siblingData) =>
              siblingData?.videoSource === 'youtube' || siblingData?.videoSource === 'url',
            description: 'Paste a YouTube or direct video URL.',
          },
          validate: (value: unknown, { siblingData }: { siblingData?: any }) => {
            if (siblingData?.videoSource === 'upload' || !siblingData?.videoSource) return true
            if (!value || typeof value !== 'string') return 'Please enter a video URL.'

            try {
              new URL(value)
              return true
            } catch {
              return 'Please enter a valid URL.'
            }
          },
        },
        {
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mediaType: {
              equals: 'image',
            },
          },
          admin: {
            description: 'Optional thumbnail for this talk.',
          },
        },
      ],
      minRows: 1,
      admin: {
        description: 'Add talks/videos that users can watch and toggle between.',
      },
    },
    {
      name: 'videoHeight',
      type: 'select',
      defaultValue: 'medium',
      options: [
        {
          label: 'Small (40vh)',
          value: 'small',
        },
        {
          label: 'Medium (60vh)',
          value: 'medium',
        },
        {
          label: 'Large (80vh)',
          value: 'large',
        },
      ],
      admin: {
        description: 'Choose the height of the video player.',
      },
    },
    {
      name: 'showThumbnails',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show thumbnail images in the talk selector.',
      },
    },
    {
      name: 'allowYouTubeEmbed',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Allow embedding of YouTube videos inline.',
      },
    },
  ],
}
