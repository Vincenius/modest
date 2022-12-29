import React from 'react'
import { useRouter } from 'next/router'

const Unsubscribe = () => {
  const router = useRouter()
  const { result } = router.query

  const isError = result === 'not_found' || result === 'error'

  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    { isError && <div>Something went wrong.<br/><br/>Please contact <a href="mailto:info@modest.app">info@modest.app</a> if you are not able to unsubscribe.</div> }
    { !isError && <div>Successfully unsubscribed</div> }
  </div>
}

export default Unsubscribe
