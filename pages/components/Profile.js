import React from 'react'
import Image from 'next/image'
import Avvvatars from 'avvvatars-react'
import Skeleton from '@mui/material/Skeleton'
import styles from './Profile.module.css'

const Profile = ({ isLoading = false, profileImg, blogId }) => {
  return <div className={styles.profile}>
    { !isLoading && profileImg && <Image
      src={profileImg}
      alt="Profile"
      layout="fill"
    /> }
    { !isLoading && !profileImg &&
      <div className={styles.placeholder}><Avvvatars value={blogId} style="shape" size={50} /></div>
    }
    { isLoading && <Skeleton variant="circular" /> }
  </div>
}

export default Profile
