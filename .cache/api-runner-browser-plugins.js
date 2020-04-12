module.exports = [{
      plugin: require('../node_modules/gatsby-plugin-mdx/gatsby-browser.js'),
      options: {"plugins":[{"resolve":"/Users/developerayo/projects/use-stripe-cart-documentation/node_modules/gatsby-remark-autolink-headers","id":"df380aaa-460e-51a2-8830-e6712dc1f436","name":"gatsby-remark-autolink-headers","version":"2.2.1","pluginOptions":{"plugins":[]},"nodeAPIs":[],"browserAPIs":["onInitialClientRender","shouldUpdateScroll"],"ssrAPIs":["onRenderBody"]},{"resolve":"/Users/developerayo/projects/use-stripe-cart-documentation/node_modules/gatsby-remark-images","id":"3626c0e0-58d4-5046-b0e5-cb7731a052f2","name":"gatsby-remark-images","version":"3.2.2","pluginOptions":{"plugins":[]},"nodeAPIs":[],"browserAPIs":["onRouteUpdate"],"ssrAPIs":[]}],"extensions":[".mdx",".md"],"gatsbyRemarkPlugins":["gatsby-remark-autolink-headers","gatsby-remark-embedder",{"resolve":"gatsby-remark-images","options":{"maxWidth":960,"withWebp":true,"linkImagesToOriginal":false}},"gatsby-remark-responsive-iframe","gatsby-remark-copy-linked-files"]},
    },{
      plugin: require('../node_modules/gatsby-remark-autolink-headers/gatsby-browser.js'),
      options: {"plugins":[]},
    },{
      plugin: require('../node_modules/gatsby-remark-images/gatsby-browser.js'),
      options: {"plugins":[]},
    },{
      plugin: require('../node_modules/gatsby-plugin-catch-links/gatsby-browser.js'),
      options: {"plugins":[]},
    },{
      plugin: require('../node_modules/@rocketseat/gatsby-theme-docs/gatsby-browser.js'),
      options: {"plugins":[],"configPath":"src/config","docsPath":"src/docs","githubUrl":"https://github.com/rocketseat/gatsby-themes","baseDir":"examples/gatsby-theme-docs"},
    },{
      plugin: require('../node_modules/gatsby-plugin-manifest/gatsby-browser.js'),
      options: {"plugins":[],"name":"Rocketseat Gatsby Themes","short_name":"RS Gatsby Themes","start_url":"/","background_color":"#ffffff","display":"standalone","icon":"static/favicon.png"},
    },{
      plugin: require('../node_modules/gatsby-plugin-google-analytics/gatsby-browser.js'),
      options: {"plugins":[]},
    },{
      plugin: require('../node_modules/gatsby-plugin-canonical-urls/gatsby-browser.js'),
      options: {"plugins":[],"siteUrl":"https://rocketdocs.netlify.com"},
    },{
      plugin: require('../node_modules/gatsby-plugin-offline/gatsby-browser.js'),
      options: {"plugins":[]},
    }]
