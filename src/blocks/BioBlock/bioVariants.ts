export type BioVariant = {
  id: 'short' | 'medium' | 'long' | 'intro' | 'press'
  label: string
  bestFor: string
  copy: string
}

const longBio =
  'Erin Jerri Malonzo Pañgilinan is a proud Silicon Valley native born and raised software engineer, startup founder, former CTO, author, and speaker working at the intersection of artificial intelligence, spatial computing, and emerging interfaces.\n\n' +
  'She is the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly Media), which debuted as the #1 new release in Amazon’s Game Programming category, has been translated into Chinese and Korean, is distributed in more than 42 countries, and became widely known within the XR community as the “VR Bible.”\n\n' +
  'Erin is the founder of TimeBite, an AI-native platform currently in beta on Apple platforms, that helps people better understand how they spend their time and align daily actions with long-term goals.\n\n' +
  'Her technical background includes selection into leading engineering and entrepreneurial programs, including the Amazon Web Services CTO Fellowship (2022), Gitcoin Kernel (2021), Verizon Ventures’ Alley program (2019), Meta’s Oculus Launch Pad (2018), the University of San Francisco Data Institute’s Deep Learning Fellowship (2017–2018), the inaugural Data Ethics program through fast.ai (2020), and Venture Forward through the National Venture Capital Association (NVCA) and UC Berkeley Executive Law Program (2025).\n\n' +
  'Erin earned her B.A. from the University of California, Berkeley.\n\n' +
  'Early in her career, she spent more than seven years as a journalist and more than five years in civic engagement, including paid campaign staff for Obama for America (2012) and Ro Khanna for Congress (2014).\n\n' +
  'She co-founded two nonprofit organizations — FASTER (Filipinx Americans in STEAM), which supports Filipinx American professionals in tech, and ARVR Academy, which focused on increasing representation of women in immersive technology — and has served on the board of the Silicon Valley Ice Skating Association (SVISA)\n\n' +
  'Today, Erin builds AI-native products, advises founders on AI and spatial computing, and is developing new books, film, and television projects.'

export const bioVariants: BioVariant[] = [
  {
    id: 'short',
    label: 'Short Bio',
    bestFor: 'Event listings, podcast notes, social captions',
    copy: 'Erin Jerri Malonzo Pañgilinan is a Silicon Valley native, software engineer, startup founder, former CTO, author, and speaker working at the intersection of artificial intelligence, spatial computing, and emerging interfaces.',
  },
  {
    id: 'medium',
    label: 'Medium Bio',
    bestFor: 'Speaker bureau pages, conference websites',
    copy: 'Erin Jerri Malonzo Pañgilinan is a Silicon Valley native, software engineer, startup founder, former CTO, author, and speaker working at the intersection of artificial intelligence, spatial computing, and emerging interfaces. She is the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly Media), the internationally distributed book known within the XR community as the “VR Bible.” Erin is also the founder of TimeBite, an AI-native platform currently in beta on Apple platforms.',
  },
  {
    id: 'long',
    label: 'Long Bio',
    bestFor: 'Press kits, proposals, detailed programs',
    copy: longBio,
  },
  {
    id: 'intro',
    label: 'Speaker Intro',
    bestFor: 'Host read-aloud intro',
    copy: 'Please welcome Erin Jerri Malonzo Pañgilinan, a Silicon Valley native, software engineer, startup founder, former CTO, author, and speaker working at the intersection of artificial intelligence, spatial computing, and emerging interfaces. Erin is the lead author of O’Reilly Media’s Creating Augmented and Virtual Realities, known within the XR community as the “VR Bible,” and the founder of TimeBite, an AI-native platform currently in beta on Apple platforms.',
  },
  {
    id: 'press',
    label: 'Media/Press Bio',
    bestFor: 'Journalist or media use',
    copy: 'Erin Jerri Malonzo Pañgilinan is a Silicon Valley native, software engineer, startup founder, former CTO, author, and speaker focused on artificial intelligence, spatial computing, and emerging interfaces. She is the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly Media), which debuted as Amazon’s #1 new release in Game Programming, has been translated into Chinese and Korean, and is distributed in more than 42 countries. Erin founded TimeBite, an AI-native platform currently in beta on Apple platforms. Her technical and entrepreneurial programs include the AWS CTO Fellowship, Gitcoin Kernel, Verizon Ventures’ Alley program, Meta’s Oculus Launch Pad, the USF Data Institute’s Deep Learning Fellowship, fast.ai’s inaugural Data Ethics program, and Venture Forward through NVCA and the UC Berkeley Executive Law Program.',
  },
]
