module.exports = {
  siteMetadata: {
    siteTitle: `use-shopping-cart`,
    defaultTitle: `use-shopping-cart`,
    siteTitleShort: `use-shopping-cart`,
    siteDescription:
      'React Hooks library for your Stripe powered shopping cart needs!',
    siteUrl: `https://useshoppingcart.com`,
    siteAuthor: `use-shopping-cart`,
    siteImage: `/banner.png`,
    siteLanguage: `en`,
    themeColor: `#7159c1`,
    basePath: `/`,
    footer: `use-shopping-cart`
  },
  plugins: [
    {
      resolve: `@rocketseat/gatsby-theme-docs`,
      options: {
        configPath: `src/config`,
        docsPath: `src/docs`,
        githubUrl: `https://github.com/dayhaysoos/use-shopping-cart/`,
        baseDir: `documentation`
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
        icon: `static/favicon.png`,
        icons: [
          {
            src: "/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            src: "/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "/logo.png",
            sizes: "100x100",
            type: "image/png",
          },
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
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
