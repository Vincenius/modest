import React from 'react'
import styles from './Header.module.css'

const Header = () => {
    return <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1>Linda und Vincents Abenteuer</h1>
      </div>
    </header>
}

export default Header
