import React, { useState, useEffect } from 'react'
import useSWR from 'swr'

import Skeleton from '@mui/material/Skeleton'
import Profile from './Profile'
import NewPost from './NewPost'
import Post from './Post'
import styles from './PostList.module.css'

const fetcher = (url) => fetch(url).then((res) => res.json());

const PostList = ({ range, setLastRangeKey, isAdmin }) => {
  const [editPost, setEditPost] = useState({})
  const itemUri = `/api/item?range=${range}`

  const { data, error } = useSWR(
    itemUri,
    fetcher
  )

  useEffect(() => {
    if (data && data.length && data.length === 10) {
      setLastRangeKey(data[data.length - 1].createdAt)
    }
  }, [data])

  if (error) return 'An error has occurred.'

  if (!data) return <div>
    { [1, 2, 3].map(i => <div className={styles.postContainer} key={i}>
      <Profile isLoading={true} />
      <div className={styles.post} key={i}>
        <time>
          <Skeleton variant="text" width={100}/>
        </time>
        <Skeleton variant="text" />
        <Skeleton variant="text" width={150} />
        <br />
        <Skeleton variant="rectangular" height={300} />
      </div>
    </div>)}
  </div>

  return <div>
    { data.map(d => <div className={styles.postContainer} key={d.uid}>
      { d.uid === editPost.uid && <NewPost data={editPost} setEditPost={setEditPost} range={range} /> }
      { d.uid !== editPost.uid && <Profile /> }
      { d.uid !== editPost.uid && <Post data={d} isAdmin={isAdmin} setEditPost={setEditPost} range={range} /> }
    </div>) }
  </div>
}

export default PostList
