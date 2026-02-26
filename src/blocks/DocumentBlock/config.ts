import type { Block } from 'payload'

export const DocumentBlock: Block = {
  slug: 'documentBlock',
  interfaceName: 'DocumentBlock',
  labels: {
    singular: 'PDF Document',
    plural: 'PDF Documents',
  },
  fields: [
    {
      name: 'document',
      type: 'upload',
      relationTo: 'documents',
      required: true,
      admin: {
        description: 'Select or upload a PDF to embed on the page.',
      },
    },
  ],
}
