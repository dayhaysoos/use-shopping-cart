import { useStaticQuery, graphql } from "gatsby"
export const useStripeProducts = () => {
  const data = useStaticQuery(
    graphql`
      query StripeProductQuery {
        allStripePrice(
          filter: { type: { eq: "one_time" }, active: { eq: true } }
        ) {
          nodes {
            id
            active
            unit_amount
            type
            currency
            product {
              id
              name
              description
              localFiles {
                childImageSharp {
                  gatsbyImageData(aspectRatio: 1)
                }
              }
            }
          }
        }
      }
    `
  )

  const rawProducts = data.allStripePrice.nodes

  const products = rawProducts.map(node => ({
    name: node.product.name,
    description: node.product.description,
    price_id: node.id,
    price: node.unit_amount,
    image: node.product.localFiles[0].childImageSharp.gatsbyImageData,
    currency: node.currency,
  }))

  return products
}
