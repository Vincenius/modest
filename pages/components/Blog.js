import React, { useState } from 'react'
import Head from 'next/head'
import Button from '@mui/material/Button'
import PostList from './PostList'
import Header from './Header'
import NewPost from './NewPost'
import IntroSection from './IntroSection'
import Newsletter from './Newsletter'
import styles from './Blog.module.css'

// https://nextjs.org/blog/next-13#og-image-generation

const Blog = ({
  session,
  name,
  description,
  blogId,
  profileImg,
  headerImg = '',
  useComments,
  useNewsletter,
  headerColor,
  introText,
  // TODO store all these in state instead of passing them down?
}) => {
  const [rangeKeys, setRangeKeys] = useState([null])
  const [lastRangeKey, setLastRangeKey] = useState(null)
  const title = `${name} | ${description}`
  const isCustomHeader = headerImg && headerImg.includes('https://')
  const introIsEmpty = !introText || !introText.trim() || introText.trim() === '​'

  const ogImage = isCustomHeader ? `&image=${headerImg}&theme=${headerColor}` : ''
  // TODO handle base url
  const ogLink = `https://modest.app/api/og/?title=${encodeURI(name)}&description=${encodeURI(description)}${ogImage}`

  const fetchMore = () => {
    setLastRangeKey(null)
    setRangeKeys([...rangeKeys, lastRangeKey])
  }

  return <div className={styles.container}>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogLink} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogLink} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header name={name} description={description} headerImg={headerImg} headerColor={headerColor} />
    <main className={styles.main}>
      { !introIsEmpty && <IntroSection introText={introText} profileImg={profileImg} /> }
      { useNewsletter && <Newsletter blogId={blogId} /> }
      { session && <NewPost blogId={blogId} profileImg={profileImg} /> }

      { rangeKeys.map(lastItemRangeKey =>
        <div key={lastItemRangeKey}>
          <PostList
            isAdmin={!!session}
            range={lastItemRangeKey}
            setLastRangeKey={setLastRangeKey}
            blogId={blogId}
            profileImg={profileImg}
            useComments={useComments}
          />
        </div>
      )}

      { lastRangeKey && <Button
        variant="contained"
        onClick={fetchMore}
        style={{ margin: '40px auto', display: 'block' }}
      >
        Mehr Laden!
      </Button> }
    </main>
    <footer className={styles.footer}>
      created with <a href="https://modest.app">modest.app</a>
    </footer>
  </div>
}

Blog.getInitialProps = async(context) => {
  const { req } = context
  if (req) {
    let baseUrl = req.headers.host // will give you localhost:3000
  }

  return { baseUrl }
}

export default Blog
