import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const features = [
  {
    title: 'Security first',
    imageUrl: 'img/padlock.svg',
    description: (
      <>
        Backed by world class payment solutions from Stripe you can be sure your
        transactions are secure and trusted.
      </>
    )
  },
  {
    title: 'Developer friendly API',
    imageUrl: 'img/api.svg',
    description: (
      <>
        Abstract away the complexity of working with Stripe so that you can
        focus on products your customers will love!
      </>
    )
  },
  {
    title: 'Framework agnostic',
    imageUrl: 'img/beaker.svg',
    description: (
      <>
        Whether you are using React, Vue, Svelte or any other framework
        Use-Shopping-Cart has got your back!
      </>
    )
  }
]

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className={clsx('text--center', styles.featureImg)}>
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  const logo = useBaseUrl('img/logo-512.png')
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Use Shopping Cart is a hooks library for Stripe checkout to provide an API first way of managing shopping cart state and logic. Handles one time purchases, subscriptions, and logic."
    >
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
              npm install use-shopping-cart
            </code>
          </p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--primary button--lg',
                styles.getStarted
              )}
              to={useBaseUrl('docs/')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  )
}

export default Home
