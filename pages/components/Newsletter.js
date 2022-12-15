import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import styles from './Newsletter.module.css'

const Newsletter = ({ blogId }) => {
  const [email, setEmail] = useState('')

  const subscribeEmail = e => {
    e.preventDefault()

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
      })
    }

    fetch(`/api/newsletter/${blogId}`, options)
      .then(res => res.json()) // todo show success & info
      .catch(err => console.log('Unexpected error', err)) // todo show error
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
      >
        Subscribe
      </Button>
    </form>
  </div>
}

export default Newsletter
