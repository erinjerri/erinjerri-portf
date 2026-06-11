import type { Block } from 'payload'

export const SpeakerBio: Block = {
  slug: 'speakerBio',
  interfaceName: 'SpeakerBioBlock',
  fields: [
    {
      name: 'shortBio',
      label: 'Short Bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'mediumBio',
      label: 'Medium Bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'longBio',
      label: 'Long Bio',
      type: 'textarea',
      required: true,
    },
  ],
}
