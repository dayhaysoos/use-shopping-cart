import React from 'react'
import styles from './credits.module.css'

const Credits = () => {
  return (
    <p className={styles.creditText}>
      Built with ❤️ by <a href="https://github.com/dayhaysoos">Nick DeJesus</a>{' '}
      and <a href="/docs/contributors">a team of amazing contributors</a>
    </p>
  )
}

export default Credits
