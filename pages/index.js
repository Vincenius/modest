import useSWR from 'swr'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import PostList from './components/PostList'
import Header from './components/Header'
import NewPost from './components/NewPost'

const fetcher = (url) => fetch(url).then((res) => res.json());

// Learn more about using SWR to fetch data from
// your API routes -> https://swr.vercel.app/
export default function App() {
  const { data: session } = useSession()
  const { data, error } = useSWR(
    '/api/item',
    fetcher
  );

  if (error) return 'An error has occurred.';

  return <div>
    <Head>
      <title>Modest Blog</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link href="favicon.ico" rel="icon" type="image/x-icon"></link>
    </Head>
    <Header />

    <main>
      { session && <NewPost /> }
      <PostList data={data} isAdmin={!!session} />
    </main>
  </div>
}
