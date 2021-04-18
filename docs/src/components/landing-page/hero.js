import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './hero.module.css'

const Hero = () => {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  const logo = useBaseUrl('img/logo-512.png')

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <img
          className={styles.heroLogo}
          src={logo}
          alt="Use-Shopping-Cart logo"
        />

        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p>
          <code className={styles.heroCode}>
            npm install @stripe/stripe-js use-shopping-cart
          </code>
        </p>
        <div className={styles.heroButtons}>
          <Link
            className={clsx(
              'button button--primary button--lg',
              styles.getStarted
            )}
            to={useBaseUrl('docs/getting-started')}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Hero
