import React from 'react'
import { getServerSideURL } from '@/utilities/getURL'

const Icon: React.FC = () => {
  const faviconSrc = new URL('/favicon.svg', getServerSideURL()).toString()

  return <img alt="Admin Icon" width={24} height={24} src={faviconSrc} />
}

export default Icon
