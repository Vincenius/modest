import { SessionProvider } from "next-auth/react"

import '../styles/variables.css'
import '../styles/globals.css'
import '../styles/fonts.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
