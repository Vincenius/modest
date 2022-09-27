import React, { useState } from 'react'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import Button from '@mui/material/Button'
import PostList from './components/PostList'
import Header from './components/Header'
import NewPost from './components/NewPost'

// Learn more about using SWR to fetch data from
// your API routes -> https://swr.vercel.app/
export default function App() {
  const [rangeKeys, setRangeKeys] = useState([null])
  const [lastRangeKey, setLastRangeKey] = useState(null)

  const fetchMore = () => {
    setLastRangeKey(null)
    setRangeKeys([...rangeKeys, lastRangeKey])
  }

  const { data: session } = useSession()

  return <div>
    <Head>
      <title>Modest Blog</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link href="favicon.ico" rel="icon" type="image/x-icon"></link>
    </Head>
    <Header />

    <main>
      { session && <NewPost /> }

      { rangeKeys.map(lastItemRangeKey =>
        <div key={lastItemRangeKey}>
          <PostList
            isAdmin={!!session}
            range={lastItemRangeKey}
            setLastRangeKey={setLastRangeKey}
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
  </div>
}
