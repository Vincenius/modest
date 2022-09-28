import React from 'react'
import Image from 'next/image'
import Skeleton from '@mui/material/Skeleton'
import styles from './Profile.module.css'

const Profile = ({ isLoading = false }) => {
    return <div className={styles.profile}>
      { !isLoading && <Image
        src="/profile.jpg"
        alt="Profile"
        layout="fill"
      /> }
      { isLoading && <Skeleton variant="circular" /> }
    </div>
}

export default Profile
