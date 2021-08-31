import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { useShoppingCart } from "use-shopping-cart"
import { useSiteMetadata } from "../hooks/useSiteMetadata"

const Header = () => {
  const { title } = useSiteMetadata()
  const { cartCount, handleCartClick } = useShoppingCart()

  return (
    <header>
      <div className="branding">
        <div className="logo">
          <Link to="/">
            <StaticImage
              src="../images/usc-logo-512.png"
              width={150}
              quality={95}
              formats={["AUTO", "WEBP", "AVIF"]}
              alt="Use Shopping Cart logo"
            />
          </Link>
        </div>
        <span className="siteTitle">
          <Link to="/">{title}</Link>
        </span>
      </div>
      <div className="cartButtonWrapper">
        <button onClick={() => handleCartClick()}>Cart({cartCount})</button>
      </div>
    </header>
  )
}

export default Header
