export type BioVariant = {
  id: 'short' | 'medium' | 'long' | 'intro' | 'press'
  label: string
  bestFor: string
  copy: string
}

export const bioVariants: BioVariant[] = [
  {
    id: 'short',
    label: 'Short Bio',
    bestFor: 'Event listings, podcast notes, and social captions',
    copy: 'Your Name is a multidisciplinary creator working across strategy, design, technology, and storytelling.',
  },
  {
    id: 'medium',
    label: 'Medium Bio',
    bestFor: 'Conference websites and collaborator introductions',
    copy: 'Your Name is a multidisciplinary creator who turns complex ideas into thoughtful, useful experiences. Their work spans strategy, design, technology, and storytelling, with an emphasis on craft, clarity, and measurable outcomes.',
  },
  {
    id: 'long',
    label: 'Long Bio',
    bestFor: 'Press kits, proposals, and detailed programs',
    copy: 'Replace this text with a detailed professional biography. Include the work you do, the audiences you serve, the experience that shaped your perspective, and a few specific accomplishments that establish credibility.',
  },
  {
    id: 'intro',
    label: 'Speaker Intro',
    bestFor: 'Host read-aloud introduction',
    copy: 'Please welcome Your Name, a multidisciplinary creator who helps teams turn complex ideas into clear and useful experiences.',
  },
  {
    id: 'press',
    label: 'Media/Press Bio',
    bestFor: 'Journalist and media use',
    copy: 'Your Name is a creator, strategist, and speaker. Replace this text with a concise third-person biography and links to verified accomplishments.',
  },
]
