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
    bestFor: 'Event listings, podcast notes, social captions',
    copy: 'Erin Pangilinan is a tech startup founder, software engineer, former CTO and author building AI-native products at the intersection of spatial computing, web3, and multimodal systems. She is widely known as the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly), which debuted #1 in Game Programming on Amazon. Erin is working on her next startups, books, and film projects.',
  },
  {
    id: 'medium',
    label: 'Medium Bio',
    bestFor: 'Speaker bureau pages, conference websites',
    copy: 'Erin Jerri Malonzo Pañgilinan is a software engineer, startup founder, and former CTO working at the intersection of AI, spatial computing, and web3. She is widely known as the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly Media), which debuted as the #1 book in Amazon’s Game Programming category and has been translated into Chinese and Korean, with distribution in more than 42 countries. Erin is the founder of TimeBite, an AI-native product that bridges the physical and digital.',
  },
  {
    id: 'long',
    label: 'Long Bio',
    bestFor: 'Press kits, proposals, detailed programs',
    copy: 'Erin Jerri Malonzo Pañgilinan is a software engineer, startup founder, and former CTO working at the intersection of AI, spatial computing, and web3. She is widely known as the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly Media), which debuted as the #1 book in Amazon’s Game Programming category and has been translated into Chinese and Korean, with distribution in more than 42 countries. Erin is the founder of TimeBite, an AI-native product that bridges the physical and digital — embedding multimodal intelligence directly into how people interact with and move through the world. Her technical foundation includes fellowships in deep learning at the University of San Francisco Data Institute (2017–2018) and the inaugural Data Ethics cohort through fast.ai (2020). She earned her BA from University of California, Berkeley and is a Silicon Valley native, where early exposure to founders, technologists, and civic leadership shaped her perspective on innovation. Outside of her professional work, Erin is a seasoned community organizer and advocate. She co-founded organizations including FASTER (Filipinx American in STEAM) and ARVR Academy, focused on expanding access to emerging technologies for underrepresented communities, and has served on the board of the Silicon Valley Ice Skating Association (SVISA).',
  },
  {
    id: 'intro',
    label: 'Speaker Intro',
    bestFor: 'Host read-aloud intro',
    copy: 'Please welcome Erin Jerri Malonzo Pañgilinan: software engineer, startup founder, former CTO, and lead author of Creating Augmented and Virtual Realities from O’Reilly Media. Erin is the founder of TimeBite and works at the intersection of AI, spatial computing, web3, and multimodal systems.',
  },
  {
    id: 'press',
    label: 'Media/Press Bio',
    bestFor: 'Journalist or media use',
    copy: 'Erin Jerri Malonzo Pañgilinan is a software engineer, startup founder, former CTO, author, and speaker working at the intersection of AI, spatial computing, web3, and multimodal systems. She is the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing from O’Reilly Media and the founder of TimeBite.',
  },
]
