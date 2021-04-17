import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const features = [
  {
    title: 'Easy to Use',
    imageUrl: 'img/usc-logo.svg',

    description: (
      <>
        use-shopping-cart is designed to handle all of your crucial shopping
        cart needs so you can focus on everything else.
      </>
    )
  },
  {
    title: 'Stripe Powered',
    imageUrl: 'img/stripe.svg',
    description: (
      <>
        Processing payments on the internet couldn't have been easier.
        use-shopping-cart sets you up with a tight integration with Stripe
        whether you have a server or not.
      </>
    )
  },
  {
    title: 'Framework Agnostic',
    imageUrl: 'img/redux.svg',
    description: (
      <>
        use-shopping-cart is built on top of redux-tool-kit. This makes this
        library accessible to those who want shopping cart experiences with or
        without a framework.
      </>
    )
  }
]

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
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
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Use Shopping Cart is a hooks library for Stripe checkout to provide an API first way of managing shopping cart state and logic. Handles one time purchases, subscriptions, and logic."
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
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
