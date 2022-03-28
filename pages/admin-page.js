import React, { useState } from 'react'
import useSWR from 'swr'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import Button from '@mui/material/Button'
import FileUpload from './components/FileUpload'
import PostList from './components/PostList'

const fetcher = (url) => fetch(url).then((res) => res.json())

const AdminPage = () => {
  const [value, setValue] = useState("")
  const [urls, setUrls] = useState([]);

  const { data, error } = useSWR(
    '/api/item',
    fetcher
  );

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
      .then(res => res.json())
      .then(() => alert('OK'))
      .catch(err => alert('ERR', err))
  }

  return <div style={{ width: '600px', margin: '0 auto' }}>
    <h1>Create Post</h1>
    <TextareaAutosize
      aria-label="empty textarea"
      placeholder="Empty"
      style={{ width: 300 }}
      minRows={3}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
    <br/><br/>

    <FileUpload urls={urls} setUrls={setUrls} />

    <br/>
    <div>
      <Button variant="contained" onClick={submit}>Submit</Button>
    </div>

    <PostList data={data} isAdmin={true} />
  </div>
}

export default AdminPage
