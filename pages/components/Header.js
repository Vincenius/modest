import React from 'react'
import styles from './Header.module.css'

const Header = ({ name = '', description = '', headerImg = '', headerColor = 'light' }) => {
  const fontColor = headerColor === 'light' ? '#fafafa' : '#212121'
  const isCustomHeader = headerImg.includes('https://')
  const gradient = isCustomHeader
    ? headerColor === 'light'
      ? 'linear-gradient(0deg, rgb(0 0 0 / 35%), transparent)'
      : 'linear-gradient(0deg, rgb(255 255 255 / 35%), transparent)'
    : 'none'

  return <header className={styles.header} style={{ backgroundImage: headerImg, color: fontColor }}>
    <div className={styles.headerContent} style={{ background: gradient }}>
      <h1 style={{ color: fontColor }}>{name}</h1>
      <h2 style={{ color: fontColor }}>{description}</h2>
    </div>
  </header>
}

export default Header
