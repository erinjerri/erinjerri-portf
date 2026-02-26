import type { GlobalConfig } from 'payload'

export const Brand: GlobalConfig = {
  slug: 'brand',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'fonts',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue:
            "var(--font-league-spartan), var(--font-jost), 'Satoshi', 'Glacial Indifference', sans-serif",
        },
        {
          name: 'copy',
          type: 'text',
          required: true,
          defaultValue:
            "var(--font-jost), 'Satoshi', 'Glacial Indifference', var(--font-league-spartan), sans-serif",
        },
      ],
    },
    {
      name: 'colors',
      type: 'group',
      fields: [
        {
          name: 'light',
          type: 'group',
          fields: [
            { name: 'background', type: 'text', required: true, defaultValue: '222 35% 5%' },
            { name: 'foreground', type: 'text', required: true, defaultValue: '0 0% 74.9%' },
            { name: 'card', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            {
              name: 'cardForeground',
              type: 'text',
              required: true,
              defaultValue: '0 0% 74.9%',
            },
            { name: 'popover', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            {
              name: 'popoverForeground',
              type: 'text',
              required: true,
              defaultValue: '0 0% 74.9%',
            },
            { name: 'primary', type: 'text', required: true, defaultValue: '203.7 77.2% 48.2%' },
            { name: 'primaryForeground', type: 'text', required: true, defaultValue: '0 0% 96%' },
            { name: 'secondary', type: 'text', required: true, defaultValue: '185.4 100% 60.8%' },
            {
              name: 'secondaryForeground',
              type: 'text',
              required: true,
              defaultValue: '222 35% 5%',
            },
            { name: 'muted', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            { name: 'mutedForeground', type: 'text', required: true, defaultValue: '0 0% 62%' },
            { name: 'accent', type: 'text', required: true, defaultValue: '185.4 100% 60.8%' },
            {
              name: 'accentForeground',
              type: 'text',
              required: true,
              defaultValue: '222 35% 5%',
            },
            { name: 'destructive', type: 'text', required: true, defaultValue: '354 70% 55%' },
            {
              name: 'destructiveForeground',
              type: 'text',
              required: true,
              defaultValue: '0 0% 96%',
            },
            { name: 'border', type: 'text', required: true, defaultValue: '210 28.8% 34%' },
            { name: 'input', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            { name: 'ring', type: 'text', required: true, defaultValue: '203.7 77.2% 48.2%' },
            { name: 'success', type: 'text', required: true, defaultValue: '185.4 100% 60.8%' },
            { name: 'warning', type: 'text', required: true, defaultValue: '44 90% 62%' },
            { name: 'error', type: 'text', required: true, defaultValue: '354 70% 55%' },
          ],
        },
        {
          name: 'dark',
          type: 'group',
          fields: [
            { name: 'background', type: 'text', required: true, defaultValue: '222 35% 5%' },
            { name: 'foreground', type: 'text', required: true, defaultValue: '0 0% 74.9%' },
            { name: 'card', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            {
              name: 'cardForeground',
              type: 'text',
              required: true,
              defaultValue: '0 0% 74.9%',
            },
            { name: 'popover', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            {
              name: 'popoverForeground',
              type: 'text',
              required: true,
              defaultValue: '0 0% 74.9%',
            },
            { name: 'primary', type: 'text', required: true, defaultValue: '203.7 77.2% 48.2%' },
            { name: 'primaryForeground', type: 'text', required: true, defaultValue: '0 0% 96%' },
            { name: 'secondary', type: 'text', required: true, defaultValue: '185.4 100% 60.8%' },
            {
              name: 'secondaryForeground',
              type: 'text',
              required: true,
              defaultValue: '222 35% 5%',
            },
            { name: 'muted', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            { name: 'mutedForeground', type: 'text', required: true, defaultValue: '0 0% 62%' },
            { name: 'accent', type: 'text', required: true, defaultValue: '185.4 100% 60.8%' },
            {
              name: 'accentForeground',
              type: 'text',
              required: true,
              defaultValue: '222 35% 5%',
            },
            { name: 'destructive', type: 'text', required: true, defaultValue: '354 70% 55%' },
            {
              name: 'destructiveForeground',
              type: 'text',
              required: true,
              defaultValue: '0 0% 96%',
            },
            { name: 'border', type: 'text', required: true, defaultValue: '210 28.8% 34%' },
            { name: 'input', type: 'text', required: true, defaultValue: '210 28.8% 28.6%' },
            { name: 'ring', type: 'text', required: true, defaultValue: '203.7 77.2% 48.2%' },
            { name: 'success', type: 'text', required: true, defaultValue: '185.4 100% 60.8%' },
            { name: 'warning', type: 'text', required: true, defaultValue: '44 90% 62%' },
            { name: 'error', type: 'text', required: true, defaultValue: '354 70% 55%' },
          ],
        },
      ],
    },
    {
      name: 'radius',
      type: 'text',
      required: true,
      defaultValue: '0.5rem',
      admin: {
        description: 'CSS border radius token. Example: 0.5rem',
      },
    },
  ],
}

