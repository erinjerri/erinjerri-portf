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
    copy: 'Erin Jerri Malonzo Pangilinan is a software engineer, startup founder, author, and speaker working at the intersection of AI, spatial computing, and emerging technology.',
  },
  {
    id: 'medium',
    label: 'Medium Bio',
    bestFor: 'Speaker bureau pages, conference websites',
    copy: "Erin Jerri Malonzo Pangilinan is a software engineer, startup founder, author, and former CTO whose work spans AI, spatial computing, and web3. She is the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing from O'Reilly Media, and the founder of TimeBite, an AI-native product exploring how intelligence can move between the physical and digital world.",
  },
  {
    id: 'long',
    label: 'Long Bio',
    bestFor: 'Press kits, proposals, detailed programs',
    copy: "Erin Jerri Malonzo Pangilinan is a software engineer, startup founder, author, and former CTO working at the intersection of AI, spatial computing, and web3. She is widely known as the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing from O'Reilly Media, which debuted as the number one book in Amazon's Game Programming category and has been translated into Chinese and Korean. Erin is the founder of TimeBite, an AI-native product that bridges physical and digital experiences through multimodal intelligence. Her background includes technical and entrepreneurial fellowships with AWS, Gitcoin Kernel, Verizon Ventures, Meta/Oculus Launch Pad, the University of San Francisco Data Institute, and fast.ai. A UC Berkeley alumna and Silicon Valley native, Erin brings a multidisciplinary perspective shaped by engineering, product leadership, civic engagement, and community organizing.",
  },
  {
    id: 'intro',
    label: 'Speaker Intro',
    bestFor: 'Host read-aloud intro',
    copy: "Please welcome Erin Jerri Malonzo Pangilinan: software engineer, startup founder, author, and former CTO. Erin is the lead author of O'Reilly Media's Creating Augmented and Virtual Realities and the founder of TimeBite, where she is building at the intersection of AI, spatial computing, and the physical world.",
  },
  {
    id: 'press',
    label: 'Media/Press Bio',
    bestFor: 'Journalist or media use',
    copy: "Erin Jerri Malonzo Pangilinan is a technologist, founder, author, and speaker focused on AI, spatial computing, and emerging interfaces. She authored Creating Augmented and Virtual Realities with O'Reilly Media and founded TimeBite, an AI-native company exploring multimodal intelligence across physical and digital environments. Her work and fellowships span AWS, Meta/Oculus, Gitcoin Kernel, fast.ai, and the University of San Francisco Data Institute.",
  },
]
