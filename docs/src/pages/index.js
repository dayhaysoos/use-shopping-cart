import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const featuresRowOne = [
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

const featuresRowTwo = [
  {
    title: 'Fully tested',
    imageUrl: 'img/check-badge.svg',
    description: (
      <>
        Check all the things! We take testing seriously so you know your
        payments will go through the first time.
      </>
    )
  },
  {
    title: 'Jamstack harmonized',
    imageUrl: 'img/music.svg',
    description: (
      <>
        We love stacking jam on our toast! Gatsby, NextJs, and raspberry
        flavours!
      </>
    )
  },
  {
    title: 'Serverless ready',
    imageUrl: 'img/database.svg',
    description: (
      <>
        Handle product validation and webhooks securely in the cloud with first
        class support for serverless integrations.
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
  const productImage = useBaseUrl('img/products.png')
  const frontendImage = useBaseUrl('img/front-end.png')
  const backendImage = useBaseUrl('img/serverless.png')

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
              npm install @stripe/stripe-js use-shopping-cart
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
        <section className={styles.features}>
          <div className="container">
            <div className={clsx('row', styles.row)}>
              {featuresRowOne.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
            <div className="row">
              {featuresRowTwo.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
        <section className={styles.codeSection}>
          <div className={styles.codeWrapper}>
            <div className={styles.codeText}>
              <h2>Get your products</h2>
              <p>
                Product data can come from any source; a headless CMS, pure
                JSON, the Stripe dashboard.
              </p>
            </div>
            <img
              className={styles.codeImage}
              src={productImage}
              alt="Image of the product JSON"
            />
          </div>
          <div className={styles.codeWrapper}>
            <div className={styles.codeText}>
              <h2>Create your frontend</h2>
              <p>Setup your cart, buy button, and connect with Stripe.</p>
            </div>
            <img
              className={styles.codeImage}
              src={frontendImage}
              alt="Image of the frontend of the website"
            />
          </div>
          <div className={styles.codeWrapper}>
            <div className={styles.codeText}>
              <h2>Validate using serverless</h2>
              <p>
                Securely handle the transaction in a serverless function which
                validates the products and redirects to Stripe checkout.
              </p>
            </div>
            <img
              className={styles.codeImage}
              src={backendImage}
              alt="Image of the backend of the website"
            />
          </div>
          <div className={styles.codeCTA}>
            <Link
              className={clsx('button button--primary button--lg')}
              to="https://github.com/dayhaysoos/use-shopping-cart/tree/master/examples"
            >
              Checkout full examples
            </Link>
          </div>
        </section>
        <section className={styles.creditSection}>
          <p>
            Built with ❤️ by{' '}
            <a href="https://github.com/dayhaysoos">Nick DeJesus</a> and{' '}
            <a href="/docs/contributors">contributors</a>
          </p>
        </section>
      </main>
    </Layout>
  )
}

export default Home
