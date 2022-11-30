import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useSWRConfig } from 'swr'
import ImageGallery from 'react-image-gallery'

import TextareaAutosize from '@mui/material/TextareaAutosize'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import VideoCameraBackOutlinedIcon from '@mui/icons-material/VideoCameraBackOutlined'
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined'
import { getResizedImage, getImageDimensions } from '../../utils/resizeImage'
import Profile from './Profile'
import styles from './NewPost.module.css'

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

const NewPost = ({ data, setEditPost, range = null, blogId, profileImg }) => {
  const id = data ? data.id : 'new'
  const [prevFiles, setPrevFiles] = useState([])
  const { mutate } = useSWRConfig()
  const [value, setValue] = useState('')
  const [urls, setUrls] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [isEmojiOpen, setIsEmojiOpen] = useState(null)
  const [cursorPos, setCursorPos] = useState(0)
  const imagePreview = useRef(null)

  useEffect(() => {
    if (data) {
      setValue(data.content.text)
      setUrls(data.content.files)
      setPrevFiles(data.content.files)
    }
  }, [data, setValue, setUrls])

  // todo delete files on unmount
  // useEffect(() => () => {
  //   handleUnusedFiles(false)
  // })

  const uploadFile = (file, type = 'image') => {
    const formData = new FormData();
    formData.append(type, file);

    const options = {
      method: 'POST',
      body: formData,
    }

    return fetch(`/api/files/${blogId}`, options)
      .catch(err => alert('Unexpected error', err))
      .then(res => res.json())
  }

  const handleImageChange = async ({ target }) => {
    setIsLoading(true)
    const files = Array.from(target.files);

    for (let index = 0; index < files.length; index++) {
      const file = files[index] || {};
      const fileSize = await getImageDimensions(file)
      const imageSize = fileSize.height > fileSize.width
        ? fileSize.height
        : fileSize.width

      const thumbnailFile = await getResizedImage({ imageSize, file, imageMaxSize: 300 })
      const mediumFile = await getResizedImage({ imageSize, file, imageMaxSize: 980 })
      const largeFile = await getResizedImage({ imageSize, file, imageMaxSize: 2000 })

      const response = await Promise.all([
        uploadFile(largeFile),
        uploadFile(thumbnailFile),
        uploadFile(mediumFile),
      ])

      const [{ url }, { url: thumbnailUrl }, { url: mediumUrl }] = response

      setUrls(current => [...current, { url, thumbnailUrl, mediumUrl, type: 'image' }]);
      setUploadedFiles(current => [...current, url, thumbnailUrl, mediumUrl])
    }

    setIsLoading(false)
  };

  const handleVideoChange = async ({ target }) => {
    setIsLoadingVideo(true)
    const files = Array.from(target.files);

    for (let index = 0; index < files.length; index++) {
      const file = files[index] || {};
      const { url } = await uploadFile(file, 'video')
      setUrls(current => [...current, { url, type: 'video' }]);
      setUploadedFiles(current => [...current, url])
    }

    setIsLoadingVideo(false)
  }

  const addEmoji = (event, emojiObject) => {
    const beginValue = value.slice(0, cursorPos) || ''
    const endValue = value.slice(cursorPos, value.length) || ''
    const newValue = `${beginValue}${emojiObject.emoji}${endValue}`
    setValue(newValue)
    setIsEmojiOpen(false)
  }

  const submit = () => {
    if (!data) {
      submitCreate()
    } else {
      submitEdit()
    }
  }

  const submitCreate = () => {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        text: value,
        files: urls,
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    }

    fetch(`/api/items/${blogId}`, options)
      .then(() => mutate(`/api/items/${blogId}?range=${range}`))
      .then(() => {
        setValue('')
        setUrls([])
      })
      .then(() => handleUnusedFiles(true, urls))
      .catch(err => console.log('Unexpected error', err))
  }

  const handleUnusedFiles = (isSubmit, submittedFiles = []) => {
    const postUrls = urls.map(f => [f.mediumUrl, f.url, f.thumbnailUrl]).flat()
    const prevUrls = prevFiles.map(f => [f.mediumUrl, f.url, f.thumbnailUrl]).flat()
    const submittedUrls = submittedFiles.map(f => [f.mediumUrl, f.url, f.thumbnailUrl]).flat()

    // files that have been deleted and submitted
    const unusedPrevUrls = isSubmit
      ? prevUrls.filter(file => !postUrls.find(u => u === file))
      : [] // only delete unused uploaded if submit

    // files that have been uploaded but not used in the post
    const unusedUploadedFiles = uploadedFiles.filter(f => !submittedUrls.find(u => u === f))
    const unusedUrls = [...unusedUploadedFiles, ...unusedPrevUrls]

    if (unusedUrls.length > 0) {
      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
      fetch(`/api/files/${blogId}?files=${unusedUrls.join(',')}`, options)
        .catch(err => console.log('Unexpected error', err))
    }
  }

  const submitEdit = () => {
    const options = {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        content: {
          ...data.content,
          text: value,
          files: urls,
        }
      }),
      headers: {
          'Content-Type': 'application/json'
      }
    }

    fetch(`/api/items/${blogId}`, options)
      .then(() => mutate(`/api/items/${blogId}?range=${range}`))
      .then(() => setEditPost({}))
      .then(() => handleUnusedFiles(true, urls))
      .catch(err => console.log('Unexpected error', err))
  }

  return <div className={styles.postContainer}>
      <Profile profileImg={profileImg} blogId={blogId} />
      <div className={styles.post}>
        <TextareaAutosize
          aria-label="empty textarea"
          placeholder="Your post written in **markdown**"
          style={{ width: '100%' }}
          minRows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={e => setCursorPos(e.target.selectionStart) }
        />

        { isLoadingVideo && <Skeleton variant="rectangular" height={200} /> }

        { (urls.length > 0 || isLoading) && <div className={styles.previewContainer}>
          { (isLoading || urls[0].type === 'image') && <ImageGallery
            showThumbnails={urls && (urls.length > 1 || (urls.length === 1 && isLoading))}
            showPlayButton={false}
            ref={imagePreview}
            items={[...urls.filter(i => i.type !== 'video').map(i => ({
              original: i.mediumUrl,
              thumbnail: i.thumbnailUrl,
              fullscreen: i.url,
            })),
            isLoading && {
              original: '/loading.gif',
              thumbnail: '/loading.gif',
              fullscreen: '/loading.gif',
            }].filter(Boolean)}
          /> }

          {urls.map((url, index) => (
            <div key={url.url}>
              { url.type === 'video' && <video><source src={url.url} /></video> }
              <DeleteForeverIcon onClick={() => {
                const index = imagePreview.current.getCurrentIndex()
                setUrls(current => current.filter((c, i) => i !== index))
              }}/>
            </div>
          ))}
        </div> }

        <div className={styles.postOptions}>
          <div>
            <label for={`photo-upload-${id}`} className={styles.fileUploadLabel}>
              <PhotoCameraOutlinedIcon />
            </label>
            <input
              className={styles.fileUpload}
              id={`photo-upload-${id}`}
              type="file"
              name="file"
              multiple={true}
              onChange={handleImageChange}
              accept="image/*"
              disabled={urls.filter(u => u.type === 'video').length}
            />

            <label for={`video-upload-${id}`} className={styles.fileUploadLabel}>
              <VideoCameraBackOutlinedIcon />
            </label>
            <input
              className={styles.fileUpload}
              id={`video-upload-${id}`}
              type="file"
              name="file"
              multiple={false}
              onChange={handleVideoChange}
              accept="video/*"
              disabled={urls.length}
            />

            <label className={styles.fileUploadLabel}>
              <EmojiEmotionsOutlinedIcon onClick={() => setIsEmojiOpen(!isEmojiOpen)} />
              <div className={styles.emojiPickerContainer}>
                { isEmojiOpen && <Picker onEmojiClick={addEmoji} /> }
              </div>
            </label>
          </div>

          <Button variant="contained" onClick={submit}>Submit</Button>
        </div>
      </div>
    </div>
}

export default NewPost
