/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import PropTypes from "prop-types"
import { Helmet } from "react-helmet"
import { useSiteMetadata } from "../hooks/use-site-metadata"

const Seo = ({ description, lang, meta, title, keywords }) => {
  const {
    title: metadataTitle,
    description: metadataDescription,
    author: metadataAuthor,
    keywords: metadataKeywords,
  } = useSiteMetadata()

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={metadataTitle ? `%s | ${metadataTitle}` : null}
      meta={[
        {
          name: `description`,
          content: description || metadataDescription,
        },
        {
          name: `keywords`,
          content:
            keywords.length > 0
              ? keywords.join(`, `)
              : metadataKeywords.join(`, `),
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metadataDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: metadataAuthor || ``,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metadataDescription,
        },
      ].concat(meta)}
    />
  )
}

Seo.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
  keywords: [],
}

Seo.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  keywords: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
}

export default Seo
