module.exports = {
  siteMetadata: {
    siteTitle: `use-shopping-cart`,
    defaultTitle: `use-shopping-cart`,
    siteTitleShort: `use-shopping-cart`,
    siteDescription:
      'React Hooks library for your Stripe powered shopping cart needs!',
    siteUrl: `https://use-shopping-cart.netlify.app/`,
    siteAuthor: `use-shopping-cart`,
    siteImage: `src/images/banner.png`,
    siteLanguage: `en`,
    themeColor: `#7159c1`,
    basePath: `/`,
    footer: `use-shopping-cart`
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `@rocketseat/gatsby-theme-docs`,
      options: {
        configPath: `src/config`,
        docsPath: `src/docs`,
        githubUrl: `https://github.com/rocketseat/gatsby-themes`,
        baseDir: `examples/gatsby-theme-docs`
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `use-shopping-cart`,
        short_name: `use-shopping-cart`,
        start_url: `/`,
        background_color: `#ffffff`,
        display: `standalone`,
        icon: `src/images/icon.png`
      }
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-165110403-1`
      }
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://use-shopping-cart.netlify.app`
      }
    },
    `gatsby-plugin-offline`
  ]
}
