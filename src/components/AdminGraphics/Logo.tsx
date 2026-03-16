import React from 'react'
import { getServerSideURL } from '@/utilities/getURL'

const Logo: React.FC = () => {
  const faviconSrc = new URL('/favicon.svg', getServerSideURL()).toString()

  return (
    <img
      alt="Admin Logo"
      width={168}
      height={56}
      src={faviconSrc}
      style={{ display: 'block', height: 'auto', maxWidth: '168px', width: '100%' }}
    />
  )
}

export default Logo
