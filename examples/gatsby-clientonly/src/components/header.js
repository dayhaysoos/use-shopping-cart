import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { useShoppingCart } from "use-shopping-cart"
import { useSiteMetadata } from "../hooks/use-site-metadata"

const Header = () => {
  const { title, menuLinks } = useSiteMetadata()
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
      <nav>
        <ul>
          {menuLinks.map(link => (
            <li key={link.link}>
              <Link to={link.link}>{link.name}</Link>
            </li>
          ))}
          <li>
            <button onClick={() => handleCartClick()}>Cart({cartCount})</button>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
