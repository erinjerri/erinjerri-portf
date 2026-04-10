import NextErrorComponent from 'next/error'
import type { ErrorProps } from 'next/error'

export default function ErrorPage(props: ErrorProps) {
  return <NextErrorComponent {...props} />
}
