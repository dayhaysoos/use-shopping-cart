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
            menuLinks {
              name
              link
            }
          }
        }
      }
    `
  )

  const siteMetadata = data.site.siteMetadata

  return siteMetadata
}
