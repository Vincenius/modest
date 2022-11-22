import React, { useState } from 'react'
import Head from 'next/head'
import Button from '@mui/material/Button'
import PostList from './PostList'
import Header from './Header'
import NewPost from './NewPost'
import styles from './Blog.module.css'

const Blog = ({ session, name, description, blogId, profileImg, headerImg, useComments }) => {
  const [rangeKeys, setRangeKeys] = useState([null])
  const [lastRangeKey, setLastRangeKey] = useState(null)
  const title = `${name} | ${description}`

  const fetchMore = () => {
    setLastRangeKey(null)
    setRangeKeys([...rangeKeys, lastRangeKey])
  }

  return <div className={styles.container}>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header name={name} description={description} headerImg={headerImg} />
    <main className={styles.main}>
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

export default Blog
