/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import PropTypes from "prop-types"
import { useShoppingCart } from "use-shopping-cart"
import Header from "./header"
import Footer from "./footer"
import Cart from "./cart"
import "./modern-css-reset.css"
import "./style.css"

const Layout = ({ children }) => {
  const { shouldDisplayCart } = useShoppingCart()
  return (
    <div className="siteContainer">
      <Header />
      {shouldDisplayCart ? <Cart /> : null}
      <main>{children}</main>
      <Footer />
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
