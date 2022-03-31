import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useSWRConfig } from 'swr'

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

const NewPost = () => {
  const { mutate } = useSWRConfig()
  const [value, setValue] = useState('')
  const [urls, setUrls] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEmojiOpen, setIsEmojiOpen] = useState(null)
  const [cursorPos, setCursorPos] = useState(0)

  const uploadFile = (file, type = 'image') => {
    const formData = new FormData();
    formData.append(type, file);

    const options = {
      method: 'POST',
      body: formData,
    }

    return fetch('/api/upload', options)
      .catch(err => alert('ERR', err))
      .then(res => res.json())
  }

  const handleImageChange = async ({ target }) => {
    setIsLoading(true)
    const files = Array.from(target.files);

    // TODO only preview first & upload on submit
    for (let index = 0; index < files.length; index++) {
      const file = files[index] || {}; // TODO set max size & check default size
      const fileSize = await getImageDimensions(file)
      const imageSize = fileSize.height > fileSize.width
        ? fileSize.height
        : fileSize.width

      const thumbnailFile = await getResizedImage({ imageSize, file, imageMaxSize: 300 })
      const mediumFile = await getResizedImage({ imageSize, file, imageMaxSize: 980 })
      const largeFile = await getResizedImage({ imageSize, file, imageMaxSize: 2400 })

      // TODO post at once with formdata
      const response = await Promise.all([
        uploadFile(largeFile),
        uploadFile(thumbnailFile),
        uploadFile(mediumFile),
      ])

      console.log(response)
      const [{ url }, { url: thumbnailUrl }, { url: mediumUrl }] = response

      setUrls(current => [...current, { url, thumbnailUrl, mediumUrl, type: 'image' }]);
    }

    setIsLoading(false)
  };

  const handleVideoChange = async ({ target }) => {
    setIsLoading(true)
    const files = Array.from(target.files);

    for (let index = 0; index < files.length; index++) {
      const file = files[index] || {};
      const { url } = await uploadFile(file, 'video')
      setUrls(current => [...current, { url, type: 'video' }]);
    }

    setIsLoading(false)
  }

  const submit = () => {
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

    fetch('/api/item', options)
      .then(() => mutate('/api/item'))
      .catch(err => alert('ERR', err))
  }

  const addEmoji = (event, emojiObject) => {
    const beginValue = value.slice(0, cursorPos) || ''
    const endValue = value.slice(cursorPos, value.length) || ''
    const newValue = `${beginValue}${emojiObject.emoji}${endValue}`
    setValue(newValue)
    setIsEmojiOpen(false)
  }

  return <div className={styles.postContainer}>
      <Profile />
      <div className={styles.post}>
        <TextareaAutosize
          aria-label="empty textarea"
          placeholder="Your post"
          style={{ width: '100%' }}
          minRows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={e => setCursorPos(e.target.selectionStart) }
        />

        {/* TODO style */}
        { urls.length > 0 && <div className={styles.previewContainer}>
          {urls.map((url, index) => (
            <div key={url.url}>
              { url.type !== 'video' && <img src={url.mediumUrl} />}
              { url.type === 'video' && <video><source src={url.url} /></video> }
              <DeleteForeverIcon onClick={() => setUrls(current => current.filter(c => c.url !== url.url))}/>
            </div>
          ))}

          { isLoading && <Skeleton variant="rectangular" height={200} width={200} /> }
        </div> }

        <div className={styles.postOptions}>
          <div>
            <label for="photo-upload" className={styles.fileUploadLabel}>
              <PhotoCameraOutlinedIcon />
            </label>
            <input
              className={styles.fileUpload}
              id="photo-upload"
              type="file"
              name="file"
              multiple={true}
              onChange={handleImageChange}
              accept="image/*"
              disabled={urls.filter(u => u.type === 'video').length}
            />

            <label for="video-upload" className={styles.fileUploadLabel}>
              <VideoCameraBackOutlinedIcon />
            </label>
            <input
              className={styles.fileUpload}
              id="video-upload"
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
