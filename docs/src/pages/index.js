import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './index.module.css'
import Hero from '../components/landing-page/hero'
import Feature from '../components/landing-page/feature'
import Explainer from '../components/landing-page/explainer'
import Credits from '../components/landing-page/credits'

const Home = () => {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context

  const exampleCode = `
(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})`

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Use Shopping Cart is a hooks library for Stripe checkout to provide an API first way of managing shopping cart state and logic. Handles one time purchases, subscriptions, and logic."
    >
      <Hero />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className={clsx('row', styles.featuresRow)}>
              <Feature
                title="Security first"
                imageUrl="img/padlock.svg"
                description="Backed by world class payment solutions from Stripe you can be sure your transactions are secure and trusted."
              />
              <Feature
                title="Developer friendly API"
                imageUrl="img/api.svg"
                description="Abstract away the complexity of working with Stripe so that you can focus the products your customers love!"
              />
              <Feature
                title="Framework agnostic"
                imageUrl="img/beaker.svg"
                description="Whether you are using React, Vue, Svelte or any other framework Use-Shopping-Cart has got your back!"
              />
            </div>
            <div className={clsx('row', styles.featuresRow)}>
              <Feature
                title="Fully tested"
                imageUrl="img/check-badge.svg"
                description="Check all the things! We take testing seriously so you know your payments will go through the first time."
              />
              <Feature
                title="Jamstack harmonized"
                imageUrl="img/music.svg"
                description="We love stacking jam on our toast! Next.js, Gatsby and raspberry flavours!"
              />
              <Feature
                title="Serverless ready"
                imageUrl="img/database.svg"
                description="Handle product validation and webhooks securely in the cloud with first class support for serverless functions."
              />
            </div>
          </div>
        </section>
        <section className={styles.explainers}>
          <Explainer
            title="Wrap your app"
            description="Use the <CartProvider> component to provide global shopping cart state."
            code={exampleCode}
          />
          <Explainer
            title="Get your products"
            description="Product data can come from any source; a headless CMS, pure JSON, the Stripe dashboard."
            code={exampleCode}
          />
          <Explainer
            title="Create your frontend"
            description="Setup your cart, buy button, and connect with Stripe."
            code={exampleCode}
          />
          <Explainer
            title="Validate the purchase"
            description="Securely handle the transaction in a serverless function to
                validate the products and redirect to Stripe checkout."
            code={exampleCode}
          />
          <div className={styles.explainersCta}>
            <Link
              className={clsx('button button--primary button--lg')}
              to="https://github.com/dayhaysoos/use-shopping-cart/tree/master/examples"
            >
              Checkout full examples
            </Link>
          </div>
        </section>
        <section className={styles.credits}>
          <Credits />
        </section>
      </main>
    </Layout>
  )
}

export default Home
