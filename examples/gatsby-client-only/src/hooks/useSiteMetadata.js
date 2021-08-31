import { useStaticQuery, graphql } from "gatsby"
export const useSiteMetadata = () => {
  const data = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            title
            description
            keywords
            author
            siteUrl
          }
        }
      }
    `
  )

  const siteMetadata = data.site.siteMetadata

  return siteMetadata
}
