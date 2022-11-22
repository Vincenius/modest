import React from 'react'
import Image from 'next/image'
import Avvvatars from 'avvvatars-react'
import Skeleton from '@mui/material/Skeleton'
import styles from './Profile.module.css'

const Profile = ({ isLoading = false, profileImg, blogId }) => {
  return <div className={styles.profile}>
    { !isLoading && profileImg && <img
      src={profileImg}
      alt="Profile"
      style={{ width: '100%', height: '100%' }}
    /> }
    { !isLoading && !profileImg &&
      <div className={styles.placeholder}><Avvvatars value={blogId} style="shape" size={50} /></div>
    }
    { isLoading && <Skeleton variant="circular" /> }
  </div>
}

export default Profile
