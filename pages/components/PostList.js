import React, { useState } from 'react'
import Image from 'next/image'
import { useSWRConfig } from 'swr'
import moment from 'moment'
import 'moment/locale/de'
import ReactMarkdown from 'react-markdown'
import ImageGallery from 'react-image-gallery'
import AnimateHeight from 'react-animate-height'
import Avvvatars from 'avvvatars-react'
import TextField from '@mui/material/TextField'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import styles from './PostList.module.css'
import FileUpload from './FileUpload'

const getDateString = date => {
  moment.locale('de')
  const aDayAgo = moment().subtract(1, 'days')
  const postDate = moment(date)

  return (aDayAgo < postDate)
    ? postDate.fromNow()
    : postDate.format('LLL')
}

const PostList = ({ data, isAdmin }) => {
  const { mutate } = useSWRConfig()
  const [commentDetails, setCommentDetails] = useState({})
  const [editPost, setEditPost] = useState({})

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

  const updateEditPost = (field, value) => {
    setEditPost({
      ...editPost,
      content: {
        ...editPost.content,
        [field]: value,
      }
    })
  }

  const updateFiles = getNewFiles => {
    const newFiles = getNewFiles(editPost.content.files || [])
    updateEditPost('files', newFiles)
  }

  const submitEdit = () => {
    const options = {
      method: 'PUT',
      body: JSON.stringify(editPost),
      headers: {
          'Content-Type': 'application/json'
      }
    }

    fetch('/api/item', options)
      .then(() => mutate('/api/item'))
      .then(() => setEditPost({}))
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

  if (!data) return <main className={styles.container}>
    { [1, 2, 3].map(i => <div className={styles.postContainer} key={i}>
      <div className={styles.profile}>
        <Skeleton variant="circular" />
      </div>
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
  </main>

  return <main className={styles.container}>
    { data.map(d => <div className={styles.postContainer} key={d.id}>
      <div className={styles.profile}>
        <Image
          src="/profile.JPG"
          alt="Linda und Vincent"
          layout="fill"
        />
      </div>
      <div className={styles.post}>
        <time>
          { getDateString(d.createdAt) }
        </time>

        { d.id !== editPost.id && <ReactMarkdown>{d.content.text}</ReactMarkdown> }
        { d.id === editPost.id && <TextareaAutosize
          aria-label="empty textarea"
          placeholder="Empty"
          style={{ width: 300 }}
          minRows={3}
          value={editPost.content.text}
          onChange={e => updateEditPost('text', e.target.value)}
        /> }

        { d.content.files && d.content.files.filter(i => i.type !== 'video').length > 0 && d.id !== editPost.id &&
          <div className={styles.galleryContainer}>
            <ImageGallery
              showThumbnails={d.content.files.length > 1}
              showPlayButton={false}
              items={d.content.files.filter(i => i.type !== 'video').map(i => ({
                original: i.mediumUrl,
                thumbnail: i.thumbnailUrl,
                fullscreen: i.url,
              }))}
            />
          </div>
        }

        { d.content.files && d.content.files.filter(i => i.type === 'video').length > 0 &&
          <div className={styles.galleryContainer}>
            { d.content.files.filter(i => i.type === 'video').map(v => <video controls>
              <source src={v.url} />
            </video>)}
          </div>
        }

        { d.id === editPost.id && <FileUpload
          urls={editPost.content.files || []}
          setUrls={updateFiles}
          /> }

        { d.id === editPost.id && <div>
          <Button variant="contained" onClick={submitEdit}>Submit</Button>
        </div> }

        <div className={styles.iconButtonContainer}>
          <span
            className={styles.iconButton}
            onClick={() => toggleComments(d.id)}
          >
            <ChatBubbleOutlineIcon />
            <i>Kommentare</i>&nbsp;[{(d.content.comments || []).length}]
          </span>
          { isAdmin && <span>
            <span className={styles.iconButton} onClick={() => setEditPost(d)}>
              <EditIcon /><i>Edit</i>
            </span>
            <span className={styles.iconButton} onClick={() => deletePost(d)}>
              <DeleteForeverIcon /><i>Delete</i>
            </span>
          </span> }
        </div>

        <AnimateHeight
          duration={ 500 }
          height={commentDetails[d.id] && commentDetails[d.id].isVisible ? 'auto' : 0}
        >
          <div className={styles.commentsContainer}>
            {(d.content.comments || []).map(c => <div className={styles.commentPostContainer} key={d.id}>
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
              { isAdmin && <span className={styles.iconButton} onClick={() => deleteComment(d.id, c)}>
                <DeleteForeverIcon /><i>Delete</i>
              </span> }
            </div>)}

            <TextField
              label="Name"
              placeholder="Name"
              size="small"
              className={styles.commentInput}
              required
              value={(commentDetails[d.id] && commentDetails[d.id].name) || ''}
              onChange={e => updateCommentDetails(d.id, e.target.value, 'name')}
            />
            <TextField
              label="Nachricht"
              placeholder="Nachricht"
              multiline
              rows={3}
              size="small"
              className={styles.commentInput}
              required
              value={(commentDetails[d.id] && commentDetails[d.id].message) || ''}
              onChange={e => updateCommentDetails(d.id, e.target.value, 'message')}
            />
            <Button
              variant="contained"
              className={styles.commentSubmit}
              disabled={
                !commentDetails[d.id] || !commentDetails[d.id].name ||
                !commentDetails[d.id].message || commentDetails[d.id].isLoading
              }
              onClick={() => submitComment(d.id)}
            >
              { commentDetails[d.id] && !commentDetails[d.id].isLoading && <span>Antworten</span> }
              { commentDetails[d.id] && commentDetails[d.id].isLoading && <CircularProgress size={22} /> }
            </Button>
          </div>
        </AnimateHeight>
      </div>
    </div>) }
  </main>
}

export default PostList
