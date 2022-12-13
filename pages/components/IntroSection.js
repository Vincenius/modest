import React from 'react'
import { Remark } from 'react-remark'
import styles from './IntroSection.module.css'

const IntroSection = ({ introText, profileImg }) => {
  return <div className={styles.container}>
    {/* TODO design option to show image */}
    {/* { profileImg && <img src={profileImg} className={styles.profile} alt="profile image" /> } */}
    <div>
      <Remark disallowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img']}>{introText}</Remark>
    </div>
  </div>
}

export default IntroSection
