module.exports = {
  title: 'USE-SHOPPING-CART',
  tagline: 'Shopping cart state and logic for Stripe checkout',
  url: 'https://useshoppingcart.com/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.png',
  organizationName: 'dayhaysoos', // Usually your GitHub org/user name.
  projectName: 'use-shopping-cart', // Usually your repo name.
  themeConfig: {
    colorMode: {
      // "light" | "dark"
      defaultMode: 'light',

      // Hides the switch in the navbar
      // Useful if you want to support a single color mode
      disableSwitch: true,

      // Should we use the prefers-color-scheme media-query,
      // using user system preferences, instead of the hardcoded defaultMode
      respectPrefersColorScheme: false
    },
    navbar: {
      title: 'Use Shopping Cart',
      logo: {
        alt: 'Use Shopping Cart Logo',
        src: 'img/usc-logo.png'
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs/',
          label: 'Get Started',
          position: 'left'
        },
        {
          to: 'docs/usage/components/cart-provider',
          activeBasePath: 'docs/usage/components/cart-provider',
          label: 'Docs',
          position: 'left'
        },
        {
          to: 'https://github.com/dayhaysoos/use-shopping-cart',
          activeBasePath: 'docs',
          label: 'GitHub',
          position: 'right'
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
              label: 'Introduction',
              to: 'docs/introduction'
            },
            {
              label: 'Getting Started',
              to: 'docs/getting-started'
            }
          ]
        },
        {},
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/dayhaysoos/use-shopping-cart'
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/TNQfW4W'
            }
          ]
        }
      ],
      copyright: `MIT License`
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/dayhaysoos/use-shopping-cart'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
}
