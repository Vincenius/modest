import React from 'react'
import styles from './Header.module.css'

const Header = () => {
    return <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1>Modest Blog</h1>
        <h2>An open-source, twitter-like micro-blogging website!</h2>
      </div>
    </header>
}

export default Header
