import PageTemplate, { generateMetadata as generateSlugMetadata } from './[slug]/page'

const homeParams = Promise.resolve({ slug: 'home' })

export default function HomePage() {
  return <PageTemplate params={homeParams} />
}

export function generateMetadata() {
  return generateSlugMetadata({ params: homeParams })
}
