import React from 'react'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import Blog from './components/Blog'


export default function App() {
  const { data: session } = useSession()

  return <div>
    <Head>
      <title>Modest Blog</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link href="favicon.ico" rel="icon" type="image/x-icon"></link>
    </Head>

    <Blog
      session={session}
      blogId="blog" // used for database selector
      name="Modest Blog"
      description="An open-source, twitter-like micro-blogging website!"
      headerImg="/pattern.png"
      profileImg="/profile.JPG"
    />
  </div>
}
