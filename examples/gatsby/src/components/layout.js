import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'

import Header from './header'
import './layout.css'
import stripeLogo from '../images/powered_by_stripe.svg'

import '@stripe/stripe-js' // https://github.com/stripe/stripe-js#import-as-a-side-effect

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={(data) => (
      <>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div
          style={{
            margin: `0 auto`,
            maxWidth: 960,
            padding: `0px 1.0875rem 1.45rem`,
            paddingTop: 0,
          }}
        >
          {children}
          <footer>
            <div>
              © 2019, Built by <a href="https://twitter.com/thorwebdev">Thor</a>{' '}
              with <a href="https://www.gatsbyjs.org">Gatsby</a> | View{' '}
              <a href="https://github.com/dayhaysoos/use-shopping-cart/tree/master/examples/gatsby">
                source
              </a>
            </div>
            <div>
              <a href="https://stripe.com">
                <img src={stripeLogo} alt="Payments powered by Stripe" />
              </a>
            </div>
          </footer>
        </div>
      </>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
