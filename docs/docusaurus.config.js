module.exports = {
  title: 'Use Shopping Cart',
  tagline: 'Shopping Cart State and Logic for Stripe',
  url: 'https://useshoppingcart.com/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'dayhaysoos', // Usually your GitHub org/user name.
  projectName: 'use-shopping-cart', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Use Shopping Cart',
      logo: {
        alt: 'Use Shopping Cart Logo',
        src: 'img/usc-logo.png'
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/'
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus'
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus'
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus'
            }
          ]
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
}
