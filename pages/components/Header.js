import React from 'react'
import styles from './Header.module.css'

const Header = ({ name = '', description = '', headerImg = '', headerColor = 'light' }) => {
  const fontColor = headerColor === 'light' ? '#fafafa' : '#212121'
  return <header className={styles.header} style={{ backgroundImage: headerImg, color: fontColor }}>
    <div className={styles.headerContent}>
      <h1 style={{ color: fontColor }}>{name}</h1>
      <h2 style={{ color: fontColor }}>{description}</h2>
    </div>
  </header>
}

export default Header
