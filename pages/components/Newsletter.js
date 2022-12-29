import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

import styles from './Newsletter.module.css'

const Newsletter = ({ blogId }) => {
  const [email, setEmail] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const subscribeEmail = e => {
    e.preventDefault()
    setSubmitLoading(true)

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
      })
    }

    fetch(`/api/newsletter/subscribe/${blogId}`, options)
      .then(res => {
        setShowSuccess(true)
        setEmail('')
      })
      .catch(err => console.log('Unexpected error', err)) // todo show error
      .finally(() => setSubmitLoading(false))
  }

  return <div className={styles.container}>
    <p className={styles.introText}>
      Sign up to my Newsletter to get regular updates and never miss a post again.
    </p>

    <form onSubmit={subscribeEmail} className={styles.form}>
      <TextField
        required
        label="Your E-Mail Address"
        variant="outlined"
        value={email}
        onChange={e => {
          setEmail(e.target.value)
        }}
        size="small"
        type="email"
        className={styles.textInput}
      />
      <Button
        variant="outlined"
        style={{ margin: '10px 0 20px', width: '100%' }}
        type="submit"
        className={styles.button}
        disabled={submitLoading}
      >
        { submitLoading && <CircularProgress size={22} /> }
        { !submitLoading && 'Submit' }
      </Button>
    </form>
    <Snackbar open={showSuccess} autoHideDuration={10000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'bottom', }}>
      <MuiAlert onClose={() => setShowSuccess(false)} severity="success" elevation={6} sx={{ width: '100%' }}>
        Successfully signed up!
      </MuiAlert>
    </Snackbar>
  </div>
}

export default Newsletter
