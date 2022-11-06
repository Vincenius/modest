import React from 'react'
import styles from './Header.module.css'

const Header = ({ name = '', description = '', headerImg = '' }) => {
  return <header className={styles.header} style={{ backgroundImage: headerImg }}>
    <div className={styles.headerContent}>
      <h1>{name}</h1>
      <h2>{description}</h2>
    </div>
  </header>
}

export default Header
