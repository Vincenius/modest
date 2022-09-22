import React, { useState } from 'react'
import { useSWRConfig } from 'swr'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import ImageGallery from 'react-image-gallery'
import AnimateHeight from 'react-animate-height'
import Avvvatars from 'avvvatars-react'
import TextField from '@mui/material/TextField'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import styles from './PostList.module.css' // TODO MOVE

const getDateString = date => {
  const aDayAgo = moment().subtract(1, 'days')
  const postDate = moment(date)

  return (aDayAgo < postDate)
    ? postDate.fromNow()
    : postDate.format('LLL')
}

const Post = ({ data, isAdmin, setEditPost }) => {
  const { mutate } = useSWRConfig()
  const [commentDetails, setCommentDetails] = useState({})

  const deletePost = ({ id, createdAt }) => {
    const options = {
      method: 'DELETE',
      body: JSON.stringify({
        id,
        createdAt,
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    }

    fetch('/api/item', options)
      .then(() => mutate('/api/item'))
      .catch(err => alert('ERR', err))
  }

  const toggleComments = id => {
    if (commentDetails[id]) {
      setCommentDetails({
        ...commentDetails,
        [id]: {
          ...commentDetails[id],
          isVisible: !commentDetails[id].isVisible,
        }
      })
    } else {
      setCommentDetails({
        ...commentDetails,
        [id]: {
          isVisible: true,
          isLoading: false,
          name: '',
          message: '',
        }
      })
    }
  }

  const updateCommentDetails = (id, value, field) => {
    setCommentDetails({
      ...commentDetails,
      [id]: {
        ...commentDetails[id],
        [field]: value,
      },
    })
  }

  const submitComment = id => {
    setCommentDetails({
      ...commentDetails,
      [id]: {
        ...commentDetails[id],
        isLoading: true,
      },
    })

    const prevPost = data.find(d => d.id === id)

    const options = {
      method: 'PUT',
      body: JSON.stringify({
        ...prevPost,
        content: {
          ...prevPost.content,
          comments: [
            ...(prevPost.content.comments || []),
            {
              createdAt: Date.now(),
              name: commentDetails[id].name,
              message: commentDetails[id].message,
            }
          ]
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    fetch('/api/item', options)
      .then(res => res.json())
      .then(() => mutate('/api/item'))
      .then(() => {
        setCommentDetails({
          ...commentDetails,
          [id]: {
            ...commentDetails[id],
            isLoading: false,
            name: '',
            message: '',
          },
        })
      })
      .catch(err => alert('ERR', err))
  }

  const deleteComment = (id, comment) => {
    const prevPost = data.find(d => d.id === id)

    const options = {
      method: 'PUT',
      body: JSON.stringify({
        ...prevPost,
        content: {
          ...prevPost.content,
          comments: prevPost.content.comments
            .filter(c => c.createdAt !== comment.createdAt)
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    }

    fetch('/api/item', options)
      .then(() => mutate('/api/item'))
      .catch(err => alert('ERR', err))
  }

  return <div className={styles.post}>
    <time>
      { getDateString(data.createdAt) }
    </time>

    <ReactMarkdown>{data.content.text}</ReactMarkdown>

    { data.content.files && data.content.files.filter(i => i.type !== 'video').length > 0 &&
      <div className={styles.galleryContainer}>
        <ImageGallery
          showThumbnails={data.content.files.length > 1}
          showPlayButton={false}
          items={data.content.files.filter(i => i.type !== 'video').map(i => ({
            original: i.mediumUrl,
            thumbnail: i.thumbnailUrl,
            fullscreen: i.url,
          }))}
        />
      </div>
    }

    { data.content.files && data.content.files.filter(i => i.type === 'video').length > 0 &&
      <div className={styles.galleryContainer}>
        { data.content.files.filter(i => i.type === 'video').map(v => <video controls>
          <source src={v.url} />
        </video>)}
      </div>
    }

    <div className={styles.iconButtonContainer}>
      <span
        className={styles.iconButton}
        onClick={() => toggleComments(data.id)}
      >
        <ChatBubbleOutlineIcon />
        <i>Kommentare</i>&nbsp;[{(data.content.comments || []).length}]
      </span>
      { isAdmin && <span>
        <span className={styles.iconButton} onClick={() => setEditPost(data)}>
          <EditIcon /><i>Edit</i>
        </span>
        <span className={styles.iconButton} onClick={() => deletePost(data)}>
          <DeleteForeverIcon /><i>Delete</i>
        </span>
      </span> }
    </div>

    <AnimateHeight
      duration={ 500 }
      height={commentDetails[data.id] && commentDetails[data.id].isVisible ? 'auto' : 0}
    >
      <div className={styles.commentsContainer}>
        {(data.content.comments || []).map(c => <div className={styles.commentPostContainer} key={data.id}>
          <Avvvatars value={c.name} style="shape" />
          <div className={styles.post}>
            <header>
              <b>{c.name} ·&nbsp;</b>
              <time>
                { getDateString(c.createdAt) }
              </time>
            </header>
            <div>
              {c.message}
            </div>
          </div>
          { isAdmin && <span className={styles.iconButton} onClick={() => deleteComment(data.id, c)}>
            <DeleteForeverIcon /><i>Delete</i>
          </span> }
        </div>)}

        <TextField
          label="Name"
          placeholder="Name"
          size="small"
          className={styles.commentInput}
          required
          value={(commentDetails[data.id] && commentDetails[data.id].name) || ''}
          onChange={e => updateCommentDetails(data.id, e.target.value, 'name')}
        />
        <TextField
          label="Nachricht"
          placeholder="Nachricht"
          multiline
          rows={3}
          size="small"
          className={styles.commentInput}
          required
          value={(commentDetails[data.id] && commentDetails[data.id].message) || ''}
          onChange={e => updateCommentDetails(data.id, e.target.value, 'message')}
        />
        <Button
          variant="contained"
          className={styles.commentSubmit}
          disabled={
            !commentDetails[data.id] || !commentDetails[data.id].name ||
            !commentDetails[data.id].message || commentDetails[data.id].isLoading
          }
          onClick={() => submitComment(data.id)}
        >
          { commentDetails[data.id] && !commentDetails[data.id].isLoading && <span>Antworten</span> }
          { commentDetails[data.id] && commentDetails[data.id].isLoading && <CircularProgress size={22} /> }
        </Button>
      </div>
    </AnimateHeight>
  </div>
}

export default Post
